import { HostEvent, AnomalyData, AnomalyAdjustment, getVendorCost } from '../types/host.ts';

/**
 * Configuration constants for cultural scaling and financial calculations.
 */
export const ASSISTANT_CONFIG = {
  MICRO_BUDGET_THRESHOLD: 25000,
  GRAND_BUDGET_THRESHOLD: 500000,
  MICRO_GUEST_THRESHOLD: 25,
  PER_GUEST_CATERING: {
    MICRO: 350,
    STANDARD: 750,
    GRAND: 1600,
  },
  DEFAULT_DROP_PERCENT: 10,
  DEFAULT_MICRO_GUEST_SURGE: 5,
  DEFAULT_STANDARD_GUEST_SURGE: 25,
  MAX_VENDOR_CUT_RATIO: 0.4,
  VENDOR_REDUCTION_SHARES: [0.45, 0.35, 0.2] as const,
} as const;

/**
 * Structured API response format returned by assistant endpoints and fallback engine.
 */
export interface AssistantApiResponse {
  /** Natural language reply with strategic recommendations */
  reply: string;
  /** Flag indicating whether the query represented a budget or guest anomaly */
  isAnomaly: boolean;
  /** Anomaly data payload containing calculated deficit and cuts */
  anomalyData?: AnomalyData | null;
}

/**
 * Pure calculation helper to evaluate scale-adaptive financial deficit and generate vendor cuts.
 */
export function calculateAnomalyShock(
  message: string,
  event: HostEvent
): AssistantApiResponse {
  const currentCap = event.totalBudget || 50000;
  const guestCount = event.guestCount || 25;
  const isMicro =
    currentCap <= ASSISTANT_CONFIG.MICRO_BUDGET_THRESHOLD ||
    guestCount <= ASSISTANT_CONFIG.MICRO_GUEST_THRESHOLD;
  const isGrand = currentCap >= ASSISTANT_CONFIG.GRAND_BUDGET_THRESHOLD;

  // 1. Parse guest count delta
  let guestDelta: number = isMicro
    ? ASSISTANT_CONFIG.DEFAULT_MICRO_GUEST_SURGE
    : ASSISTANT_CONFIG.DEFAULT_STANDARD_GUEST_SURGE;
  const guestMatch =
    message.match(/(\d+)\s*(more|extra|additional|guests)/i) ||
    message.match(/up by\s*(\d+)/i);
  if (guestMatch) {
    guestDelta = parseInt(guestMatch[1] || guestMatch[2], 10) || guestDelta;
  }

  // 2. Parse budget drop percent
  let dropPercent: number = ASSISTANT_CONFIG.DEFAULT_DROP_PERCENT;
  const percentMatch = message.match(/(\d+)%/);
  if (percentMatch) {
    dropPercent = parseInt(percentMatch[1], 10);
  }

  const budgetLoss = Math.round((currentCap * dropPercent) / 100);
  const perGuestRate = isMicro
    ? ASSISTANT_CONFIG.PER_GUEST_CATERING.MICRO
    : isGrand
    ? ASSISTANT_CONFIG.PER_GUEST_CATERING.GRAND
    : ASSISTANT_CONFIG.PER_GUEST_CATERING.STANDARD;
  const additionalGuestCost = guestDelta * perGuestRate;
  const totalDeficit = budgetLoss + additionalGuestCost;
  const newBudgetCap = Math.max(0, currentCap - budgetLoss);

  // 3. Formulate vendor cost cuts
  const vendorAdjustments: AnomalyAdjustment[] = [];
  const recommendations: string[] = [];

  if (event.vendors && event.vendors.length > 0) {
    const sortedByCost = [...event.vendors].sort(
      (a, b) => getVendorCost(b) - getVendorCost(a)
    );
    const targetVendors = sortedByCost.slice(0, 3);

    targetVendors.forEach((vendor, i) => {
      const share =
        ASSISTANT_CONFIG.VENDOR_REDUCTION_SHARES[i] ?? 0.2;
      const vendorCurrentCost = getVendorCost(vendor);
      const proposedCut = Math.min(
        Math.round(totalDeficit * share),
        Math.round(vendorCurrentCost * ASSISTANT_CONFIG.MAX_VENDOR_CUT_RATIO)
      );
      const newCost = Math.max(0, vendorCurrentCost - proposedCut);
      const actualCut = vendorCurrentCost - newCost;

      if (actualCut > 0) {
        let rationale = '';
        const cat = vendor.category.toLowerCase();
        if (cat.includes('decor')) {
          rationale = isMicro
            ? 'Substitute rented props with warm ambient LED fairy strings and personal polaroid picture lines.'
            : 'Switch exotic lilies/orchids to local seasonal marigold and tuberoses; repurpose evening photobooth for morning rituals.';
        } else if (cat.includes('cater') || cat.includes('food')) {
          rationale = isMicro
            ? 'Switch from individual meal boxes to a bulk community biryani handi / family platter.'
            : 'Prune 3 redundant grazing stations and hold strict 48-hr head-count audit with the caterer.';
        } else {
          rationale =
            'Negotiate package deliverables and transition physical print invitations to instant WhatsApp concierge links.';
        }

        vendorAdjustments.push({
          vendorId: vendor.id,
          name: vendor.name,
          category: vendor.category,
          cutAmount: actualCut,
          newCost: newCost,
          newActualCost: newCost,
          rationale,
        });
        recommendations.push(
          `${vendor.name} (${vendor.category}): Trim ₹${actualCut.toLocaleString('en-IN')} : ${rationale}`
        );
      }
    });
  }

  const totalCuts = vendorAdjustments.reduce((sum, v) => sum + v.cutAmount, 0);

  const reply = `**Plan Anomaly Calculated for ${event.name}**

- **Guest Count Surge:** +${guestDelta} attendees (estimated catering demand: ₹${additionalGuestCost.toLocaleString('en-IN')})
- **Budget Drop:** ${dropPercent}% (loss of ₹${budgetLoss.toLocaleString('en-IN')})
- **Net Deficit to Recover:** ₹${totalDeficit.toLocaleString('en-IN')}
- **New Proposed Budget Cap:** ₹${newBudgetCap.toLocaleString('en-IN')}

**Practical Places to Absorb Shock Without Hurting Guest Hospitality:**
${recommendations.length > 0 ? recommendations.map((r, idx) => `${idx + 1}. ${r}`).join('\n') : '1. Opt for bulk food catering instead of individual per-plate premiums.\n2. Use ambient fairy lighting & brass urulis over synthetic decor.\n3. Digitize invitations & track plate wastage.'}

Total proposed rebalancing: **₹${totalCuts.toLocaleString('en-IN')}**. Click **Apply Changes** below to immediately update the ledger.`;

  return {
    reply,
    isAnomaly: true,
    anomalyData: {
      calculatedDeficit: totalDeficit,
      guestCountDelta: guestDelta,
      budgetDropPercent: dropPercent,
      newBudgetCap,
      recommendations,
      vendorAdjustments,
    },
  };
}

/**
 * Pure helper for culturally authentic decor ideation based on budget scale.
 */
export function generateDecorRecommendations(
  event: HostEvent,
  isMicro: boolean,
  currentCap: number
): AssistantApiResponse {
  if (isMicro) {
    return {
      reply: `Here are 3 minimal, high-aesthetic decor concepts tailored for an intimate ${event.name} (₹${currentCap.toLocaleString('en-IN')} budget):

1. **Warm Amber Fairy Lights & Polaroid Grid**
   Drape micro-LED warm fairy lights against an accent wall or terrace railing with mini wooden clips holding nostalgic printed photos of guests. Cost: ~₹1,200.

2. **Monochrome Fresh Citrus & Glass Jars**
   Cluster mason jars or recycled clear glass bottles with single stems of baby's breath and fresh cut lemons/oranges on tables for an effortless European-bistro look.

3. **Brass Diya & Marigold Petal Urulis**
   Float fresh yellow marigold petals and tea lights in 2 brass or terracotta bowls at the entryway. Zero plastic, 100% biodegradable, aromatic.`,
      isAnomaly: false,
    };
  }

  return {
    reply: `Here are 3 culturally refined decor strategies for ${event.name} (₹${currentCap.toLocaleString('en-IN')} budget):

1. **Indigenous Marigold & Tuberose Staging**
   Dense yellow & orange marigold curtains paired with fragrant rajnigandha (tuberose) garlands. Striking impact, zero imported cold-storage flower wastage.

2. **Heritage Bell Metal & Terracotta Lighting**
   Repurpose hanging brass bells, deep clay oil lamps, and warm filament bulbs instead of blinding floodlights to create an intimate, regal evening courtyard atmosphere.

3. **Dual-Use Stage Backdrops**
   Design a modular wooden floral lattice that serves as the daytime Haldi backdrop and transitions into the evening acoustic sangeet stage with warm wash lights.`,
    isAnomaly: false,
  };
}

/**
 * Pure helper for catering, plate leakage audits, and food procurement advice.
 */
export function generateCateringRecommendations(
  event: HostEvent,
  isMicro: boolean,
  currentCap: number,
  guestCount: number
): AssistantApiResponse {
  if (isMicro) {
    return {
      reply: `Catering & food tactics for ${event.name} (${guestCount} guests, ₹${currentCap.toLocaleString('en-IN')} budget):

1. **Curated Handi Feast:** Order 2 large clay handis of artisanal dum biryani (veg & non-veg) with cold boondi raita and mirchi ka salan instead of ordering scattered dishes.
2. **Signature Street Chaat Box:** Boxed assortment of dahi bhallas, samosas, and mint chutney for hassle-free grazing without servers.
3. **Home Baker Photo Cake:** Partner with a neighborhood home baker for a 1.5kg bento or vintage lambeth cake instead of factory commercial bakery cakes.`,
      isAnomaly: false,
    };
  }

  return {
    reply: `Strategic catering & plate audit playbook for ${event.name}:

1. **Plate Pilferage Clicker:** Assign one trusted family cousin at the buffet entrance with a digital hand tally counter. Caterers routinely bill 15-20% extra phantom plates without physical count proof.
2. **Cut Redundant Buffet Tiers:** Replace 8 lukewarm gravy pans with 3 distinctive regional live stations (e.g. freshly pressed roomali rolls or hot jalebi-rabdi). Guests remember live sizzle, not cold buffets.
3. **Mithai Box Negotiation:** Procure traditional sweets (kaju katli, laddoos) directly from trusted old-city halwais in bulk wholesale rather than through the banquet caterer's 30% marked-up package.`,
    isAnomaly: false,
  };
}

/**
 * Pure helper for shopping, wedding cards, attire, and return gifts.
 */
export function generateShoppingRecommendations(event: HostEvent): AssistantApiResponse {
  return {
    reply: `Essential shopping & invitations advisory for ${event.name}:

1. **Digital Interactive Passes Over Boxed Invites:** Physical card boxes with dry fruits cost ₹400-₹1,200/card. A custom animated WhatsApp pass with Google Map pins and RSVP tracking saves up to 80% without losing prestige.
2. **Return Gift Curation (Shagun):** Brass miniature diya sets, organic seed paper bookmarks, or artisan glass jars of royal cardamom mukhwas leave a much better impression than generic synthetic gifts.
3. **Garment Shopping Timelines:** For bespoke attire (lehengas/sherwanis), finalize fittings at least 4 weeks out. Factor in 1 week buffer for unforeseen alteration delays.`,
    isAnomaly: false,
  };
}

/**
 * Pure helper for default celebration ledger audit summary.
 */
export function generateLedgerAuditSummary(event: HostEvent): AssistantApiResponse {
  const totalCost = event.vendors.reduce((s, v) => s + getVendorCost(v), 0);
  const openTasks = event.tasks.filter((t) => !t.completed).length;

  return {
    reply: `I have audited the ledger and logistics for **${event.name}**:

- **Budget Cap:** ₹${event.totalBudget.toLocaleString('en-IN')} (Total Cost: ₹${totalCost.toLocaleString('en-IN')})
- **Scale:** ${event.guestCount} attendees • ${event.vendors.length} items tracked
- **Pending Tasks:** ${openTasks} open

Ask me for:
- *"3 minimal decor ideas for ${event.name}"*
- *"How to audit catering plate counts for ${event.guestCount} guests"*
- *"Guest count surged by 30 and budget dropped by 15%"* (calculates exact deficit and proposes cuts)
- *"Shopping and card printing tips for this budget"*`,
    isAnomaly: false,
  };
}

/**
 * Applies structured anomaly adjustments to a celebration ledger immutably.
 *
 * @param event Target celebration state
 * @param anomalyData Calculated anomaly modifications
 * @returns Updated celebration state
 */
export function applyAnomalyAdjustments(
  event: HostEvent,
  anomalyData: AnomalyData
): HostEvent {
  const newBudget = Number(anomalyData.newBudgetCap) || event.totalBudget;
  const newGuestCount = anomalyData.guestCountDelta
    ? Math.max(1, event.guestCount + (Number(anomalyData.guestCountDelta) || 0))
    : event.guestCount;

  const adjustmentsMap = new Map<string, number>();
  (anomalyData.vendorAdjustments || []).forEach((adj) => {
    const cutSafe = Math.max(0, Number(adj.newCost ?? adj.newActualCost) || 0);
    if (adj.vendorId) {
      adjustmentsMap.set(adj.vendorId, cutSafe);
    } else {
      const match = event.vendors.find(
        (v) =>
          v.name.toLowerCase().includes(adj.name.toLowerCase()) ||
          (adj.category && v.category.toLowerCase().includes(adj.category.toLowerCase()))
      );
      if (match) {
        adjustmentsMap.set(match.id, cutSafe);
      }
    }
  });

  const updatedVendors = event.vendors.map((vendor) => {
    if (adjustmentsMap.has(vendor.id)) {
      const newCost = adjustmentsMap.get(vendor.id)!;
      return {
        ...vendor,
        cost: newCost,
        actualCost: newCost,
        estimatedCost: newCost,
      };
    }
    return vendor;
  });

  return {
    ...event,
    totalBudget: newBudget,
    guestCount: newGuestCount,
    vendors: updatedVendors,
  };
}

/**
 * Main dispatcher for deterministic offline assistant requests.
 *
 * @param message Raw host prompt
 * @param event Current active celebration state
 * @returns AssistantApiResponse
 */
export function processAssistantOffline(
  message: string,
  event: HostEvent
): AssistantApiResponse {
  const lower = message.toLowerCase();
  const currentCap = event.totalBudget || 50000;
  const guestCount = event.guestCount || 25;
  const isMicro =
    currentCap <= ASSISTANT_CONFIG.MICRO_BUDGET_THRESHOLD ||
    guestCount <= ASSISTANT_CONFIG.MICRO_GUEST_THRESHOLD;

  // 1. Detect anomaly / budget / guest shock patterns
  const isGuestSurge =
    lower.includes('guest') &&
    (lower.includes('up') ||
      lower.includes('more') ||
      lower.includes('+') ||
      lower.includes('increase') ||
      lower.includes('surge') ||
      lower.includes('extra'));
  const isBudgetDrop =
    lower.includes('budget') &&
    (lower.includes('drop') ||
      lower.includes('cut') ||
      lower.includes('less') ||
      lower.includes('down') ||
      lower.includes('decrease') ||
      lower.includes('%'));
  const isGeneralAnomaly =
    isGuestSurge ||
    isBudgetDrop ||
    lower.includes('deficit') ||
    lower.includes('shock') ||
    lower.includes('shortage') ||
    lower.includes('cut');

  if (isGeneralAnomaly) {
    return calculateAnomalyShock(message, event);
  }

  // 2. Ideas: Decor / Floral
  if (
    lower.includes('decor') ||
    lower.includes('floral') ||
    lower.includes('theme') ||
    /\bstage\b/.test(lower)
  ) {
    return generateDecorRecommendations(event, isMicro, currentCap);
  }

  // 3. Ideas: Food / Catering / Halwai / Plates
  if (
    lower.includes('food') ||
    lower.includes('cater') ||
    lower.includes('menu') ||
    lower.includes('plate') ||
    lower.includes('sweet')
  ) {
    return generateCateringRecommendations(event, isMicro, currentCap, guestCount);
  }

  // 4. Ideas: Shopping / Wedding Cards / Lehengas / Gifts
  if (
    lower.includes('shop') ||
    lower.includes('card') ||
    lower.includes('invite') ||
    lower.includes('dress') ||
    lower.includes('lehenga') ||
    lower.includes('gift')
  ) {
    return generateShoppingRecommendations(event);
  }

  // Default intelligent response
  return generateLedgerAuditSummary(event);
}

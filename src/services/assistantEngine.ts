import { HostEvent, AnomalyData, AnomalyAdjustment, getVendorCost } from '../types/host.ts';

export interface AssistantApiResponse {
  reply: string;
  isAnomaly: boolean;
  anomalyData?: AnomalyData | null;
}

export function processAssistantOffline(
  message: string,
  event: HostEvent
): AssistantApiResponse {
  const lower = message.toLowerCase();
  const currentCap = event.totalBudget || 50000;
  const guestCount = event.guestCount || 25;
  const isMicro = currentCap <= 25000 || guestCount <= 25;
  const isGrand = currentCap >= 500000;

  // 1. Detect anomaly / budget / guest shock patterns
  const isGuestSurge =
    lower.includes('guest') &&
    (lower.includes('up') || lower.includes('more') || lower.includes('+') || lower.includes('increase') || lower.includes('surge') || lower.includes('extra'));
  const isBudgetDrop =
    lower.includes('budget') &&
    (lower.includes('drop') || lower.includes('cut') || lower.includes('less') || lower.includes('down') || lower.includes('decrease') || lower.includes('%'));
  const isGeneralAnomaly =
    isGuestSurge || isBudgetDrop || lower.includes('deficit') || lower.includes('shock') || lower.includes('shortage') || lower.includes('cut');

  if (isGeneralAnomaly) {
    // Parse guest count delta
    let guestDelta = isMicro ? 5 : 25;
    const guestMatch = message.match(/(\d+)\s*(more|extra|additional|guests)/i) || message.match(/up by\s*(\d+)/i);
    if (guestMatch) {
      guestDelta = parseInt(guestMatch[1] || guestMatch[2], 10) || guestDelta;
    }

    // Parse budget drop percent
    let dropPercent = 10;
    const percentMatch = message.match(/(\d+)%/);
    if (percentMatch) {
      dropPercent = parseInt(percentMatch[1], 10);
    }

    const budgetLoss = Math.round((currentCap * dropPercent) / 100);
    // Dynamic per-head cost based on scale: micro event (~₹250-₹400/head snacks), grand wedding (~₹1,500/head)
    const perGuestCatering = isMicro ? 350 : isGrand ? 1600 : 750;
    const additionalGuestCost = guestDelta * perGuestCatering;
    const totalDeficit = budgetLoss + additionalGuestCost;
    const newBudgetCap = Math.max(0, currentCap - budgetLoss);

    // Build intelligent vendor cost cuts
    const vendorAdjustments: AnomalyAdjustment[] = [];
    const recommendations: string[] = [];

    if (event.vendors.length > 0) {
      // Find flexible categories: Decor, Stationery, Sound, or secondary vendor
      const sortedByCost = [...event.vendors].sort((a, b) => getVendorCost(b) - getVendorCost(a));
      const targetVendors = sortedByCost.slice(0, 3);

      targetVendors.forEach((vendor, i) => {
        const share = i === 0 ? 0.45 : i === 1 ? 0.35 : 0.2;
        const vendorCurrentCost = getVendorCost(vendor);
        const proposedCut = Math.min(
          Math.round(totalDeficit * share),
          Math.round(vendorCurrentCost * 0.4)
        );
        const newCost = Math.max(0, vendorCurrentCost - proposedCut);
        const actualCut = vendorCurrentCost - newCost;

        if (actualCut > 0) {
          let rationale = '';
          if (vendor.category.toLowerCase().includes('decor')) {
            rationale = isMicro
              ? 'Substitute rented props with warm ambient LED fairy strings and personal polaroid picture lines.'
              : 'Switch exotic lilies/orchids to local seasonal marigold and tuberoses; repurpose evening photobooth for morning rituals.';
          } else if (vendor.category.toLowerCase().includes('cater') || vendor.category.toLowerCase().includes('food')) {
            rationale = isMicro
              ? 'Switch from individual meal boxes to a bulk community biryani handi / family platter.'
              : 'Prune 3 redundant grazing stations and hold strict 48-hr head-count audit with the caterer.';
          } else {
            rationale = 'Negotiate package deliverables and transition physical print invitations to instant WhatsApp concierge links.';
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
          recommendations.push(`${vendor.name} (${vendor.category}): Trim ₹${actualCut.toLocaleString('en-IN')} - ${rationale}`);
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

  // 2. Ideas: Decor / Floral
  if (lower.includes('decor') || lower.includes('floral') || lower.includes('theme') || /\bstage\b/.test(lower)) {
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

  // 3. Ideas: Food / Catering / Halwai / Plates
  if (lower.includes('food') || lower.includes('cater') || lower.includes('menu') || lower.includes('plate') || lower.includes('sweet')) {
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

  // 4. Ideas: Shopping / Wedding Cards / Lehengas / Gifts
  if (lower.includes('shop') || lower.includes('card') || lower.includes('invite') || lower.includes('dress') || lower.includes('lehenga') || lower.includes('gift')) {
    return {
      reply: `Essential shopping & invitations advisory for ${event.name}:

1. **Digital Interactive Passes Over Boxed Invites:** Physical card boxes with dry fruits cost ₹400-₹1,200/card. A custom animated WhatsApp pass with Google Map pins and RSVP tracking saves up to 80% without losing prestige.
2. **Return Gift Curation (Shagun):** Brass miniature diya sets, organic seed paper bookmarks, or artisan glass jars of royal cardamom mukhwas leave a much better impression than generic synthetic gifts.
3. **Garment Shopping Timelines:** For bespoke attire (lehengas/sherwanis), finalize fittings at least 4 weeks out. Factor in 1 week buffer for unforeseen alteration delays.`,
      isAnomaly: false,
    };
  }

  // Default intelligent response
  return {
    reply: `I have audited the ledger and logistics for **${event.name}**:

- **Budget Cap:** ₹${event.totalBudget.toLocaleString('en-IN')} (Total Cost: ₹${event.vendors.reduce((s, v) => s + getVendorCost(v), 0).toLocaleString('en-IN')})
- **Scale:** ${event.guestCount} attendees • ${event.vendors.length} items tracked
- **Pending Tasks:** ${event.tasks.filter((t) => !t.completed).length} open

Ask me for:
- *"3 minimal decor ideas for ${event.name}"*
- *"How to audit catering plate counts for ${event.guestCount} guests"*
- *"Guest count surged by 30 and budget dropped by 15%"* (calculates exact deficit and proposes cuts)
- *"Shopping and card printing tips for this budget"*`,
    isAnomaly: false,
  };
}

import {
  BudgetItem,
  TradeOffPlan,
  InterrogatedQuote,
  EventPreset,
  ShagunEntry,
} from '../types/index.ts';
import { formatRupees, sanitizeInput } from '../utils/sanitize.ts';

export interface ParsedCommandResult {
  actionType: 'VENDOR_PAYMENT' | 'GUEST_HEADCOUNT' | 'CATERER_PLATE' | 'TASK_STATUS' | 'SHAGUN_ENTRY' | 'UNKNOWN';
  toastMessage: string;
  mutations: {
    vendorPayment?: {
      vendorIdOrName: string;
      amountPaid: number;
      paymentMode?: string;
    };
    guestAdjustment?: {
      deltaGuests: number;
      isNonVegDelta?: number;
      isDrinkingDelta?: number;
    };
    catererPlates?: {
      claimedPlates: number;
    };
    taskStatus?: {
      taskQuery: string;
      newStatus: 'DONE' | 'IN_PROGRESS' | 'DELAYED' | 'VENDOR_CANCELLED';
      delayDays?: number;
    };
    shagun?: {
      guestName: string;
      amount: number;
      mode: 'CASH' | 'UPI';
    };
  };
}

/**
 * Deterministic offline natural language parser
 */
export function parseNaturalCommandOffline(
  rawInput: string,
  state: EventPreset
): ParsedCommandResult {
  const text = sanitizeInput(rawInput).toLowerCase();

  // 1. Shagun / Gift patterns: "received 21k shagun from ramesh uncle" or "shagun 51000 from kapoor family"
  if (text.includes('shagun') || text.includes('envelope') || text.includes('gift')) {
    const amtMatch = text.match(/(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:k|thousand|lakh|lac)?/i);
    let amount = 0;
    if (amtMatch) {
      amount = parseHumanRupee(amtMatch[0]);
    }
    const mode = text.includes('upi') || text.includes('gpay') || text.includes('paytm') ? 'UPI' : 'CASH';
    // extract name
    let name = 'Family Guest';
    const fromMatch = text.match(/from\s+([a-z\s]+?)(?:\s+(?:via|amount|by|in|\d|$))/i);
    if (fromMatch && fromMatch[1]) {
      name = fromMatch[1].trim().replace(/\b\w/g, (c) => c.toUpperCase());
    }

    if (amount > 0) {
      return {
        actionType: 'SHAGUN_ENTRY',
        toastMessage: `Recorded Shagun of ${formatRupees(amount)} from ${name} (${mode}) in the Envelope Book.`,
        mutations: {
          shagun: {
            guestName: name,
            amount,
            mode,
          },
        },
      };
    }
  }

  // 2. Caterer plate patterns: "+30 plates claimed" or "caterer claimed 225 plates"
  if (text.includes('plate') || text.includes('caterer claimed')) {
    const plateMatch = text.match(/(\d+)\s*(?:plates?|plate count)/i);
    if (plateMatch) {
      const plates = parseInt(plateMatch[1], 10);
      return {
        actionType: 'CATERER_PLATE',
        toastMessage: `Updated Caterer Claimed Count to ${plates} plates. Gate dispute recomputed.`,
        mutations: {
          catererPlates: {
            claimedPlates: plates,
          },
        },
      };
    }
  }

  // 3. Guest count adjustments: "+20 guests" or "15 more non-veg guests arrived"
  if (text.includes('guest') || text.includes('people') || text.includes('arrived')) {
    const deltaMatch = text.match(/([+-]?\d+)\s*(?:more\s+)?(?:guests?|people)/i);
    const count = deltaMatch ? parseInt(deltaMatch[1], 10) : 10;
    const isNonVeg = text.includes('non-veg') || text.includes('chicken') || text.includes('meat');
    const isDrink = text.includes('drink') || text.includes('beer') || text.includes('bar');

    return {
      actionType: 'GUEST_HEADCOUNT',
      toastMessage: `Adjusted guest count: +${Math.abs(count)} attendees (${isNonVeg ? 'Non-Veg' : 'Veg'}${isDrink ? ' + Bar' : ''}). Recomputed fair splits.`,
      mutations: {
        guestAdjustment: {
          deltaGuests: count,
          isNonVegDelta: isNonVeg ? count : 0,
          isDrinkingDelta: isDrink ? count : 0,
        },
      },
    };
  }

  // 4. Task status patterns: "venue booking delayed" or "soundcheck done"
  if (text.includes('delay') || text.includes('cancelled') || text.includes('done') || text.includes('completed')) {
    let newStatus: 'DONE' | 'IN_PROGRESS' | 'DELAYED' | 'VENDOR_CANCELLED' = 'IN_PROGRESS';
    if (text.includes('done') || text.includes('completed') || text.includes('finished')) newStatus = 'DONE';
    else if (text.includes('cancel')) newStatus = 'VENDOR_CANCELLED';
    else if (text.includes('delay')) newStatus = 'DELAYED';

    return {
      actionType: 'TASK_STATUS',
      toastMessage: `Updated task status to [${newStatus}]. DAG blast-radius propagated.`,
      mutations: {
        taskStatus: {
          taskQuery: text,
          newStatus,
          delayDays: 4,
        },
      },
    };
  }

  // 5. Vendor payment patterns: "paid royal spice 45k upi" or "paid decor 15000"
  if (text.includes('paid') || text.includes('advance') || text.includes('sent')) {
    const amtMatch = text.match(/(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:k|thousand|lakh|lac)?/i);
    const amount = amtMatch ? parseHumanRupee(amtMatch[0]) : 15000;
    const paymentMode = text.includes('upi') || text.includes('gpay') ? 'UPI' : 'Bank Transfer';

    // Find best matching vendor
    let matchedVendor = state.budgetItems[0]?.vendorName || 'Vendor';
    for (const item of state.budgetItems) {
      const vWords = item.vendorName.toLowerCase().split(' ');
      const catWords = item.category.toLowerCase().split(' ');
      if (vWords.some((w) => w.length > 3 && text.includes(w)) || catWords.some((w) => w.length > 3 && text.includes(w))) {
        matchedVendor = item.vendorName;
        break;
      }
    }

    return {
      actionType: 'VENDOR_PAYMENT',
      toastMessage: `Credited payment of ${formatRupees(amount)} to ${matchedVendor} (${paymentMode}). Treasury updated.`,
      mutations: {
        vendorPayment: {
          vendorIdOrName: matchedVendor,
          amountPaid: amount,
          paymentMode,
        },
      },
    };
  }

  return {
    actionType: 'UNKNOWN',
    toastMessage: `Command received: "${rawInput}". Treasury and state kept consistent.`,
    mutations: {},
  };
}

/**
 * Deterministic offline trade-off generator honoring priority locks
 */
export function generateTradeOffScenariosOffline(
  budgetItems: BudgetItem[],
  deficitRupees: number,
  guestDelta: number = 0,
  timelineDaysShift: number = 0
): TradeOffPlan[] {
  // Sort items: lowest priority (rank 5 down to 1). Rank 1 is LOCKED and MUST NEVER BE CUT.
  const flexibleItems = budgetItems
    .filter((b) => b.priorityRank > 1)
    .sort((a, b) => b.priorityRank - a.priorityRank);

  const lockedItems = budgetItems.filter((b) => b.priorityRank === 1);
  const lockedNames = lockedItems.map((b) => b.category).join(', ');

  const targetSavings = Math.max(25000, deficitRupees);

  // PLAN 1: "Precision Production & Decor Pruning"
  // Cuts flexible decor/stationery/addons, completely protects food and venue.
  const plan1Adjustments = flexibleItems.slice(0, 3).map((item, idx) => {
    const cutRatio = idx === 0 ? 0.5 : 0.3;
    const delta = -Math.min(item.actualOrQuotedAmount * 0.4, Math.round(targetSavings * cutRatio));
    return {
      category: item.category,
      deltaRupees: delta,
      konkretAction: `Prune artificial imported floral arches & substitute with local Marigold cascades + ambient LED washes. Preserves ${lockedNames}.`,
    };
  });
  const plan1Total = Math.abs(plan1Adjustments.reduce((sum, a) => sum + a.deltaRupees, 0));

  // PLAN 2: "Menu Streamlining & Bar Tier Rebalance"
  // Streamlines live cooking counters, switches imported premium bar to craft domestic.
  const plan2Adjustments = flexibleItems.map((item, idx) => {
    const delta = -Math.round(targetSavings / Math.max(1, flexibleItems.length));
    return {
      category: item.category,
      deltaRupees: delta,
      konkretAction: idx % 2 === 0
        ? `Consolidate live food stations from 6 to 4 while retaining signature gravies and desserts.`
        : `Switch hard liquor procurement to duty-free / bulk distributor quota; optimize mixer wastage.`,
    };
  });
  const plan2Total = Math.abs(plan2Adjustments.reduce((sum, a) => sum + a.deltaRupees, 0));

  // PLAN 3: "Consolidated Vendor Bundling & Time Window Compression"
  // Bundles sound, light, and stage trusses with single production house for multi-day discount.
  const plan3Adjustments = flexibleItems.slice(0, 2).map((item, idx) => {
    const delta = -Math.round(targetSavings * (idx === 0 ? 0.6 : 0.4));
    return {
      category: item.category,
      deltaRupees: delta,
      konkretAction: `Negotiate unified AV & Mandap bundle with lead event vendor for 15% contractor rebate.`,
    };
  });
  const plan3Total = Math.abs(plan3Adjustments.reduce((sum, a) => sum + a.deltaRupees, 0));

  return [
    {
      id: 'plan-1-decor-pruning',
      title: 'Selective Decor Pruning (Zero Food Compromise)',
      summary: `Resolves ${formatRupees(targetSavings)} deficit by trimming flexible aesthetics. Strict guarantee: ${lockedNames} remain 100% untouched.`,
      categoryAdjustments: plan1Adjustments,
      timelineMitigation: timelineDaysShift > 0
        ? `Compress fabrication window by ${timelineDaysShift} days; pre-assemble floral grids at warehouse.`
        : 'Fabrication timeline remains on target schedule.',
      riskRating: 'LOW',
      totalSavingsRupees: plan1Total || targetSavings,
    },
    {
      id: 'plan-2-catering-bar-rebalance',
      title: 'Beverage & Spread Optimization',
      summary: `Absorbs +${guestDelta} guest surge without blowing budget cap by optimizing live station redundancies and bar tier distribution.`,
      categoryAdjustments: plan2Adjustments,
      timelineMitigation: 'Schedule batch catering deliveries 3 hours prior to gate opening to avert bottleneck.',
      riskRating: 'MEDIUM',
      totalSavingsRupees: plan2Total || targetSavings,
    },
    {
      id: 'plan-3-vendor-bundle',
      title: 'Production Bundling & Turnkey Contract Rebate',
      summary: `Merge lighting, line array sound, and stage trussing under single contract for bulk commercial discount of ${formatRupees(targetSavings)}.`,
      categoryAdjustments: plan3Adjustments,
      timelineMitigation: 'Single vendor point of contact eliminates inter-team handover latency.',
      riskRating: 'LOW',
      totalSavingsRupees: plan3Total || targetSavings,
    },
  ];
}

/**
 * Deterministic offline vendor quote interrogator
 */
export function interrogateVendorQuoteOffline(
  rawQuoteText: string,
  budgetContext: { targetBudget: number; category?: string }
): InterrogatedQuote {
  const text = rawQuoteText || '';

  // Extract amount
  const rupeeMatch = text.match(/(?:₹|rs\.?|inr)\s*([\d,]+)/i) || text.match(/([\d,]+)\s*(?:lakh|lac|k|thousand)/i);
  let quotedTotal = 185000;
  if (rupeeMatch) {
    quotedTotal = parseHumanRupee(rupeeMatch[0]);
  }

  // Plate cost
  const plateMatch = text.match(/(\d+)\s*(?:\/|\s*per)\s*plate/i);
  const perPlateCost = plateMatch ? parseInt(plateMatch[1], 10) : undefined;

  // Vendor name heuristic
  let vendorName = 'Prospective Vendor';
  const nameMatch = text.match(/(?:quote from|from|vendor:|caterers?:|studios?:)\s*([A-Za-z\s&]+)/i);
  if (nameMatch && nameMatch[1]) {
    vendorName = nameMatch[1].trim();
  }

  const isWithinBudget = quotedTotal <= budgetContext.targetBudget;

  const hiddenCostsAndTraps: string[] = [];
  if (!text.toLowerCase().includes('gst') || text.toLowerCase().includes('gst extra')) {
    hiddenCostsAndTraps.push('18% GST NOT included in quote (+₹' + Math.round(quotedTotal * 0.18).toLocaleString('en-IN') + ' unbilled tax liability).');
  }
  if (!text.toLowerCase().includes('generator') && !text.toLowerCase().includes('genset')) {
    hiddenCostsAndTraps.push('Diesel Genset power backup omitted (typical ₹4,500/hour surprise charge during stage load).');
  }
  if (text.toLowerCase().includes('cater') || text.toLowerCase().includes('food') || text.toLowerCase().includes('plate')) {
    hiddenCostsAndTraps.push('Minimum plate guarantee lock trap: You pay for 200 plates even if 160 guests show up.');
    hiddenCostsAndTraps.push('Corkage fee of ₹500/bottle not clarified if external liquor is served.');
  } else {
    hiddenCostsAndTraps.push('Setup overtime fee applies if soundcheck exceeds 10:00 PM curfew.');
  }

  const includedItems = [
    'Base labor & equipment mobilization to venue',
    'Standard setup & dismantle window (6 hours)',
    'On-site floor manager for duration of ceremony',
  ];

  const negotiationQuestions = [
    `Can you provide the final inclusive figure with 18% GST and invoice copy in writing?`,
    `What is the grace threshold for guest plates before charging overtime (e.g. +5% buffer)?`,
    `Is 63kVA silent generator diesel and operator fee included in this quote?`,
    `What is the cancellation and rescheduling policy in case of weather or venue shift?`,
    `Can we lock payment milestones as: 20% advance, 60% on arrival, 20% post flawless delivery?`,
  ];

  return {
    vendorName,
    quotedTotal,
    perPlateCost,
    includedItems,
    hiddenCostsAndTraps,
    isWithinBudget,
    negotiationQuestions,
    summaryNote: isWithinBudget
      ? `Quote is within target budget of ${formatRupees(budgetContext.targetBudget)}, but check 18% GST inclusion.`
      : `Quote exceeds current allocation by ${formatRupees(quotedTotal - budgetContext.targetBudget)}. Use negotiation script below.`,
  };
}

function parseHumanRupee(str: string): number {
  if (!str) return 0;
  const clean = str.replace(/[₹,rsinr\s]/gi, '').toLowerCase();
  if (clean.endsWith('lakh') || clean.endsWith('lac')) {
    return parseFloat(clean) * 100000;
  }
  if (clean.endsWith('k')) {
    return parseFloat(clean) * 1000;
  }
  const num = parseFloat(clean);
  if (isNaN(num)) return 0;
  if (num < 1000 && (str.toLowerCase().includes('k') || str.toLowerCase().includes('thousand'))) {
    return num * 1000;
  }
  return num;
}

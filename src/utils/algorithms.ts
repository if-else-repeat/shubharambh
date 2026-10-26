import {
  BudgetItem,
  TreasuryMetrics,
  CatererAudit,
  CatererAuditResult,
  Guest,
  ExpensePoolItem,
  SplitsSummary,
  GuestSplitResult,
  TimelineTask,
  AlgorithmicAssertionResult,
} from '../types/index.ts';

/**
 * ALGORITHM 1: Grounded Treasury & Confidence Engine
 * Computes deterministic confirmed quotes vs AI estimates and liquid buffer.
 */
export function calculateTreasury(
  budgetItems: BudgetItem[],
  totalBudgetCap: number
): TreasuryMetrics {
  let confirmedTotal = 0;
  let estimatedTotal = 0;

  for (const item of budgetItems) {
    const amount = Number(item.actualOrQuotedAmount) || 0;
    if (item.isConfirmedQuote) {
      confirmedTotal += amount;
    } else {
      estimatedTotal += amount;
    }
  }

  const totalCommitted = confirmedTotal + estimatedTotal;
  const liquidBuffer = totalBudgetCap - totalCommitted;
  const overrunAmount = Math.max(0, totalCommitted - totalBudgetCap);

  const confirmedPercent = totalBudgetCap > 0
    ? Math.min(100, Math.round((confirmedTotal / totalBudgetCap) * 100))
    : 0;
  const estimatedPercent = totalBudgetCap > 0
    ? Math.min(100 - confirmedPercent, Math.round((estimatedTotal / totalBudgetCap) * 100))
    : 0;
  const liquidPercent = Math.max(0, 100 - confirmedPercent - estimatedPercent);

  return {
    confirmedTotal,
    estimatedTotal,
    totalCommitted,
    liquidBuffer,
    overrunAmount,
    budgetCap: totalBudgetCap,
    confirmedPercent,
    estimatedPercent,
    liquidPercent,
    isOverBudget: overrunAmount > 0,
  };
}

/**
 * ALGORITHM 2: Caterer Plate Discrepancy & Overcharge Auditor
 * Compares guaranteed plates, gate check-ins, and caterer billed plates.
 */
export function auditCatererPlates(
  audit: CatererAudit
): CatererAuditResult {
  const {
    guaranteedPlates,
    actualCheckedInGuests,
    catererClaimedPlates,
    pricePerPlate,
  } = audit;

  const billableActual = Math.max(guaranteedPlates, actualCheckedInGuests);
  const unverifiedPlateGap = Math.max(0, catererClaimedPlates - actualCheckedInGuests);
  const overchargePlates = Math.max(0, catererClaimedPlates - billableActual);
  const potentialOverchargeRupees = overchargePlates * pricePerPlate;

  const isCriticalDispute = catererClaimedPlates > actualCheckedInGuests + 5;

  let message = 'Gate counts match billing tolerances.';
  if (isCriticalDispute) {
    message = `CRITICAL_PLATE_DISPUTE: Caterer claims ${catererClaimedPlates} plates vs ${actualCheckedInGuests} gate check-ins (+${unverifiedPlateGap} plate gap).`;
  } else if (unverifiedPlateGap > 0) {
    message = `Warning: ${unverifiedPlateGap} plates claimed above actual gate check-in.`;
  }

  return {
    billableActual,
    unverifiedPlateGap,
    potentialOverchargeRupees,
    isCriticalDispute,
    message,
  };
}

/**
 * ALGORITHM 3: 4-Pool Fair Consumption Matrix (splits)
 * Distributes COMMON, VEG_FOOD, NON_VEG_FOOD, ALCOHOL pools based on attendance & consumption flags.
 * Guarantees mathematical equality between total expense and sum of individual shares to exact Rupee.
 */
export function calculateConsumptionSplits(
  guests: Guest[],
  expenses: ExpensePoolItem[]
): SplitsSummary {
  const poolTotals = {
    COMMON: 0,
    VEG_FOOD: 0,
    NON_VEG_FOOD: 0,
    ALCOHOL: 0,
  };

  for (const exp of expenses) {
    const amt = Number(exp.amount) || 0;
    if (poolTotals[exp.pool] !== undefined) {
      poolTotals[exp.pool] += amt;
    } else {
      poolTotals.COMMON += amt;
    }
  }

  const totalExpenses =
    poolTotals.COMMON +
    poolTotals.VEG_FOOD +
    poolTotals.NON_VEG_FOOD +
    poolTotals.ALCOHOL;

  const presentGuests = guests.filter((g) => g.isPresent);
  const presentCount = presentGuests.length;
  const nonVegCount = presentGuests.filter((g) => g.isNonVeg).length;
  const drinkerCount = presentGuests.filter((g) => g.isDrinking).length;

  if (presentCount === 0 || totalExpenses === 0) {
    return {
      poolTotals,
      totalExpenses,
      guestShares: guests.map((g) => ({
        guestId: g.id,
        guestName: g.name,
        isPresent: g.isPresent,
        isNonVeg: g.isNonVeg,
        isDrinking: g.isDrinking,
        commonShare: 0,
        vegFoodShare: 0,
        nonVegFoodShare: 0,
        alcoholShare: 0,
        totalLiability: 0,
      })),
      soberVegShare: 0,
      drinkerNonVegShare: 0,
      presentCount: 0,
      nonVegCount: 0,
      drinkerCount: 0,
      reconciliationCheckPassed: true,
      discrepancyRupees: 0,
    };
  }

  const commonPerPresent = (poolTotals.COMMON + poolTotals.VEG_FOOD) / presentCount;
  const nonVegPerConsumer = nonVegCount > 0 ? poolTotals.NON_VEG_FOOD / nonVegCount : 0;
  const alcoholPerConsumer = drinkerCount > 0 ? poolTotals.ALCOHOL / drinkerCount : 0;

  // Compute raw liabilities
  const rawShares = presentGuests.map((g) => {
    const commonShare = commonPerPresent;
    const nonVegShare = g.isNonVeg ? nonVegPerConsumer : 0;
    const alcoholShare = g.isDrinking ? alcoholPerConsumer : 0;
    const rawTotal = commonShare + nonVegShare + alcoholShare;
    return {
      guest: g,
      commonShare,
      vegFoodShare: 0,
      nonVegFoodShare: nonVegShare,
      alcoholShare,
      rawTotal,
    };
  });

  // Integer rounding with remainder distribution to guarantee exact rupee parity
  const integerRoundedShares = rawShares.map((item) => ({
    ...item,
    roundedTotal: Math.floor(item.rawTotal),
    remainderFraction: item.rawTotal - Math.floor(item.rawTotal),
  }));

  const sumFloor = integerRoundedShares.reduce((acc, curr) => acc + curr.roundedTotal, 0);
  let rupeeDeficit = Math.round(totalExpenses - sumFloor);

  // Sort descending by remainder fraction to distribute leftover single rupees fairly
  const sortedByFraction = [...integerRoundedShares].sort(
    (a, b) => b.remainderFraction - a.remainderFraction
  );

  const distributedMap = new Map<string, number>();
  for (let i = 0; i < sortedByFraction.length; i++) {
    const item = sortedByFraction[i];
    const addOne = rupeeDeficit > 0 ? 1 : 0;
    if (rupeeDeficit > 0) rupeeDeficit--;
    distributedMap.set(item.guest.id, item.roundedTotal + addOne);
  }

  const guestShares: GuestSplitResult[] = guests.map((g) => {
    if (!g.isPresent) {
      return {
        guestId: g.id,
        guestName: g.name,
        isPresent: false,
        isNonVeg: g.isNonVeg,
        isDrinking: g.isDrinking,
        commonShare: 0,
        vegFoodShare: 0,
        nonVegFoodShare: 0,
        alcoholShare: 0,
        totalLiability: 0,
      };
    }

    const totalLiability = distributedMap.get(g.id) || 0;
    const nonVegShare = g.isNonVeg ? Math.round(nonVegPerConsumer) : 0;
    const alcoholShare = g.isDrinking ? Math.round(alcoholPerConsumer) : 0;
    const commonShare = Math.max(0, totalLiability - nonVegShare - alcoholShare);

    return {
      guestId: g.id,
      guestName: g.name,
      isPresent: true,
      isNonVeg: g.isNonVeg,
      isDrinking: g.isDrinking,
      commonShare,
      vegFoodShare: 0,
      nonVegFoodShare: nonVegShare,
      alcoholShare,
      totalLiability,
    };
  });

  const sumAssigned = guestShares.reduce((acc, curr) => acc + curr.totalLiability, 0);
  const discrepancyRupees = totalExpenses - sumAssigned;
  const reconciliationCheckPassed = discrepancyRupees === 0;

  // Exemplar personas for rapid UI comparison
  const sampleSoberVeg = guestShares.find((g) => g.isPresent && !g.isNonVeg && !g.isDrinking);
  const sampleDrinkerNonVeg = guestShares.find((g) => g.isPresent && g.isNonVeg && g.isDrinking);

  const soberVegShare = sampleSoberVeg ? sampleSoberVeg.totalLiability : Math.round(commonPerPresent);
  const drinkerNonVegShare = sampleDrinkerNonVeg
    ? sampleDrinkerNonVeg.totalLiability
    : Math.round(commonPerPresent + nonVegPerConsumer + alcoholPerConsumer);

  return {
    poolTotals,
    totalExpenses,
    guestShares,
    soberVegShare,
    drinkerNonVegShare,
    presentCount,
    nonVegCount,
    drinkerCount,
    reconciliationCheckPassed,
    discrepancyRupees,
  };
}

/**
 * ALGORITHM 4: Directed Acyclic Graph (DAG) Task Dependency & Blast-Radius Propagator
 * Identifies blocked downstream dependencies when upstream tasks are delayed or cancelled,
 * and highlights tasks at critical deadline risk when timeline compresses.
 */
export function computeBlastRadius(
  tasks: TimelineTask[],
  timelineShiftDeltaDays: number = 0
): TimelineTask[] {
  // Build adjacency map: parent -> children (tasks that depend on parent)
  const taskMap = new Map<string, TimelineTask>();
  const childrenMap = new Map<string, string[]>();

  for (const t of tasks) {
    taskMap.set(t.id, t);
    childrenMap.set(t.id, []);
  }

  for (const t of tasks) {
    for (const parentId of t.dependsOn) {
      if (childrenMap.has(parentId)) {
        childrenMap.get(parentId)!.push(t.id);
      }
    }
  }

  // Find all directly failed/delayed root nodes
  const impactedRoots = tasks.filter(
    (t) => t.status === 'DELAYED' || t.status === 'VENDOR_CANCELLED'
  );

  // Traverse BFS to find all downstream blocked tasks
  const blockedDownstreamMap = new Map<string, Set<string>>(); // taskId -> Set of root task titles causing block

  for (const root of impactedRoots) {
    const queue = [...(childrenMap.get(root.id) || [])];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (visited.has(currentId)) continue;
      visited.add(currentId);

      if (!blockedDownstreamMap.has(currentId)) {
        blockedDownstreamMap.set(currentId, new Set<string>());
      }
      blockedDownstreamMap.get(currentId)!.add(root.title);

      const nextChildren = childrenMap.get(currentId) || [];
      for (const childId of nextChildren) {
        if (!visited.has(childId)) {
          queue.push(childId);
        }
      }
    }
  }

  // Return augmented tasks with blast radius properties
  return tasks.map((task) => {
    const isDirectlyImpacted = task.status === 'DELAYED' || task.status === 'VENDOR_CANCELLED';
    const blockers = blockedDownstreamMap.get(task.id);
    const isBlockedByUpstream = !!blockers && blockers.size > 0;
    const blockingTaskTitles = blockers ? Array.from(blockers) : [];

    // Timeline compression
    const compressedDays = Math.max(0, task.dueDateOffsetDays - timelineShiftDeltaDays);
    const criticalDeadlineRisk =
      timelineShiftDeltaDays > 0 &&
      task.status !== 'DONE' &&
      compressedDays <= 3;

    let recoveryNote: string | undefined;
    if (task.status === 'VENDOR_CANCELLED') {
      recoveryNote = 'Immediate emergency RFP trigger required. Backup vendor deposit unfreeze.';
    } else if (task.status === 'DELAYED') {
      recoveryNote = 'Upstream vendor delayed. Expedited milestone buffer activated.';
    } else if (isBlockedByUpstream) {
      recoveryNote = `Halted awaiting completion of upstream: ${blockingTaskTitles.join(', ')}.`;
    } else if (criticalDeadlineRisk) {
      recoveryNote = `Timeline compressed by ${timelineShiftDeltaDays}d! Remaining window: ${compressedDays} days.`;
    }

    return {
      ...task,
      dueDateOffsetDays: compressedDays,
      isBlockedByUpstream,
      blockingTaskTitles,
      criticalDeadlineRisk,
      recoveryNote,
    };
  });
}

/**
 * Live Unit Test & Algorithm Verification Runner
 * Runs 6 automated assertions on the algorithms and returns diagnostics for the UI and CLI tests.
 */
export function runAlgorithmVerificationTests(): AlgorithmicAssertionResult[] {
  const results: AlgorithmicAssertionResult[] = [];

  // TEST 1: Treasury Math & Liquid Buffer
  const t1Start = performance.now();
  const mockBudget: BudgetItem[] = [
    {
      id: 'b1',
      category: 'Venue',
      vendorName: 'Royal Palace',
      allocatedAmount: 400000,
      actualOrQuotedAmount: 380000,
      paidAmount: 200000,
      isConfirmedQuote: true,
      scalesWithGuests: false,
      perGuestRate: 0,
      priorityRank: 1,
    },
    {
      id: 'b2',
      category: 'Decor',
      vendorName: 'Floral Art',
      allocatedAmount: 200000,
      actualOrQuotedAmount: 220000,
      paidAmount: 50000,
      isConfirmedQuote: false,
      scalesWithGuests: false,
      perGuestRate: 0,
      priorityRank: 3,
    },
  ];
  const treasuryResult = calculateTreasury(mockBudget, 700000);
  const t1Passed =
    treasuryResult.confirmedTotal === 380000 &&
    treasuryResult.estimatedTotal === 220000 &&
    treasuryResult.totalCommitted === 600000 &&
    treasuryResult.liquidBuffer === 100000 &&
    treasuryResult.overrunAmount === 0;
  results.push({
    id: 'test_1_treasury_confidence',
    name: 'Algorithm 1: Treasury Confirmed vs Estimate & Buffer Math',
    passed: t1Passed,
    expected: 'confirmed=380000, estimated=220000, committed=600000, buffer=100000',
    actual: `confirmed=${treasuryResult.confirmedTotal}, estimated=${treasuryResult.estimatedTotal}, committed=${treasuryResult.totalCommitted}, buffer=${treasuryResult.liquidBuffer}`,
    executionTimeMs: Number((performance.now() - t1Start).toFixed(2)),
  });

  // TEST 2: Caterer Plate Overcharge Calculation
  const t2Start = performance.now();
  const mockAudit: CatererAudit = {
    guaranteedPlates: 150,
    actualCheckedInGuests: 140,
    catererClaimedPlates: 175,
    pricePerPlate: 850,
  };
  const auditResult = auditCatererPlates(mockAudit);
  // billableActual = max(150, 140) = 150
  // overchargePlates = max(0, 175 - 150) = 25
  // potentialOverchargeRupees = 25 * 850 = 21250
  // unverifiedPlateGap = 175 - 140 = 35
  const t2Passed =
    auditResult.billableActual === 150 &&
    auditResult.unverifiedPlateGap === 35 &&
    auditResult.potentialOverchargeRupees === 21250 &&
    auditResult.isCriticalDispute === true;
  results.push({
    id: 'test_2_caterer_plate_gap',
    name: 'Algorithm 2: Caterer Plate Gap & Overcharge Auditor',
    passed: t2Passed,
    expected: 'billable=150, gap=35, overcharge=₹21,250, critical=true',
    actual: `billable=${auditResult.billableActual}, gap=${auditResult.unverifiedPlateGap}, overcharge=₹${auditResult.potentialOverchargeRupees}, critical=${auditResult.isCriticalDispute}`,
    executionTimeMs: Number((performance.now() - t2Start).toFixed(2)),
  });

  // TEST 3: 4-Pool Splits Exact Rupee Reconciliation
  const t3Start = performance.now();
  const mockGuests: Guest[] = [
    { id: 'g1', name: 'Aarav', isPresent: true, isNonVeg: false, isDrinking: false, tableNumber: '1', passToken: 'p1' }, // Sober Veg
    { id: 'g2', name: 'Rohan', isPresent: true, isNonVeg: true, isDrinking: false, tableNumber: '1', passToken: 'p2' },  // Non-Veg Sober
    { id: 'g3', name: 'Kavya', isPresent: true, isNonVeg: true, isDrinking: true, tableNumber: '2', passToken: 'p3' },   // Non-Veg Drinker
    { id: 'g4', name: 'Simran', isPresent: true, isNonVeg: false, isDrinking: true, tableNumber: '2', passToken: 'p4' },  // Veg Drinker
    { id: 'g5', name: 'Absentee', isPresent: false, isNonVeg: true, isDrinking: true, tableNumber: '0', passToken: 'p5' }, // Absent
  ];
  const mockExpenses: ExpensePoolItem[] = [
    { id: 'e1', title: 'Decor & Sound', amount: 10000, pool: 'COMMON', paidBy: 'Host', timestamp: '10:00' },
    { id: 'e2', title: 'Paneer Platter', amount: 4000, pool: 'VEG_FOOD', paidBy: 'Host', timestamp: '10:15' },
    { id: 'e3', title: 'Mutton Curry', amount: 6000, pool: 'NON_VEG_FOOD', paidBy: 'Host', timestamp: '10:30' },
    { id: 'e4', title: 'Whisky & Gin', amount: 8000, pool: 'ALCOHOL', paidBy: 'Host', timestamp: '10:45' },
  ];
  const splitResult = calculateConsumptionSplits(mockGuests, mockExpenses);
  const sumShares = splitResult.guestShares.reduce((acc, g) => acc + g.totalLiability, 0);
  const t3Passed =
    splitResult.reconciliationCheckPassed &&
    sumShares === 28000 &&
    splitResult.guestShares.find((g) => g.guestId === 'g5')?.totalLiability === 0;
  results.push({
    id: 'test_3_four_pool_splits_reconciliation',
    name: 'Algorithm 3: 4-Pool Fair Consumption Exact Rupee Parity',
    passed: t3Passed,
    expected: 'sumOfShares=28000, absenteeLiability=0, discrepancy=0',
    actual: `sumOfShares=${sumShares}, absenteeLiability=${splitResult.guestShares.find((g) => g.guestId === 'g5')?.totalLiability}, discrepancy=${splitResult.discrepancyRupees}`,
    executionTimeMs: Number((performance.now() - t3Start).toFixed(2)),
  });

  // TEST 4: Fair Persona Variance (Sober Veg vs Drinker Non-Veg)
  const t4Start = performance.now();
  const aaravShare = splitResult.guestShares.find((g) => g.guestId === 'g1')!.totalLiability;
  const kavyaShare = splitResult.guestShares.find((g) => g.guestId === 'g3')!.totalLiability;
  // Common+Veg = 14000 / 4 = 3500
  // Aarav (sober veg) = 3500
  // NonVeg = 6000 / 2 = 3000
  // Alcohol = 8000 / 2 = 4000
  // Kavya (drinker non-veg) = 3500 + 3000 + 4000 = 10500
  const t4Passed = aaravShare === 3500 && kavyaShare === 10500;
  results.push({
    id: 'test_4_persona_variance_integrity',
    name: 'Algorithm 3b: Consumption Liability Variance (Sober Veg < Drinker Non-Veg)',
    passed: t4Passed,
    expected: 'Aarav (Sober Veg)=₹3,500, Kavya (Drinker Non-Veg)=₹10,500',
    actual: `Aarav=₹${aaravShare}, Kavya=₹${kavyaShare}`,
    executionTimeMs: Number((performance.now() - t4Start).toFixed(2)),
  });

  // TEST 5: DAG BFS Blast-Radius Dependency Propagation
  const t5Start = performance.now();
  const mockTasks: TimelineTask[] = [
    { id: 'task-1', title: 'Venue Contract Signing', dueDateOffsetDays: 30, status: 'DELAYED', dependsOn: [], category: 'Venue' },
    { id: 'task-2', title: 'Stage Fabrication', dueDateOffsetDays: 20, status: 'IN_PROGRESS', dependsOn: ['task-1'], category: 'Production' },
    { id: 'task-3', title: 'Sound & Light Rigging', dueDateOffsetDays: 10, status: 'IN_PROGRESS', dependsOn: ['task-2'], category: 'Production' },
    { id: 'task-4', title: 'Invitations Print', dueDateOffsetDays: 25, status: 'IN_PROGRESS', dependsOn: [], category: 'Stationery' },
  ];
  const blastRadiusResult = computeBlastRadius(mockTasks, 0);
  const task2 = blastRadiusResult.find((t) => t.id === 'task-2')!;
  const task3 = blastRadiusResult.find((t) => t.id === 'task-3')!;
  const task4 = blastRadiusResult.find((t) => t.id === 'task-4')!;
  const t5Passed =
    task2.isBlockedByUpstream === true &&
    task3.isBlockedByUpstream === true &&
    task4.isBlockedByUpstream === false;
  results.push({
    id: 'test_5_dag_blast_radius_bfs',
    name: 'Algorithm 4: DAG Blast-Radius Cascading Dependency Traversal',
    passed: t5Passed,
    expected: 'task-2 blocked=true, task-3 blocked=true, task-4 blocked=false',
    actual: `task-2 blocked=${task2.isBlockedByUpstream}, task-3 blocked=${task3.isBlockedByUpstream}, task-4 blocked=${task4.isBlockedByUpstream}`,
    executionTimeMs: Number((performance.now() - t5Start).toFixed(2)),
  });

  // TEST 6: Timeline Shift & Critical Deadline Risk Compression
  const t6Start = performance.now();
  const compressedTasks = computeBlastRadius(mockTasks, 28);
  // task-1 original 30 -> 2 days remaining (critical risk <= 3)
  const task1Comp = compressedTasks.find((t) => t.id === 'task-1')!;
  const t6Passed = task1Comp.dueDateOffsetDays === 2 && task1Comp.criticalDeadlineRisk === true;
  results.push({
    id: 'test_6_timeline_compression_risk',
    name: 'Algorithm 4b: Timeline Shift & Critical Deadline Flagging',
    passed: t6Passed,
    expected: 'dueDateOffsetDays=2, criticalDeadlineRisk=true',
    actual: `dueDateOffsetDays=${task1Comp.dueDateOffsetDays}, criticalDeadlineRisk=${task1Comp.criticalDeadlineRisk}`,
    executionTimeMs: Number((performance.now() - t6Start).toFixed(2)),
  });

  return results;
}

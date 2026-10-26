import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateTreasury,
  auditCatererPlates,
  calculateConsumptionSplits,
  computeBlastRadius,
  runAlgorithmVerificationTests,
} from './algorithms.ts';
import { BudgetItem, CatererAudit, Guest, ExpensePoolItem, TimelineTask } from '../types/index.ts';

test('Algorithm 1: Treasury computes confirmed vs estimated and liquid buffer correctly', () => {
  const budget: BudgetItem[] = [
    {
      id: 'v1',
      category: 'Catering',
      vendorName: 'Royal Spices',
      allocatedAmount: 300000,
      actualOrQuotedAmount: 320000,
      paidAmount: 100000,
      isConfirmedQuote: true,
      scalesWithGuests: true,
      perGuestRate: 1600,
      priorityRank: 1,
    },
    {
      id: 'v2',
      category: 'Floral Decor',
      vendorName: 'Bloom Crafts',
      allocatedAmount: 150000,
      actualOrQuotedAmount: 180000,
      paidAmount: 50000,
      isConfirmedQuote: false,
      scalesWithGuests: false,
      perGuestRate: 0,
      priorityRank: 4,
    },
  ];

  const treasury = calculateTreasury(budget, 600000);
  assert.equal(treasury.confirmedTotal, 320000);
  assert.equal(treasury.estimatedTotal, 180000);
  assert.equal(treasury.totalCommitted, 500000);
  assert.equal(treasury.liquidBuffer, 100000);
  assert.equal(treasury.overrunAmount, 0);
  assert.equal(treasury.isOverBudget, false);

  // Overrun case
  const overrunTreasury = calculateTreasury(budget, 450000);
  assert.equal(overrunTreasury.totalCommitted, 500000);
  assert.equal(overrunTreasury.liquidBuffer, -50000);
  assert.equal(overrunTreasury.overrunAmount, 50000);
  assert.equal(overrunTreasury.isOverBudget, true);
});

test('Algorithm 2: Caterer plate gap and potential overcharge correctly triggers dispute', () => {
  const audit: CatererAudit = {
    guaranteedPlates: 200,
    actualCheckedInGuests: 190,
    catererClaimedPlates: 231,
    pricePerPlate: 850,
  };

  const result = auditCatererPlates(audit);
  // billableActual = max(200, 190) = 200
  // unverifiedPlateGap = 231 - 190 = 41
  // potentialOverchargeRupees = (231 - 200) * 850 = 31 * 850 = 26350
  assert.equal(result.billableActual, 200);
  assert.equal(result.unverifiedPlateGap, 41);
  assert.equal(result.potentialOverchargeRupees, 26350);
  assert.equal(result.isCriticalDispute, true);
});

test('Algorithm 3: 4-Pool fair consumption guarantees sum(Share) === sum(Expenses) to the exact rupee', () => {
  const guests: Guest[] = [
    { id: '1', name: 'Dev', isPresent: true, isNonVeg: false, isDrinking: false, tableNumber: '1', passToken: 't1' },
    { id: '2', name: 'Priya', isPresent: true, isNonVeg: true, isDrinking: false, tableNumber: '1', passToken: 't2' },
    { id: '3', name: 'Karan', isPresent: true, isNonVeg: true, isDrinking: true, tableNumber: '2', passToken: 't3' },
    { id: '4', name: 'Anya', isPresent: false, isNonVeg: true, isDrinking: true, tableNumber: '2', passToken: 't4' },
  ];

  const expenses: ExpensePoolItem[] = [
    { id: 'e1', title: 'DJ & Sound', amount: 3333, pool: 'COMMON', paidBy: 'Dev', timestamp: '12:00' },
    { id: 'e2', title: 'Veg Starters', amount: 1555, pool: 'VEG_FOOD', paidBy: 'Dev', timestamp: '12:10' },
    { id: 'e3', title: 'Mutton Seekh', amount: 2444, pool: 'NON_VEG_FOOD', paidBy: 'Karan', timestamp: '12:30' },
    { id: 'e4', title: 'Single Malt', amount: 5000, pool: 'ALCOHOL', paidBy: 'Karan', timestamp: '12:45' },
  ];

  const totalExpense = 3333 + 1555 + 2444 + 5000; // 12332
  const splits = calculateConsumptionSplits(guests, expenses);

  assert.equal(splits.totalExpenses, totalExpense);
  assert.equal(splits.reconciliationCheckPassed, true);
  assert.equal(splits.discrepancyRupees, 0);

  const sumAssigned = splits.guestShares.reduce((acc, g) => acc + g.totalLiability, 0);
  assert.equal(sumAssigned, totalExpense);

  const anya = splits.guestShares.find((g) => g.guestId === '4');
  assert.equal(anya?.totalLiability, 0); // Absent guest pays 0
});

test('Algorithm 4: DAG Breadth-First-Search blast-radius cascades to downstream tasks', () => {
  const tasks: TimelineTask[] = [
    { id: 't-hall', title: 'Hall Booking', dueDateOffsetDays: 45, status: 'DELAYED', dependsOn: [], category: 'Venue' },
    { id: 't-decor', title: 'Mandap Decor Design', dueDateOffsetDays: 30, status: 'IN_PROGRESS', dependsOn: ['t-hall'], category: 'Decor' },
    { id: 't-light', title: 'Lighting & AV Install', dueDateOffsetDays: 15, status: 'IN_PROGRESS', dependsOn: ['t-decor'], category: 'Production' },
    { id: 't-photo', title: 'Photographer Briefing', dueDateOffsetDays: 20, status: 'IN_PROGRESS', dependsOn: [], category: 'Media' },
  ];

  const computed = computeBlastRadius(tasks, 0);
  const decor = computed.find((t) => t.id === 't-decor')!;
  const light = computed.find((t) => t.id === 't-light')!;
  const photo = computed.find((t) => t.id === 't-photo')!;

  assert.equal(decor.isBlockedByUpstream, true);
  assert.equal(light.isBlockedByUpstream, true);
  assert.equal(photo.isBlockedByUpstream, false);
});

test('Built-in Diagnostic Test Suite completes with 100% pass rate', () => {
  const results = runAlgorithmVerificationTests();
  assert.equal(results.length, 6);
  for (const r of results) {
    assert.equal(r.passed, true, `Test ${r.name} failed: expected ${r.expected}, got ${r.actual}`);
  }
});

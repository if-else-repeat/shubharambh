import test from 'node:test';
import assert from 'node:assert/strict';
import {
  processAssistantOffline,
  applyAnomalyAdjustments,
  calculateAnomalyShock,
  generateDecorRecommendations,
  generateCateringRecommendations,
  generateShoppingRecommendations,
  generateLedgerAuditSummary,
  ASSISTANT_CONFIG,
} from './assistantEngine.ts';
import { HostEvent, getVendorCost, AnomalyData } from '../types/host.ts';
import { sanitizeInput, formatRupees } from '../utils/sanitize.ts';
import { INITIAL_EVENTS } from '../data/initialEvents.ts';

const mockWeddingEvent: HostEvent = {
  id: 'event-wedding-1',
  name: 'Royal Udaipur Wedding',
  totalBudget: 1500000,
  guestCount: 200,
  date: '2025-11-20',
  vendors: [
    { id: 'v1', name: 'Heritage Palace Courtyard', category: 'Venue', cost: 600000, status: 'Booked' },
    { id: 'v2', name: 'Royal Rajputana Caterers', category: 'Catering', cost: 500000, status: 'Booked' },
    { id: 'v3', name: 'Marigold & Crystal Staging', category: 'Decor', cost: 250000, status: 'Pending' },
    { id: 'v4', name: 'Cinematic Studio', category: 'Photography', cost: 150000, status: 'Paid' },
  ],
  tasks: [
    { id: 't1', title: 'Book Venue', deadlineGroup: '3 Months Out', dueDate: '2025-08-20', completed: true },
    { id: 't2', title: 'Finalize Menu Tasting', deadlineGroup: '1 Month Out', dueDate: '2025-10-20', completed: false },
  ],
};

const mockMicroEvent: HostEvent = {
  id: 'event-bday-1',
  name: 'Rohan 25th Birthday Dinner',
  totalBudget: 15000,
  guestCount: 15,
  date: '2025-05-10',
  vendors: [
    { id: 'mv1', name: 'Artisanal Bakery Truffle Cake', category: 'Catering', cost: 3500, status: 'Booked' },
    { id: 'mv2', name: 'Biryani Handi & Starters', category: 'Catering', cost: 7500, status: 'Pending' },
    { id: 'mv3', name: 'Fairy Lights & Polaroid Corner', category: 'Decor', cost: 2000, status: 'Pending' },
  ],
  tasks: [
    { id: 'mt1', title: 'Order cake', deadlineGroup: 'Week Of', dueDate: '2025-05-05', completed: true },
  ],
};

test('getVendorCost accurately tallies single cost field and handles backward compatibility', () => {
  assert.equal(getVendorCost({ id: '1', name: 'V1', category: 'Decor', cost: 45000, status: 'Booked' }), 45000);
  assert.equal(getVendorCost({ id: '2', name: 'V2', category: 'Decor', actualCost: 32000, status: 'Pending' }), 32000);
  assert.equal(getVendorCost({ id: '3', name: 'V3', category: 'Decor', estimatedCost: 18000, status: 'Paid' }), 18000);
  assert.equal(getVendorCost({ id: '4', name: 'V4', category: 'Decor', status: 'Pending' }), 0);
});

test('getVendorCost handles zero, negative numbers, and undefined inputs safely', () => {
  assert.equal(getVendorCost({ cost: 0 }), 0);
  assert.equal(getVendorCost({ cost: -500 }), 0);
  assert.equal(getVendorCost({}), 0);
});

test('processAssistantOffline detects guest surge anomaly and calculates math correctly', () => {
  const query = 'Guest count surge! 20 extra guests are arriving and budget dropped by 10%';
  const response = processAssistantOffline(query, mockWeddingEvent);

  assert.equal(response.isAnomaly, true);
  assert.ok(response.anomalyData);
  assert.equal(response.anomalyData.guestCountDelta, 20);
  assert.equal(response.anomalyData.budgetDropPercent, 10);

  // For a grand wedding (>=500,000), perGuestCatering is 1600. 20 * 1600 = 32,000.
  // 10% of 1,500,000 = 150,000 loss. Total deficit = 182,000.
  assert.equal(response.anomalyData.calculatedDeficit, 182000);
  assert.equal(response.anomalyData.newBudgetCap, 1350000);
  assert.ok(response.anomalyData.vendorAdjustments.length > 0);
  assert.ok(response.reply.includes('Royal Udaipur Wedding'));
  assert.ok(response.reply.includes('Net Deficit to Recover'));
});

test('processAssistantOffline scales per-head costs down for micro celebrations', () => {
  const query = '5 more guests joining and budget cut by 15%';
  const response = processAssistantOffline(query, mockMicroEvent);

  assert.equal(response.isAnomaly, true);
  assert.ok(response.anomalyData);
  assert.equal(response.anomalyData.guestCountDelta, 5);
  assert.equal(response.anomalyData.budgetDropPercent, 15);

  // Micro budget (<=25000): perGuestCatering is 350. 5 * 350 = 1,750.
  // 15% of 15,000 = 2,250. Total deficit = 4,000.
  assert.equal(response.anomalyData.calculatedDeficit, 4000);
  assert.equal(response.anomalyData.newBudgetCap, 12750);
  assert.ok(response.anomalyData.vendorAdjustments.length > 0);
});

test('processAssistantOffline gracefully handles anomaly with zero vendors', () => {
  const emptyEvent: HostEvent = {
    id: 'empty-1',
    name: 'Simple Gathering',
    totalBudget: 20000,
    guestCount: 10,
    date: '2025-10-10',
    vendors: [],
    tasks: [],
  };
  const response = processAssistantOffline('10 extra guests joined', emptyEvent);
  assert.equal(response.isAnomaly, true);
  assert.ok(response.anomalyData);
  assert.equal(response.anomalyData.vendorAdjustments.length, 0);
});

test('processAssistantOffline returns targeted decor recommendations for micro vs grand events', () => {
  const microDecor = processAssistantOffline('Give me some decor ideas', mockMicroEvent);
  assert.equal(microDecor.isAnomaly, false);
  assert.ok(microDecor.reply.includes('Fairy Lights'));
  assert.ok(microDecor.reply.includes('Polaroid'));

  const grandDecor = processAssistantOffline('What decor theme should we use?', mockWeddingEvent);
  assert.equal(grandDecor.isAnomaly, false);
  assert.ok(grandDecor.reply.includes('Marigold'));
  assert.ok(grandDecor.reply.includes('Stage'));
});

test('processAssistantOffline gives catering and plate wastage advice', () => {
  const foodAdvice = processAssistantOffline('How do I handle catering and plate wastage?', mockWeddingEvent);
  assert.equal(foodAdvice.isAnomaly, false);
  const text = foodAdvice.reply.toLowerCase();
  assert.ok(text.includes('plate') || text.includes('catering') || text.includes('buffet'));
});

test('processAssistantOffline gives shopping advice for clothing and wedding cards', () => {
  const shoppingAdvice = processAssistantOffline('Where should we go shopping for lehengas and cards?', mockWeddingEvent);
  assert.equal(shoppingAdvice.isAnomaly, false);
  assert.ok(shoppingAdvice.reply.includes('Shopping') || shoppingAdvice.reply.includes('Lehenga') || shoppingAdvice.reply.includes('Chandni Chowk') || shoppingAdvice.reply.includes('WhatsApp'));
});

test('processAssistantOffline returns structured audit summary for general queries', () => {
  const generalResponse = processAssistantOffline('Hello, give me a status update', mockWeddingEvent);
  assert.equal(generalResponse.isAnomaly, false);
  assert.ok(generalResponse.reply.includes('Budget Cap'));
  assert.ok(generalResponse.reply.includes('200 attendees'));
});

test('sanitizeInput strips malicious angle brackets and javascript pseudo-protocol', () => {
  assert.equal(sanitizeInput('<script>alert("xss")</script>Hello'), 'alert("xss")Hello');
  assert.equal(sanitizeInput('javascript:doSomething()'), 'doSomething()');
  assert.equal(sanitizeInput('   Valid Celebration Name   '), 'Valid Celebration Name');
  assert.equal(sanitizeInput(''), '');
  assert.equal(sanitizeInput('<<<>>>'), '');
});

test('formatRupees formats Indian currency correctly with INR symbol and negatives', () => {
  assert.equal(formatRupees(50000), '₹50,000');
  assert.equal(formatRupees(1500000), '₹15,00,000');
  assert.equal(formatRupees(-25000), '-₹25,000');
  assert.equal(formatRupees(0), '₹0');
  assert.equal(formatRupees(NaN), '₹0');
});

test('INITIAL_EVENTS are structured with valid non-empty budgets, vendors, and tasks', () => {
  const eventKeys = Object.keys(INITIAL_EVENTS);
  assert.ok(eventKeys.length >= 3);
  for (const key of eventKeys) {
    const ev = INITIAL_EVENTS[key];
    assert.ok(ev.id);
    assert.ok(ev.name);
    assert.ok(ev.totalBudget > 0);
    assert.ok(ev.vendors.length > 0);
    assert.ok(ev.tasks.length > 0);
  }
});

test('applyAnomalyAdjustments updates celebration state immutably', () => {
  const anomalyData: AnomalyData = {
    calculatedDeficit: 50000,
    guestCountDelta: 20,
    budgetDropPercent: 10,
    newBudgetCap: 1350000,
    recommendations: ['Trim venue costs'],
    vendorAdjustments: [
      {
        vendorId: 'v1',
        name: 'Heritage Palace Courtyard',
        cutAmount: 50000,
        newCost: 550000,
        rationale: 'Negotiated off-peak rate',
      },
    ],
  };

  const updated = applyAnomalyAdjustments(mockWeddingEvent, anomalyData);

  // Original remains untouched
  assert.equal(mockWeddingEvent.totalBudget, 1500000);
  assert.equal(mockWeddingEvent.guestCount, 200);
  assert.equal(getVendorCost(mockWeddingEvent.vendors[0]), 600000);

  // Updated has modified budget, guests, and vendor cost
  assert.equal(updated.totalBudget, 1350000);
  assert.equal(updated.guestCount, 220);
  assert.equal(getVendorCost(updated.vendors[0]), 550000);
});

test('modular sub-functions execute standalone with deterministic outputs', () => {
  const anomalyRes = calculateAnomalyShock('budget drop 10%', mockWeddingEvent);
  assert.equal(anomalyRes.isAnomaly, true);

  const decorRes = generateDecorRecommendations(mockMicroEvent, true, 15000);
  assert.equal(decorRes.isAnomaly, false);

  const caterRes = generateCateringRecommendations(mockWeddingEvent, false, 1500000, 200);
  assert.equal(caterRes.isAnomaly, false);

  const shopRes = generateShoppingRecommendations(mockWeddingEvent);
  assert.equal(shopRes.isAnomaly, false);

  const auditRes = generateLedgerAuditSummary(mockWeddingEvent);
  assert.equal(auditRes.isAnomaly, false);

  assert.equal(ASSISTANT_CONFIG.PER_GUEST_CATERING.MICRO, 350);
});

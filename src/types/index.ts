export type UserRole = 'host' | 'guest';

export type ActiveTab = 'treasury' | 'pass' | 'splits' | 'rebalance';

export type TaskStatus = 'DONE' | 'IN_PROGRESS' | 'DELAYED' | 'VENDOR_CANCELLED';

export type ExpensePoolType = 'COMMON' | 'VEG_FOOD' | 'NON_VEG_FOOD' | 'ALCOHOL';

export interface BudgetItem {
  id: string;
  category: string;
  vendorName: string;
  allocatedAmount: number;
  actualOrQuotedAmount: number;
  paidAmount: number;
  isConfirmedQuote: boolean; // True = Verified Vendor Quote, False = AI Assumed Estimate
  scalesWithGuests: boolean;
  perGuestRate: number;
  priorityRank: number; // 1 = Locked/Must-Have, 2 = High, 3 = Medium, 4 = Flexible, 5 = Highly Flexible
  notes?: string;
}

export interface CatererAudit {
  guaranteedPlates: number;
  actualCheckedInGuests: number;
  catererClaimedPlates: number;
  pricePerPlate: number;
}

export interface CatererAuditResult {
  billableActual: number;
  unverifiedPlateGap: number;
  potentialOverchargeRupees: number;
  isCriticalDispute: boolean;
  message: string;
}

export interface TreasuryMetrics {
  confirmedTotal: number;
  estimatedTotal: number;
  totalCommitted: number;
  liquidBuffer: number;
  overrunAmount: number;
  budgetCap: number;
  confirmedPercent: number;
  estimatedPercent: number;
  liquidPercent: number;
  isOverBudget: boolean;
}

export interface Guest {
  id: string;
  name: string;
  phone?: string;
  isPresent: boolean;
  isNonVeg: boolean;
  isDrinking: boolean;
  tableNumber: string;
  roomNumber?: string;
  passToken: string;
  roleTag?: 'VIP' | 'FAMILY' | 'FRIEND' | 'CREW';
}

export interface ExpensePoolItem {
  id: string;
  title: string;
  amount: number;
  pool: ExpensePoolType;
  paidBy: string;
  timestamp: string;
}

export interface GuestSplitResult {
  guestId: string;
  guestName: string;
  isPresent: boolean;
  isNonVeg: boolean;
  isDrinking: boolean;
  commonShare: number;
  vegFoodShare: number;
  nonVegFoodShare: number;
  alcoholShare: number;
  totalLiability: number;
}

export interface SplitsSummary {
  poolTotals: {
    COMMON: number;
    VEG_FOOD: number;
    NON_VEG_FOOD: number;
    ALCOHOL: number;
  };
  totalExpenses: number;
  guestShares: GuestSplitResult[];
  soberVegShare: number;
  drinkerNonVegShare: number;
  presentCount: number;
  nonVegCount: number;
  drinkerCount: number;
  reconciliationCheckPassed: boolean;
  discrepancyRupees: number;
}

export interface TimelineTask {
  id: string;
  title: string;
  dueDateOffsetDays: number; // Days from event anchor
  status: TaskStatus;
  dependsOn: string[]; // Task IDs
  category: string;
  isBlockedByUpstream?: boolean;
  blockingTaskTitles?: string[];
  criticalDeadlineRisk?: boolean;
  recoveryNote?: string;
}

export interface ShagunEntry {
  id: string;
  guestName: string;
  amount: number;
  note: string;
  paymentMode: 'CASH' | 'UPI';
  timestamp: string;
}

export interface TradeOffPlan {
  id: string;
  title: string;
  summary: string;
  categoryAdjustments: {
    category: string;
    deltaRupees: number; // e.g. -35000
    konkretAction: string;
  }[];
  timelineMitigation: string;
  riskRating: 'LOW' | 'MEDIUM' | 'HIGH';
  totalSavingsRupees: number;
}

export interface InterrogatedQuote {
  vendorName: string;
  quotedTotal: number;
  perPlateCost?: number;
  includedItems: string[];
  hiddenCostsAndTraps: string[];
  isWithinBudget: boolean;
  negotiationQuestions: string[];
  summaryNote: string;
}

export interface EventPreset {
  id: string;
  name: string;
  city: string;
  ceremony: string;
  venueLocation: string;
  totalBudgetCap: number;
  guestCount: number;
  timelineMonths: number;
  budgetItems: BudgetItem[];
  catererAudit: CatererAudit;
  guests: Guest[];
  expenses: ExpensePoolItem[];
  tasks: TimelineTask[];
  shagunBook: ShagunEntry[];
}

export interface AlgorithmicAssertionResult {
  id: string;
  name: string;
  passed: boolean;
  expected: string;
  actual: string;
  executionTimeMs: number;
  details?: string;
}

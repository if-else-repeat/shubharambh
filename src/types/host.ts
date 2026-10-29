/**
 * shubharambh Core Type Definitions
 * Data models for celebrations, single-cost vendor ledgers, milestone checklists, and AI anomaly engines.
 */

/**
 * Chronological milestone groups for checklist tasks.
 */
export type DeadlineGroup = '3 Months Out' | '1 Month Out' | 'Week Of' | 'Day Of';

/**
 * Single-cost vendor line item tracking contract, category, and payment status.
 */
export interface HostVendor {
  /** Unique vendor identifier */
  id: string;
  /** Vendor or item name (e.g. Royal Marigold Staging) */
  name: string;
  /** Service category (Venue, Catering, Decor, Photography, Stationery, Ritual, Other) */
  category: string;
  /** Single cost tally in INR */
  cost?: number;
  /** Settlement status */
  status: 'Pending' | 'Booked' | 'Paid';
  /** Primary contact person or phone number */
  contactPerson?: string;
  /** Backward compatibility for legacy estimates */
  estimatedCost?: number;
  /** Backward compatibility for legacy actual cost */
  actualCost?: number;
  /** Backward compatibility for legacy advance paid */
  advancePaid?: number;
}

/**
 * Safely extracts the active single cost value of a vendor item,
 * providing seamless backward compatibility with legacy fields.
 *
 * @param vendor Partial vendor record
 * @returns Non-negative numeric cost in INR
 */
export const getVendorCost = (vendor: Partial<HostVendor>): number => {
  if (typeof vendor.cost === 'number' && !isNaN(vendor.cost)) {
    return Math.max(0, vendor.cost);
  }
  if (typeof vendor.actualCost === 'number' && !isNaN(vendor.actualCost)) {
    return Math.max(0, vendor.actualCost);
  }
  if (typeof vendor.estimatedCost === 'number' && !isNaN(vendor.estimatedCost)) {
    return Math.max(0, vendor.estimatedCost);
  }
  return 0;
};

/**
 * Host milestone checklist item.
 */
export interface HostTask {
  /** Unique task identifier */
  id: string;
  /** Descriptive task title */
  title: string;
  /** Milestone group deadline */
  deadlineGroup?: DeadlineGroup;
  /** Target execution date or string */
  dueDate: string;
  /** Completion flag */
  completed: boolean;
}

/**
 * Root celebration state holding ledger items and tasks.
 */
export interface HostEvent {
  /** Unique celebration identifier */
  id: string;
  /** Celebration title (e.g. Udaipur Sangeet) */
  name: string;
  /** Target celebration date */
  date: string;
  /** Anticipated guest head count */
  guestCount: number;
  /** Allocated total budget ceiling in INR */
  totalBudget: number;
  /** Line items and vendor contracts */
  vendors: HostVendor[];
  /** Chronological task checklist */
  tasks: HostTask[];
}

/**
 * Proposed vendor adjustment emitted by the AI anomaly engine.
 */
export interface AnomalyAdjustment {
  /** Optional vendor ID matching current ledger */
  vendorId?: string;
  /** Vendor or service name */
  name: string;
  /** Service category */
  category?: string;
  /** Recommended amount to trim in INR */
  cutAmount: number;
  /** Recalculated cost target */
  newActualCost?: number;
  /** Recalculated cost target */
  newCost?: number;
  /** Cultural and financial rationale for the adjustment */
  rationale: string;
}

/**
 * Structured anomaly analysis payload returned by the AI assistant.
 */
export interface AnomalyData {
  /** Total calculated deficit to absorb in INR */
  calculatedDeficit: number;
  /** Delta of guest attendees (e.g. +30) */
  guestCountDelta?: number;
  /** Percentage of budget loss (e.g. 15%) */
  budgetDropPercent?: number;
  /** Recommended new budget cap ceiling */
  newBudgetCap?: number;
  /** High-level recommendations */
  recommendations: string[];
  /** Line-by-line vendor budget cuts */
  vendorAdjustments: AnomalyAdjustment[];
}

/**
 * Chat message entity between host and AI assistant.
 */
export interface ChatMessage {
  /** Unique message identifier */
  id: string;
  /** Sender role */
  role: 'user' | 'assistant';
  /** Message body in markdown */
  content: string;
  /** Formatted timestamp */
  timestamp: string;
  /** True if message represents an anomaly shock calculation */
  isAnomaly?: boolean;
  /** Structured anomaly data payload */
  anomalyData?: AnomalyData | null;
  /** True if user clicked Apply Changes to ledger */
  applied?: boolean;
}

/**
 * Active application view state.
 */
export type AppView = 'home' | 'budget' | 'checklist' | 'ai' | 'menu';

/**
 * Navigation tab alias.
 */
export type HostNavTab = AppView;

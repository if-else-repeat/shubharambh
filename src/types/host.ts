export type DeadlineGroup = '3 Months Out' | '1 Month Out' | 'Week Of' | 'Day Of';

export interface HostVendor {
  id: string;
  name: string;
  category: string;
  cost: number; // The single cost tally
  status: 'Pending' | 'Booked' | 'Paid';
  contactPerson?: string;
  // Optional for backward compatibility with existing saved objects
  estimatedCost?: number;
  actualCost?: number;
  advancePaid?: number;
}

export const getVendorCost = (vendor: HostVendor): number => {
  if (typeof vendor.cost === 'number' && !isNaN(vendor.cost)) {
    return vendor.cost;
  }
  if (typeof vendor.actualCost === 'number' && !isNaN(vendor.actualCost)) {
    return vendor.actualCost;
  }
  if (typeof vendor.estimatedCost === 'number' && !isNaN(vendor.estimatedCost)) {
    return vendor.estimatedCost;
  }
  return 0;
};

export interface HostTask {
  id: string;
  title: string;
  deadlineGroup?: DeadlineGroup;
  dueDate: string;
  completed: boolean;
}

export interface HostEvent {
  id: string;
  name: string;
  date: string;
  guestCount: number;
  totalBudget: number;
  vendors: HostVendor[];
  tasks: HostTask[];
}

export interface AnomalyAdjustment {
  vendorId?: string;
  name: string;
  category?: string;
  cutAmount: number;
  newActualCost?: number;
  newCost?: number;
  rationale: string;
}

export interface AnomalyData {
  calculatedDeficit: number;
  guestCountDelta?: number;
  budgetDropPercent?: number;
  newBudgetCap?: number;
  recommendations: string[];
  vendorAdjustments: AnomalyAdjustment[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isAnomaly?: boolean;
  anomalyData?: AnomalyData | null;
  applied?: boolean;
}

export type AppView = 'home' | 'budget' | 'checklist' | 'ai' | 'menu';
export type HostNavTab = AppView;


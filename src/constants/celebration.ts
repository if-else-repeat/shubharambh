/**
 * Centralized constants and configuration for shubharambh celebration planner.
 */

export const VENDOR_CATEGORIES = [
  'Venue',
  'Catering',
  'Decor',
  'Photography',
  'Attire',
  'Ritual',
  'Music',
  'Stationery',
  'Gifts',
  'Other',
] as const;

export type VendorCategoryType = (typeof VENDOR_CATEGORIES)[number];

export const VENDOR_STATUSES = ['Pending', 'Booked', 'Paid'] as const;

export type VendorStatusType = (typeof VENDOR_STATUSES)[number];

export const TASK_DEADLINE_GROUPS = [
  '3 Months Out',
  '1 Month Out',
  'Week Of',
  'Day Of',
] as const;

export type TaskDeadlineGroupType = (typeof TASK_DEADLINE_GROUPS)[number];

export const BRAND_COLORS = {
  BACKGROUND: '#0A0A0A',
  GOLD: '#E5A91A',
  CRIMSON: '#C41E3A',
} as const;

export const CATEGORY_COLORS: Record<string, string> = {
  Venue: '#E5A91A',
  Catering: '#C41E3A',
  Decor: '#D97706',
  Photography: '#B45309',
  Attire: '#9333EA',
  Ritual: '#EA580C',
  Music: '#16A34A',
  Stationery: '#2563EB',
  Gifts: '#DB2777',
  Other: '#6B7280',
};

export const DEFAULT_SUGGESTED_PROMPTS = [
  'Catering plate wastage audit and leakages',
  'Micro celebration decor ideas on low budget',
  'Shopping guide for clothing and invitation cards',
] as const;

// Database ENUM types matching Supabase exactly
export type DbMetricType = 'conversion' | 'loan_size' | 'interest_rate';
export type DbUserRole = 'admin' | 'user';

// Mapping object for display names
export const METRIC_TYPE_DISPLAY: Record<DbMetricType, string> = {
  'conversion': 'Conversion',
  'loan_size': 'Average Loan Size',
  'interest_rate': 'Interest Rate'
} as const;

// Type for display names
export type MetricTypeDisplay = typeof METRIC_TYPE_DISPLAY[DbMetricType];

// Utility functions
export function getMetricTypeDisplay(type: DbMetricType): MetricTypeDisplay {
  return METRIC_TYPE_DISPLAY[type];
}

export function getDbMetricType(display: MetricTypeDisplay): DbMetricType {
  const entry = Object.entries(METRIC_TYPE_DISPLAY).find(([_, value]) => value === display);
  if (!entry) throw new Error(`Invalid metric type display name: ${display}`);
  return entry[0] as DbMetricType;
} 
import { DbMetricType } from '../types/database';

/**
 * Format metric values based on their type
 */
export function formatMetricValue(value: number, type: DbMetricType): string {
  switch (type) {
    case 'conversion':
      return `${(value * 100).toFixed(1)}%`;
    case 'loan_size':
      return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    case 'interest_rate':
      return `${value.toFixed(2)}%`;
    default:
      return value.toString();
  }
} 
import { Initiative } from '../types/initiative';
import { MonthlyCapacity } from '../types/capacity';

/**
 * Represents the effort allocation for a specific month
 * @interface MonthlyEffort
 * @property {string} month - The month in YYYY-MM format
 * @property {number} availableDays - Total available working days in the month
 * @property {number} totalEffort - Total effort allocated (mandatory + optional)
 * @property {number} mandatoryEffort - Effort allocated to mandatory initiatives
 * @property {number} optionalEffort - Effort allocated to optional initiatives
 */
interface MonthlyEffort {
  month: string;
  availableDays: number;
  totalEffort: number;
  mandatoryEffort: number;
  optionalEffort: number;
}

/**
 * Calculates the monthly effort distribution for a set of initiatives
 * @param {Initiative[]} initiatives - Array of initiatives to calculate effort for
 * @param {MonthlyCapacity[]} monthlyCapacities - Array of monthly capacity values
 * @returns {MonthlyEffort[]} Array of monthly effort calculations
 * 
 * @description
 * For each initiative, the function:
 * 1. Determines start and end dates (uses defaults if not specified)
 * 2. Distributes effort evenly across the initiative's duration
 * 3. Categorizes effort as mandatory or optional
 * 4. Aggregates effort by month
 */
export function calculateMonthlyEffort(
  initiatives: Initiative[] = [],
  monthlyCapacities: MonthlyCapacity[] = []
): MonthlyEffort[] {
  if (!monthlyCapacities?.length) {
    return [];
  }

  // Initialize monthly effort data
  const monthlyEffortMap = new Map<string, MonthlyEffort>();
  monthlyCapacities.forEach(({ month, availableDays }) => {
    monthlyEffortMap.set(month, {
      month,
      availableDays,
      totalEffort: 0,
      mandatoryEffort: 0,
      optionalEffort: 0,
    });
  });

  // Calculate effort for each initiative
  initiatives.forEach((initiative) => {
    let startDate = new Date(initiative.startMonth || monthlyCapacities[0].month);
    let endDate = new Date(initiative.endMonth || monthlyCapacities[2].month); // Default to first 3 months
    
    const monthCount = (endDate.getFullYear() - startDate.getFullYear()) * 12 
      + endDate.getMonth() - startDate.getMonth() + 1;
    
    const effortPerMonth = initiative.effortEstimate / monthCount;

    monthlyCapacities.forEach(({ month }) => {
      const currentDate = new Date(month);
      if (currentDate >= startDate && currentDate <= endDate) {
        const monthData = monthlyEffortMap.get(month);
        if (monthData) {
          monthData.totalEffort += effortPerMonth;
          if (initiative.isMandatory) {
            monthData.mandatoryEffort += effortPerMonth;
          } else {
            monthData.optionalEffort += effortPerMonth;
          }
        }
      }
    });
  });

  return Array.from(monthlyEffortMap.values());
} 
import { Initiative } from '../types/initiative';
import { MonthlyCapacity } from '../types/capacity';
import { fromMonthString, formatDateToYYYYMMDD } from './dateUtils'; // Import necessary date utils

/**
 * Represents the effort allocation for a specific month
 * @interface MonthlyEffort
 * @property {string} month - The month in YYYY-MM format
 * @property {number} availableDays - Total available working days in the month
 * @property {number} totalEffort - Total effort allocated (mandatory + optional)
 * @property {number} mandatoryEffort - Effort allocated to mandatory initiatives
 * @property {number} optionalEffort - Effort allocated to optional initiatives
 */
// Export the interface
export interface MonthlyEffort {
  month: string;
  availableDays: number;
  totalEffort: number;
  mandatoryEffort: number;
  optionalEffort: number;
}

// Helper function to safely format a date string (or Date object) to YYYY-MM
function getYearMonthString(dateInput: string | Date | null): string | null {
  if (!dateInput) return null;
  try {
    const dateObj = dateInput instanceof Date ? dateInput : new Date(dateInput);
    const formatted = formatDateToYYYYMMDD(dateObj); // Get YYYY-MM-DD using UTC
    return formatted ? formatted.slice(0, 7) : null; // Extract YYYY-MM
  } catch (e) {
    console.error("Error parsing date input for YYYY-MM formatting:", dateInput, e);
    return null;
  }
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
    console.warn('calculateMonthlyEffort called with empty monthlyCapacities');
    return [];
  }

  // Get the range of months we are calculating for
  const capacityMonthStrings = monthlyCapacities.map(mc => mc.month); // Should be YYYY-MM
  const firstMonthStr = capacityMonthStrings[0];
  const lastMonthStr = capacityMonthStrings[capacityMonthStrings.length - 1];

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
    // --- Date Handling --- 
    // Use helper function for consistent YYYY-MM format
    const startMonthStr = getYearMonthString(initiative.startMonth) || firstMonthStr;
    const endMonthStr = getYearMonthString(initiative.endMonth) || lastMonthStr;

    // Skip initiative if its date range is invalid or completely outside the capacity window
    if (!startMonthStr || !endMonthStr || startMonthStr > lastMonthStr || endMonthStr < firstMonthStr) {
      return; 
    }

    // Clamp the initiative's effective range to the capacity window for calculation
    const effectiveStartMonth = startMonthStr < firstMonthStr ? firstMonthStr : startMonthStr;
    const effectiveEndMonth = endMonthStr > lastMonthStr ? lastMonthStr : endMonthStr;

    // Calculate duration in months based on the *effective* range
    const startDate = fromMonthString(effectiveStartMonth);
    const endDate = fromMonthString(effectiveEndMonth);

    // Check for invalid dates from fromMonthString before calculation
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      console.warn('Skipping initiative due to invalid effective date range:', initiative.name, effectiveStartMonth, effectiveEndMonth);
      return;
    }
    
    const monthCount = (endDate.getFullYear() - startDate.getFullYear()) * 12 
                      + endDate.getMonth() - startDate.getMonth() + 1;
    
    // Avoid division by zero or negative month counts
    if (monthCount <= 0) {
        console.warn('Skipping initiative due to invalid month count:', initiative.name, monthCount);
        return;
    }
    
    const effortPerMonth = initiative.effortEstimate / monthCount;

    // --- Effort Allocation --- 
    capacityMonthStrings.forEach((currentMonthStr) => {
      // Allocate effort if currentMonth is within the initiative's *effective* date range
      if (currentMonthStr >= effectiveStartMonth && currentMonthStr <= effectiveEndMonth) {
        const monthData = monthlyEffortMap.get(currentMonthStr);
        if (monthData) {
          const effortToAdd = effortPerMonth; // Keep even distribution for now
          monthData.totalEffort += effortToAdd;
          if (initiative.isMandatory) {
            monthData.mandatoryEffort += effortToAdd;
          } else {
            monthData.optionalEffort += effortToAdd;
          }
        }
      }
    });
  });

  // Round efforts to avoid floating point display issues
  const results = Array.from(monthlyEffortMap.values());
  results.forEach(res => {
      res.totalEffort = parseFloat(res.totalEffort.toFixed(2));
      res.mandatoryEffort = parseFloat(res.mandatoryEffort.toFixed(2));
      res.optionalEffort = parseFloat(res.optionalEffort.toFixed(2));
  });

  return results;
} 
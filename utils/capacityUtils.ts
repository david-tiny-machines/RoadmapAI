import { Initiative } from '../types/initiative';
import { MonthlyCapacity } from '../types/capacity';
import { fromMonthString, formatDateToYYYYMMDD, getMonthsBetween } from './dateUtils'; // Import necessary date utils
import { ScheduledInitiative } from './schedulingUtils'; // Import the scheduled type

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

// New Interface for Scheduled Load
export interface MonthlyScheduledLoad {
  month: string; // YYYY-MM-DD format (or YYYY-MM, ensure consistency)
  availableDays: number;
  scheduledLoad: number;
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
 * Calculates the scheduled monthly effort load based on capacity-constrained schedule.
 * @param scheduledInitiatives - Array of initiatives with calculated start/delivery months.
 * @param monthlyCapacities - Array of monthly capacity values.
 * @returns Array of monthly scheduled load calculations.
 */
export function calculateScheduledMonthlyLoad(
  scheduledInitiatives: ScheduledInitiative[] = [],
  monthlyCapacities: MonthlyCapacity[] = []
): MonthlyScheduledLoad[] {
  if (!monthlyCapacities?.length) {
    console.warn('calculateScheduledMonthlyLoad called with empty monthlyCapacities');
    return [];
  }

  // Initialize monthly load data
  const monthlyLoadMap = new Map<string, MonthlyScheduledLoad>();
  monthlyCapacities.forEach(({ month, availableDays }) => {
    // Use the YYYY-MM format consistent with MonthlyCapacity
    monthlyLoadMap.set(month, {
      month,
      availableDays,
      scheduledLoad: 0,
    });
  });

  // Calculate load for each scheduled initiative
  scheduledInitiatives.forEach((initiative) => {
    // Skip initiatives that weren't scheduled or have no effort
    if (!initiative.roadmap_start_month || !initiative.roadmap_delivery_month || initiative.effort_estimate <= 0) {
      return;
    }

    try {
      const startDate = new Date(initiative.roadmap_start_month);
      const endDate = new Date(initiative.roadmap_delivery_month);

      // Ensure dates are valid
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          console.warn(`Invalid start/delivery date for initiative ${initiative.id}: ${initiative.roadmap_start_month} / ${initiative.roadmap_delivery_month}`);
          return;
      }

      // Calculate duration in months (inclusive)
      const durationInMonths = getMonthsBetween(startDate, endDate);

      if (durationInMonths <= 0) {
        console.warn(`Invalid duration for initiative ${initiative.id}: Start ${initiative.roadmap_start_month}, End ${initiative.roadmap_delivery_month}`);
        return;
      }

      const effortPerMonth = initiative.effort_estimate / durationInMonths;

      // Iterate through the capacity months and allocate effort if initiative is active
      monthlyCapacities.forEach(({ month }) => {
         // Convert capacity month (YYYY-MM) and initiative dates (YYYY-MM-DD) to comparable format (e.g., Date objects)
         const currentMonthDate = fromMonthString(month);
         // Compare month range, inclusive
         if (currentMonthDate >= startDate && currentMonthDate <= endDate) {
            const monthData = monthlyLoadMap.get(month);
            if (monthData) {
                monthData.scheduledLoad += effortPerMonth;
            }
         }
      });

    } catch (e) {
        console.error(`Error processing initiative ${initiative.id} for scheduled load:`, e);
    }
  });

  // Round load to avoid floating point display issues
  const results = Array.from(monthlyLoadMap.values());
  results.forEach(res => {
    res.scheduledLoad = parseFloat(res.scheduledLoad.toFixed(2));
  });

  return results;
}

// Remove or comment out the old calculateMonthlyEffort function
/*
export function calculateMonthlyEffort(
  initiatives: Initiative[] = [],
  monthlyCapacities: MonthlyCapacity[] = []
): MonthlyEffort[] {
  // ... old implementation ...
}
*/ 
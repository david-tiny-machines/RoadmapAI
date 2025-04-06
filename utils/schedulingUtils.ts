import { DbCapacityType, DbInitiativeType } from '../types/database';
import { formatDateToYYYYMMDD } from './dateUtils'; // Assuming dateUtils exists

export type ScheduledInitiative = DbInitiativeType & {
  roadmap_delivery_month: string | null; // YYYY-MM-DD or null if unscheduled
  deadline_missed: boolean; // True if roadmap_delivery_month > end_month
};

/**
 * Calculates the capacity-aware roadmap schedule.
 * Initiatives are scheduled based on mandatory status first, then priority score.
 * Respects initiative.start_month as the earliest allocation month.
 * Flags initiatives where roadmap_delivery_month exceeds initiative.end_month.
 *
 * @param initiatives - Array of initiatives to schedule (DbInitiativeType).
 * @param capacity - Array of monthly capacity data (DbCapacityType), MUST cover the planning horizon.
 * @returns Array of initiatives augmented with their calculated delivery month and deadline status (ScheduledInitiative).
 */
export const calculateRoadmapSchedule = (
  initiatives: DbInitiativeType[],
  capacity: DbCapacityType[],
): ScheduledInitiative[] => {
  if (!initiatives || initiatives.length === 0) {
    return [];
  }
  if (!capacity || capacity.length === 0) {
    // Cannot schedule without capacity info
    return initiatives.map((initiative) => ({
      ...initiative,
      roadmap_delivery_month: null,
      deadline_missed: false, // Cannot miss deadline if cannot be scheduled
    }));
  }

  // 1. Sort Initiatives: Mandatory first, then by priority_score descending
  const sortedInitiatives = [...initiatives].sort((a, b) => {
    // Mandatory initiatives first
    if (a.is_mandatory !== b.is_mandatory) {
      return a.is_mandatory ? -1 : 1;
    }
    // Then by priority score descending (higher is better)
    // Handle null/undefined scores just in case, placing them last
    const scoreA = a.priority_score ?? -Infinity;
    const scoreB = b.priority_score ?? -Infinity;
    return scoreB - scoreA;
  });

  // 2. Prepare Capacity Tracking & Month Order
  // Sort capacity chronologically just in case it's not already
  const sortedCapacity = [...capacity].sort((a, b) =>
    new Date(a.month).getTime() - new Date(b.month).getTime()
  );

  const remainingCapacityMap = new Map<string, number>();
  const capacityMonths: string[] = []; // Store YYYY-MM-DD month strings in order

  sortedCapacity.forEach(cap => {
    // Ensure month is in YYYY-MM-DD format (first day of month)
    // Assuming cap.month is already in a parseable format like YYYY-MM-DD
    const monthKey = formatDateToYYYYMMDD(new Date(cap.month));
    if (monthKey) {
       remainingCapacityMap.set(monthKey, cap.available_days);
       capacityMonths.push(monthKey);
    } else {
        console.warn(`Invalid date format in capacity data: ${cap.month}`);
    }
  });

  if (capacityMonths.length === 0) {
     console.error("No valid capacity months found for scheduling.");
     return initiatives.map(initiative => ({ ...initiative, roadmap_delivery_month: null, deadline_missed: false }));
  }


  // 3. Initialize Result Structure (using a map for easy updates)
  const scheduledInitiativesMap = new Map<string, ScheduledInitiative>(
    initiatives.map(initiative => [
      initiative.id,
      { ...initiative, roadmap_delivery_month: null, deadline_missed: false }, // Initialize flag
    ])
  );

  // 4. Iterate & Allocate Effort
  for (const initiative of sortedInitiatives) {
    let effortRemaining = initiative.effort_estimate;
    let deliveryMonth: string | null = null;
    let deadline_missed = false;

    // Skip initiatives with zero or negative effort
    if (effortRemaining <= 0) {
        // Optionally assign a delivery month immediately or leave as null
        // Assigning first capacity month might be reasonable for 0 effort tasks
        // deliveryMonth = capacityMonths[0];
        // update map..
        const initiativeToUpdate = scheduledInitiativesMap.get(initiative.id);
        if (initiativeToUpdate) {
             // Decide how to handle 0 effort - maybe schedule in first available month?
             // For now, leave as null, requires product decision.
             initiativeToUpdate.roadmap_delivery_month = null; // Or capacityMonths[0]
             initiativeToUpdate.deadline_missed = false; // Cannot miss deadline if 0 effort
        }
        continue; // Move to next initiative
    }

    // Determine the starting month index for allocation based on initiative.start_month
    let startMonthIndex = 0;
    if (initiative.start_month) {
      const initiativeStartDate = new Date(initiative.start_month);
      // Find the first capacity month that is >= initiative start month
      const foundIndex = capacityMonths.findIndex(month => new Date(month) >= initiativeStartDate);
      if (foundIndex !== -1) {
        startMonthIndex = foundIndex;
      } else {
        // If start_month is after all available capacity months, it cannot be scheduled
        console.warn(`Initiative ${initiative.id} start month ${initiative.start_month} is after the capacity horizon.`);
        // Update map to explicitly show unscheduled, then skip
        const initiativeToUpdate = scheduledInitiativesMap.get(initiative.id);
        if (initiativeToUpdate) {
          initiativeToUpdate.roadmap_delivery_month = null;
          initiativeToUpdate.deadline_missed = !!initiative.end_month; // Missed if there was a deadline
        }
        continue; // Skip to next initiative
      }
    }

    // Loop through available months *starting from the calculated startMonthIndex*
    for (let i = startMonthIndex; i < capacityMonths.length; i++) {
      const currentMonth = capacityMonths[i];
      const capacityAvailableThisMonth = remainingCapacityMap.get(currentMonth) ?? 0;

      if (capacityAvailableThisMonth <= 0) {
        continue;
      }

      const effortToAllocateThisMonth = Math.min(
        effortRemaining,
        capacityAvailableThisMonth
      );

      if (effortToAllocateThisMonth > 0) {
        effortRemaining -= effortToAllocateThisMonth;
        remainingCapacityMap.set(
          currentMonth,
          capacityAvailableThisMonth - effortToAllocateThisMonth
        );

        if (effortRemaining <= 0) {
          deliveryMonth = currentMonth; // Finished in this month
          break; // Stop allocating for this initiative
        }
      }
    } // End loop through months

    // 5. Check Deadline
    if (deliveryMonth && initiative.end_month) {
      try {
        const deliveryDate = new Date(deliveryMonth);
        const deadlineDate = new Date(initiative.end_month);
        // Ensure dates are valid before comparing
        if (!isNaN(deliveryDate.getTime()) && !isNaN(deadlineDate.getTime())) {
             // Delivery month is the month it *finishes*. If that month is after the end_month, deadline missed.
            if (deliveryDate > deadlineDate) {
                deadline_missed = true;
            }
        }
      } catch (e) {
        console.error(`Error comparing dates for initiative ${initiative.id}:`, e);
      }
    } else if (!deliveryMonth && initiative.end_month) {
      // If it couldn't be scheduled at all, and had an end date, it missed the deadline
      deadline_missed = true;
    }

    // 6. Update the result map
    const initiativeToUpdate = scheduledInitiativesMap.get(initiative.id);
    if (initiativeToUpdate) {
      initiativeToUpdate.roadmap_delivery_month = deliveryMonth;
      initiativeToUpdate.deadline_missed = deadline_missed;
    }
  } // End loop through initiatives

  // 7. Convert map back to array, preserving the sort order
  const finalResults: ScheduledInitiative[] = sortedInitiatives.map(init => {
    // Get the calculated details from the map using the initiative's ID
    const scheduledData = scheduledInitiativesMap.get(init.id);
    // Fallback logic in case something went wrong (shouldn't happen)
    return scheduledData || { ...init, roadmap_delivery_month: null, deadline_missed: false };
  });

  return finalResults;
}; 
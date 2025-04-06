import { DbCapacityType } from '../types/database';
import { Initiative } from '../types/database'; // Import frontend Initiative type
import { formatDateToYYYYMMDD } from './dateUtils'; // Assuming dateUtils exists
import { calculatePriorityScore } from './prioritizationUtils'; // Import priority calculation

export type ScheduledInitiative = {
  id: string;
  userId: string;
  name: string;
  valueLever: Initiative['valueLever']; // Use Initiative type fields
  uplift: number;
  confidence: number;
  effortEstimate: number;
  startMonth: string | null;
  endMonth: string | null;
  isMandatory: boolean;
  createdAt: string;
  updatedAt: string;
  roadmap_delivery_month: string | null; // YYYY-MM-DD or null if unscheduled
  deadline_missed: boolean; // True if roadmap_delivery_month > end_month
  roadmap_start_month: string | null; // YYYY-MM-DD or null if unscheduled
};

// New: Define the structure for detailed monthly allocation
export type MonthlyAllocationMap = {
    [initiativeId: string]: {
        [month: string]: number; // month is YYYY-MM-DD, value is effort allocated
    };
};

// New: Define the return type for the enhanced scheduler
export interface ScheduleResult {
    scheduledInitiatives: ScheduledInitiative[];
    monthlyAllocation: MonthlyAllocationMap;
}

/**
 * Calculates the capacity-aware roadmap schedule and detailed monthly effort allocation.
 * Initiatives are scheduled based on mandatory status first, then priority score.
 * Respects initiative.start_month as the earliest allocation month.
 * Flags initiatives where roadmap_delivery_month exceeds initiative.end_month.
 *
 * @param initiatives - Array of initiatives to schedule (Initiative[]).
 * @param capacity - Array of monthly capacity data (DbCapacityType), MUST cover the planning horizon.
 * @returns An object containing scheduledInitiatives array and monthlyAllocation map.
 */
export const calculateRoadmapSchedule = (
  initiatives: Initiative[], // Changed parameter type
  capacity: DbCapacityType[],
): ScheduleResult => { // Return type updated
  const emptyResult: ScheduleResult = { scheduledInitiatives: [], monthlyAllocation: {} };

  if (!initiatives || initiatives.length === 0) {
    return emptyResult;
  }
  if (!capacity || capacity.length === 0) {
    // Cannot schedule without capacity info
    const tempUnscheduled = initiatives.map((initiative) => ({
      ...initiative,
      roadmap_delivery_month: null,
      deadline_missed: false,
      roadmap_start_month: null,
    }));
    return { scheduledInitiatives: tempUnscheduled, monthlyAllocation: {} };
  }

  // 1. Sort Initiatives: Mandatory first, then by priority_score descending
  const sortedInitiatives = [...initiatives].sort((a, b) => {
    if (a.isMandatory !== b.isMandatory) { // Use isMandatory
      return a.isMandatory ? -1 : 1;
    }
    // Calculate priority score on the fly for sorting
    const scoreA = calculatePriorityScore(a);
    const scoreB = calculatePriorityScore(b);
    return scoreB - scoreA;
  });

  // 2. Prepare Capacity Tracking & Month Order
  const sortedCapacity = [...capacity].sort((a, b) =>
    new Date(a.month).getTime() - new Date(b.month).getTime()
  );

  const remainingCapacityMap = new Map<string, number>();
  const capacityMonths: string[] = [];

  sortedCapacity.forEach(cap => {
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
     const tempUnscheduled = initiatives.map(initiative => ({ ...initiative, roadmap_delivery_month: null, deadline_missed: false, roadmap_start_month: null }));
     return { scheduledInitiatives: tempUnscheduled, monthlyAllocation: {} };
  }


  // 3. Initialize Result Structure
  const scheduledInitiativesMap = new Map<string, ScheduledInitiative>(
    initiatives.map(initiative => [
      initiative.id,
      { 
        ...initiative, // Spread frontend fields
        roadmap_delivery_month: null, 
        deadline_missed: false, 
        roadmap_start_month: null 
      },
    ])
  );
  const monthlyAllocation: MonthlyAllocationMap = {}; // New: Initialize allocation map

  // 4. Iterate & Allocate Effort
  for (const initiative of sortedInitiatives) {
    let effortRemaining = initiative.effortEstimate; // Use effortEstimate
    let deliveryMonth: string | null = null;
    let startMonth: string | null = null;
    let deadline_missed = false;

    // Initialize allocation entry for this initiative
    if (effortRemaining > 0) { // Only track allocation if there's effort
         monthlyAllocation[initiative.id] = {};
    }


    if (effortRemaining <= 0) {
        const initiativeToUpdate = scheduledInitiativesMap.get(initiative.id);
        if (initiativeToUpdate) {
             initiativeToUpdate.roadmap_delivery_month = null;
             initiativeToUpdate.roadmap_start_month = null;
             initiativeToUpdate.deadline_missed = false;
        }
        continue;
    }

    // Determine the starting month index for allocation
    let startMonthIndex = 0;
    if (initiative.startMonth) { // Use startMonth
      const initiativeStartDate = new Date(initiative.startMonth);
      const foundIndex = capacityMonths.findIndex(month => new Date(month) >= initiativeStartDate);
      if (foundIndex !== -1) {
        startMonthIndex = foundIndex;
      } else {
        console.warn(`Initiative ${initiative.id} start month ${initiative.startMonth} is after the capacity horizon.`);
        const initiativeToUpdate = scheduledInitiativesMap.get(initiative.id);
        if (initiativeToUpdate) {
          initiativeToUpdate.roadmap_delivery_month = null;
          initiativeToUpdate.roadmap_start_month = null;
          initiativeToUpdate.deadline_missed = !!initiative.endMonth;
        }
        continue;
      }
    }

    // Loop through available months
    for (let i = startMonthIndex; i < capacityMonths.length; i++) {
      const currentMonth = capacityMonths[i]; // YYYY-MM-DD format
      const capacityAvailableThisMonth = remainingCapacityMap.get(currentMonth) ?? 0;

      if (capacityAvailableThisMonth <= 0) {
        continue;
      }

      const effortToAllocateThisMonth = Math.min(
        effortRemaining,
        capacityAvailableThisMonth
      );

      if (effortToAllocateThisMonth > 0) {
        if (startMonth === null) {
            startMonth = currentMonth;
        }

        // New: Track allocated effort
        monthlyAllocation[initiative.id][currentMonth] = effortToAllocateThisMonth;

        effortRemaining -= effortToAllocateThisMonth;
        remainingCapacityMap.set(
          currentMonth,
          capacityAvailableThisMonth - effortToAllocateThisMonth
        );

        if (effortRemaining <= 0) {
          deliveryMonth = currentMonth;
          break;
        }
      }
    }

    // 5. Check Deadline
    if (deliveryMonth && initiative.endMonth) { // Use endMonth
      try {
        const deliveryDate = new Date(deliveryMonth);
        const deadlineDate = new Date(initiative.endMonth);
        if (!isNaN(deliveryDate.getTime()) && !isNaN(deadlineDate.getTime())) {
            if (deliveryDate > deadlineDate) {
                deadline_missed = true;
            }
        }
      } catch (e) {
        console.error(`Error comparing dates for initiative ${initiative.id}:`, e);
      }
    } else if (!deliveryMonth && initiative.endMonth) { // Use endMonth
      deadline_missed = true;
    }

    // 6. Update the result map
    const initiativeToUpdate = scheduledInitiativesMap.get(initiative.id);
    if (initiativeToUpdate) {
      initiativeToUpdate.roadmap_delivery_month = deliveryMonth;
      initiativeToUpdate.roadmap_start_month = startMonth;
      initiativeToUpdate.deadline_missed = deadline_missed;
    }
  }

  // 7. Convert map back to array, preserving the sort order
  const finalResults: ScheduledInitiative[] = sortedInitiatives.map(init => {
    const scheduledData = scheduledInitiativesMap.get(init.id);
    // Ensure the returned object matches the ScheduledInitiative type
    return scheduledData || { 
        ...init, // Spread frontend Initiative fields
        roadmap_delivery_month: null, 
        deadline_missed: false, 
        roadmap_start_month: null 
    };
  });

  return { // Return updated structure
      scheduledInitiatives: finalResults,
      monthlyAllocation: monthlyAllocation
  };
}; 
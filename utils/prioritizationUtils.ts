import { Initiative } from '../types/initiative';
// import { MonthlyCapacity } from '../types/capacity';
// import { calculateMonthlyEffort } from './capacityUtils';

/**
 * Calculates the weighted impact score for an initiative
 * @param {Initiative} initiative - The initiative to calculate score for
 * @returns {number} Weighted impact score (uplift × confidence)
 */
export function calculateWeightedImpact(initiative: Initiative): number {
  return (initiative.uplift * initiative.confidence) / 100; // Confidence is 0-100, so divide by 100
}

/**
 * Calculates a prioritization score for an initiative
 * Higher scores indicate higher priority initiatives
 * 
 * Score is calculated using:
 * - Weighted impact (uplift × confidence)
 * - Effort estimate (with diminishing returns)
 * - Value lever importance (future enhancement)
 * 
 * @param {Initiative} initiative - The initiative to score
 * @returns {number} Priority score (higher is better)
 */
export function calculatePriorityScore(initiative: Initiative): number {
  const weightedImpact = calculateWeightedImpact(initiative);
  
  // Apply diminishing returns to effort using log scale
  // This means doubling effort doesn't halve the score
  const effortFactor = 1 / (1 + Math.log(initiative.effortEstimate));
  
  // Combine factors - currently weighted impact × effort factor
  // Future: Could add value lever weights here
  return weightedImpact * effortFactor * 100; // Scale up for readability
}

/**
 * Sorts initiatives by priority, considering:
 * 1. Mandatory status (mandatory items first)
 * 2. Priority score
 * 
 * @param {Initiative[]} initiatives - Array of initiatives to sort
 * @returns {Initiative[]} Sorted array of initiatives
 */
export function sortInitiativesByPriority(initiatives: Initiative[]): Initiative[] {
  return [...initiatives].sort((a, b) => {
    // Mandatory items always come first
    if (a.isMandatory !== b.isMandatory) {
      return a.isMandatory ? -1 : 1;
    }

    // Then sort by priority score
    const aScore = calculatePriorityScore(a);
    const bScore = calculatePriorityScore(b);
    return bScore - aScore;
  });
}

// Remove unused function selectInitiativesWithinCapacity
/*
export function selectInitiativesWithinCapacity(
  initiatives: Initiative[],
  monthlyCapacities: MonthlyCapacity[]
): Initiative[] {
  const sortedInitiatives = sortInitiativesByPriority(initiatives);
  const selected: Initiative[] = [];
  
  // First, add all mandatory initiatives
  const mandatoryInitiatives = sortedInitiatives.filter(i => i.isMandatory);
  selected.push(...mandatoryInitiatives);

  // Then add optional initiatives that fit within remaining capacity
  const optionalInitiatives = sortedInitiatives.filter(i => !i.isMandatory);
  
  for (const initiative of optionalInitiatives) {
    // Calculate current monthly effort with this initiative
    const withInitiative = calculateMonthlyEffort([...selected, initiative], monthlyCapacities);
    
    // Check if adding this initiative would exceed capacity in any month
    const wouldExceedCapacity = withInitiative.some(
      month => month.totalEffort > month.availableDays
    );

    if (!wouldExceedCapacity) {
      selected.push(initiative);
    }
  }

  return selected;
}
*/ 
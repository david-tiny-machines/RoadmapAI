import { Initiative } from '../types/initiative';
import { MonthlyCapacity } from '../types/capacity';

interface MonthlyEffort {
  month: string;
  availableDays: number;
  totalEffort: number;
  mandatoryEffort: number;
  optionalEffort: number;
}

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
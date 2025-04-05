export interface MonthlyCapacity {
  month: string; // YYYY-MM format
  availableDays: number;
}

export interface CapacityData {
  monthlyCapacities: MonthlyCapacity[];
} 
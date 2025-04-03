export interface MonthlyCapacity {
  month: string; // YYYY-MM format
  availableDays: number;
}

export interface CapacityData {
  id: string;
  monthlyCapacities: MonthlyCapacity[];
  updatedAt: string;
} 
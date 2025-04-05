import { fromMonthString, formatDateToYYYYMMDD } from '../utils/dateUtils';
import { MonthlyCapacity } from './capacity';

// ENUM types
export type DbMetricType = 'conversion' | 'average_loan_size' | 'interest_rate';
export type DbUserRole = 'admin' | 'user';
export type DbValueLever = 
  | 'conversion'
  | 'average_loan_size'
  | 'interest_rate'
  | 'customer_acquisition'
  | 'customer_retention'
  | 'bau';

// Display mapping
export const VALUE_LEVER_DISPLAY: Record<DbValueLever, string> = {
  conversion: 'Conversion',
  average_loan_size: 'Average loan size',
  interest_rate: 'Interest rate',
  customer_acquisition: 'Customer acquisition',
  customer_retention: 'Customer retention',
  bau: 'Business as usual (BAU)'
};

// Utility functions
export function getValueLeverDisplay(lever: DbValueLever): string {
  return VALUE_LEVER_DISPLAY[lever];
}

export function getDbValueLever(display: string): DbValueLever {
  const entry = Object.entries(VALUE_LEVER_DISPLAY).find(([_, value]) => value === display);
  if (!entry) throw new Error(`Invalid value lever display: ${display}`);
  return entry[0] as DbValueLever;
}

// Database types
export interface DbInitiativeType {
  id: string;
  user_id: string;
  name: string;
  value_lever: DbValueLever;
  uplift: number;
  confidence: number;
  effort_estimate: number;
  start_month: string | null;
  end_month: string | null;
  is_mandatory: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbCapacityType {
  id: string; // UUID from DB
  user_id: string;
  month: string; // Stored as DATE (YYYY-MM-01) in DB
  available_days: number;
  created_at: string;
  updated_at: string;
  // team_id: string | null; // Deferred
}

// Frontend types
export interface Initiative {
  id: string;
  userId: string;
  name: string;
  valueLever: DbValueLever;
  uplift: number;
  confidence: number;
  effortEstimate: number;
  startMonth: string | null;
  endMonth: string | null;
  isMandatory: boolean;
  createdAt: string;
  updatedAt: string;
}

// Conversion utilities
export function toDbInitiative(initiative: Initiative): DbInitiativeType {
  return {
    id: initiative.id,
    user_id: initiative.userId,
    name: initiative.name,
    value_lever: initiative.valueLever,
    uplift: initiative.uplift,
    confidence: initiative.confidence,
    effort_estimate: initiative.effortEstimate,
    start_month: initiative.startMonth,
    end_month: initiative.endMonth,
    is_mandatory: initiative.isMandatory,
    created_at: initiative.createdAt,
    updated_at: initiative.updatedAt,
  };
}

export function fromDbInitiative(dbInitiative: DbInitiativeType): Initiative {
  return {
    id: dbInitiative.id,
    userId: dbInitiative.user_id,
    name: dbInitiative.name,
    valueLever: dbInitiative.value_lever,
    uplift: dbInitiative.uplift,
    confidence: dbInitiative.confidence,
    effortEstimate: dbInitiative.effort_estimate,
    startMonth: dbInitiative.start_month,
    endMonth: dbInitiative.end_month,
    isMandatory: dbInitiative.is_mandatory,
    createdAt: dbInitiative.created_at,
    updatedAt: dbInitiative.updated_at,
  };
}

// Capacity Conversion Utilities

/**
 * Converts frontend MonthlyCapacity (UI format) to a format suitable for
 * upserting into the Supabase monthly_capacity table.
 * Expects month in 'YYYY-MM' format.
 * Converts month to 'YYYY-MM-01' format for DB DATE type.
 * Requires user_id.
 */
export function toDbCapacity(
  capacity: MonthlyCapacity,
  userId: string
): Omit<DbCapacityType, 'id' | 'created_at' | 'updated_at'> {
  const monthDate = fromMonthString(capacity.month); // Get Date object for start of month
  if (isNaN(monthDate.getTime())) {
    throw new Error(`Invalid month format provided to toDbCapacity: ${capacity.month}`);
  }

  const monthDbFormat = formatDateToYYYYMMDD(monthDate); // Format as YYYY-MM-01 string

  // This check is technically redundant if fromMonthString and formatDateToYYYYMMDD work correctly,
  // but provides an extra layer of safety.
  if (monthDbFormat === null) {
    throw new Error(`Failed to format valid date for month: ${capacity.month}`);
  }

  return {
    user_id: userId,
    month: monthDbFormat, // Now guaranteed to be a string
    available_days: Math.max(0, Math.round(capacity.availableDays)), // Ensure non-negative integer
  };
}

/**
 * Converts DbCapacityType (database format) to frontend MonthlyCapacity (UI format).
 * Expects month in 'YYYY-MM-DD' format (specifically YYYY-MM-01).
 * Converts month back to 'YYYY-MM' format for UI state.
 */
export function fromDbCapacity(dbCapacity: DbCapacityType): MonthlyCapacity {
  // Convert 'YYYY-MM-DD' (DB format) back to 'YYYY-MM' (UI format) using slice
  const monthUiFormat = dbCapacity.month.slice(0, 7); 

  return {
    month: monthUiFormat,
    availableDays: dbCapacity.available_days,
  };
} 
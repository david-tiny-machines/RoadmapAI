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
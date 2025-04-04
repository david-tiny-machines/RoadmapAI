export type ValueLever = 
  | 'Conversion'
  | 'Average Loan Size'
  | 'Interest Rate'
  | 'Customer Acquisition'
  | 'Customer Retention'
  | 'Cost Reduction'
  | 'Compliance/Risk Mitigation'
  | 'BAU obligations';

export interface Initiative {
  id: string;
  user_id: string;
  name: string;
  value_lever: string;
  uplift: number;
  confidence: number;
  effort_estimate: number;
  priority_score: number;
  start_month: string | null;
  end_month: string | null;
  is_mandatory: boolean;
  created_at: string;
  updated_at: string;
} 
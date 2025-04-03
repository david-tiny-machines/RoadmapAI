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
  name: string;
  valueLever: ValueLever;
  uplift: number;
  confidence: number;
  effortEstimate: number;
  isMandatory: boolean;
  startMonth?: string;
  endMonth?: string;
} 
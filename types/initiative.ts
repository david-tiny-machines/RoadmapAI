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
  estimatedUplift: number;
  confidence: number;
  effortEstimate: number;
  startMonth: string;
  endMonth: string;
  isMandatory: boolean;
  createdAt: string;
  updatedAt: string;
} 
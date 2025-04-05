import { DbValueLever } from './database';

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
import { DbMetricType, MetricTypeDisplay } from './database';

export interface HistoricalMetric {
  id: number;
  month: Date;
  value: number;
  type: DbMetricType;
  created_at: Date;
  updated_at: Date;
}

export interface HistoricalMetricDisplay {
  id: string;
  type: MetricTypeDisplay;
  value: number;
  month: Date;
  createdAt: string;
  updatedAt: string;
}

export interface MetricInput {
  type: DbMetricType;
  value: number;
  month: Date; // Store first day of month, display only month/year
} 
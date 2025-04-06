import { DbMetricType, METRIC_TYPE_DISPLAY } from './database';

export interface HistoricalMetric {
  id: string;
  month: Date;
  value: number;
  type: DbMetricType;
  createdAt: Date;
  updatedAt: Date;
}

export interface HistoricalMetricDisplay {
  id: string;
  type: string;
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
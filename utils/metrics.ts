import { z } from 'zod';
import { addMonths, format, parse, startOfMonth } from 'date-fns';
import { supabase } from './supabase';

// Types
export type MetricType = 'conversion' | 'loan_size' | 'interest_rate';

export interface Metric {
  id: string;
  type: MetricType;
  value: number;
  date: string;
  created_at?: string;
}

// Validation schemas
export const metricSchema = z.object({
  type: z.enum(['conversion', 'loan_size', 'interest_rate']),
  value: z.number().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const batchMetricsSchema = z.array(metricSchema);

// Utility functions
export const formatDate = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

export const parseDate = (dateStr: string): Date => {
  return parse(dateStr, 'yyyy-MM-dd', new Date());
};

// Data fetching functions
export async function fetchMetricHistory(
  metricType: MetricType,
  startDate: string,
  endDate: string
): Promise<Metric[]> {
  const { data, error } = await supabase
    .from('metrics')
    .select('*')
    .eq('type', metricType)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });

  if (error) throw error;
  return data || [];
}

// Forecast calculation
export function calculateForecast(
  baselineMetrics: Metric[],
  initiatives: any[],
  forecastMonths: number
): { date: string; baseline: number; forecast: number }[] {
  if (!baselineMetrics.length) return [];

  const lastMetric = baselineMetrics[baselineMetrics.length - 1];
  const baselineValue = lastMetric.value;
  const startDate = parseDate(lastMetric.date);

  const forecast = Array.from({ length: forecastMonths }, (_, i) => {
    const date = formatDate(addMonths(startDate, i + 1));
    
    // Calculate cumulative uplift from initiatives
    const applicableInitiatives = initiatives.filter(initiative => {
      const startMonth = initiative.start_month ? parseDate(initiative.start_month) : null;
      return startMonth && startMonth <= parseDate(date);
    });

    const uplift = applicableInitiatives.reduce((acc, initiative) => {
      return acc + (initiative.uplift * initiative.confidence / 100);
    }, 0);

    return {
      date,
      baseline: baselineValue,
      forecast: baselineValue * (1 + uplift)
    };
  });

  return forecast;
}

// Metric aggregation
export function aggregateMetrics(metrics: Metric[]): {
  average: number;
  min: number;
  max: number;
  trend: 'up' | 'down' | 'stable';
} {
  if (!metrics.length) {
    return { average: 0, min: 0, max: 0, trend: 'stable' };
  }

  const values = metrics.map(m => m.value);
  const average = values.reduce((a, b) => a + b, 0) / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);

  // Calculate trend based on last 3 months
  const recentMetrics = metrics.slice(-3);
  if (recentMetrics.length < 2) return { average, min, max, trend: 'stable' };

  const firstValue = recentMetrics[0].value;
  const lastValue = recentMetrics[recentMetrics.length - 1].value;
  const trend = lastValue > firstValue ? 'up' : lastValue < firstValue ? 'down' : 'stable';

  return { average, min, max, trend };
}

// Data validation
export function validateMetricData(data: unknown): z.SafeParseReturnType<unknown, Metric> {
  return metricSchema.safeParse(data);
}

export function validateBatchMetricData(data: unknown): z.SafeParseReturnType<unknown, Metric[]> {
  return batchMetricsSchema.safeParse(data);
} 
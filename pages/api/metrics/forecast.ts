import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { MetricType } from '../../../utils/metrics';

interface ForecastRequest {
  metricType: MetricType;
  startDate: string;
  endDate: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = createServerSupabaseClient({ req, res });
    const { user } = await supabase.auth.getUser();

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { metricType, startDate, endDate } = req.body as ForecastRequest;

    // Fetch historical metrics
    const { data: metrics, error: metricsError } = await supabase
      .from('metrics')
      .select('*')
      .eq('type', metricType)
      .order('date', { ascending: true });

    if (metricsError) throw metricsError;

    // Fetch initiatives that affect this metric
    const { data: initiatives, error: initiativesError } = await supabase
      .from('initiatives')
      .select('*')
      .contains('impact_metrics', [metricType])
      .gte('start_date', startDate)
      .lte('end_date', endDate);

    if (initiativesError) throw initiativesError;

    // Calculate baseline trend from historical data
    const baselineTrend = calculateBaselineTrend(metrics);

    // Generate dates for forecast period
    const forecastDates = generateDateRange(startDate, endDate);

    // Calculate forecast values
    const forecast = forecastDates.map(date => {
      const baseline = calculateBaselineValue(date, baselineTrend);
      const impact = calculateInitiativesImpact(date, initiatives);
      return {
        date,
        baseline,
        forecast: baseline * (1 + impact),
      };
    });

    return res.status(200).json(forecast);
  } catch (error) {
    console.error('Forecast calculation error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

function calculateBaselineTrend(metrics: any[]) {
  if (metrics.length < 2) return 0;

  const xValues = metrics.map((_, i) => i);
  const yValues = metrics.map(m => m.value);

  const n = metrics.length;
  const sumX = xValues.reduce((a, b) => a + b, 0);
  const sumY = yValues.reduce((a, b) => a + b, 0);
  const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
  const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

function calculateBaselineValue(date: string, trend: { slope: number; intercept: number }) {
  const timeIndex = Math.floor((new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  return trend.slope * timeIndex + trend.intercept;
}

function calculateInitiativesImpact(date: string, initiatives: any[]) {
  return initiatives
    .filter(initiative => 
      new Date(date) >= new Date(initiative.start_date) &&
      new Date(date) <= new Date(initiative.end_date)
    )
    .reduce((total, initiative) => total + (initiative.expected_impact || 0), 0);
}

function generateDateRange(startDate: string, endDate: string) {
  const dates = [];
  let currentDate = new Date(startDate);
  const end = new Date(endDate);

  while (currentDate <= end) {
    dates.push(currentDate.toISOString().split('T')[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
} 
-- Test Data Seed Script for RoadmapAI v0.0.4a
-- User ID: 3578ff51-28af-4f04-b376-0c1a621d48cc
-- Includes 24 months of historical metrics (Apr 2023 - Mar 2025)
-- Includes start/end dates on some initiatives for testing
-- Uplift is always percentage (0-100). Priority Score uses prioritizationUtils logic.

-- Ensure clean slate (Optional: Use with caution!)
-- ALTER TABLE historical_metrics DISABLE ROW LEVEL SECURITY; -- RLS might prevent direct delete without specific policy or disabling RLS temporarily
-- DELETE FROM historical_metrics;
-- ALTER TABLE historical_metrics ENABLE ROW LEVEL SECURITY;
-- DELETE FROM monthly_capacity WHERE user_id = '3578ff51-28af-4f04-b376-0c1a621d48cc';
-- DELETE FROM initiatives WHERE user_id = '3578ff51-28af-4f04-b376-0c1a621d48cc';

-- 1. Historical Metrics (Apr 2023 - Mar 2025)
INSERT INTO historical_metrics (type, value, month)
VALUES
  -- Conversion
  ('conversion', 4.91, '2023-04-01'), ('conversion', 4.92, '2023-05-01'), ('conversion', 4.93, '2023-06-01'),
  ('conversion', 4.94, '2023-07-01'), ('conversion', 4.95, '2023-08-01'), ('conversion', 4.96, '2023-09-01'),
  ('conversion', 4.97, '2023-10-01'), ('conversion', 4.98, '2023-11-01'), ('conversion', 4.99, '2023-12-01'),
  ('conversion', 5.00, '2024-01-01'), ('conversion', 5.01, '2024-02-01'), ('conversion', 5.02, '2024-03-01'),
  ('conversion', 5.02, '2024-04-01'), ('conversion', 5.03, '2024-05-01'), ('conversion', 5.04, '2024-06-01'),
  ('conversion', 5.05, '2024-07-01'), ('conversion', 5.05, '2024-08-01'), ('conversion', 5.06, '2024-09-01'),
  ('conversion', 5.07, '2024-10-01'), ('conversion', 5.08, '2024-11-01'), ('conversion', 5.08, '2024-12-01'),
  ('conversion', 5.09, '2025-01-01'), ('conversion', 5.10, '2025-02-01'), ('conversion', 5.10, '2025-03-01'),
  -- Loan Size
  ('loan_size', 24550, '2023-04-01'), ('loan_size', 24600, '2023-05-01'), ('loan_size', 24650, '2023-06-01'),
  ('loan_size', 24700, '2023-07-01'), ('loan_size', 24750, '2023-08-01'), ('loan_size', 24800, '2023-09-01'),
  ('loan_size', 24850, '2023-10-01'), ('loan_size', 24900, '2023-11-01'), ('loan_size', 24950, '2023-12-01'),
  ('loan_size', 25000, '2024-01-01'), ('loan_size', 25050, '2024-02-01'), ('loan_size', 25100, '2024-03-01'),
  ('loan_size', 25150, '2024-04-01'), ('loan_size', 25200, '2024-05-01'), ('loan_size', 25250, '2024-06-01'),
  ('loan_size', 25300, '2024-07-01'), ('loan_size', 25350, '2024-08-01'), ('loan_size', 25400, '2024-09-01'),
  ('loan_size', 25450, '2024-10-01'), ('loan_size', 25500, '2024-11-01'), ('loan_size', 25550, '2024-12-01'),
  ('loan_size', 25600, '2025-01-01'), ('loan_size', 25650, '2025-02-01'), ('loan_size', 25700, '2025-03-01'),
  -- Interest Rate
  ('interest_rate', 8.45, '2023-04-01'), ('interest_rate', 8.46, '2023-05-01'), ('interest_rate', 8.46, '2023-06-01'),
  ('interest_rate', 8.47, '2023-07-01'), ('interest_rate', 8.48, '2023-08-01'), ('interest_rate', 8.48, '2023-09-01'),
  ('interest_rate', 8.49, '2023-10-01'), ('interest_rate', 8.49, '2023-11-01'), ('interest_rate', 8.49, '2023-12-01'),
  ('interest_rate', 8.50, '2024-01-01'), ('interest_rate', 8.50, '2024-02-01'), ('interest_rate', 8.50, '2024-03-01'),
  ('interest_rate', 8.51, '2024-04-01'), ('interest_rate', 8.51, '2024-05-01'), ('interest_rate', 8.51, '2024-06-01'),
  ('interest_rate', 8.52, '2024-07-01'), ('interest_rate', 8.52, '2024-08-01'), ('interest_rate', 8.52, '2024-09-01'),
  ('interest_rate', 8.53, '2024-10-01'), ('interest_rate', 8.53, '2024-11-01'), ('interest_rate', 8.53, '2024-12-01'),
  ('interest_rate', 8.54, '2025-01-01'), ('interest_rate', 8.54, '2025-02-01'), ('interest_rate', 8.54, '2025-03-01')
ON CONFLICT (type, month) DO NOTHING;

-- 2. Monthly Capacity (18 months: Jul 2025 - Dec 2026)
-- Added Apr 2025 - Jun 2025 based on user input (assuming ~65 days)
INSERT INTO monthly_capacity (user_id, month, available_days)
VALUES
  ('3578ff51-28af-4f04-b376-0c1a621d48cc', '2025-04-01', 65),
  ('3578ff51-28af-4f04-b376-0c1a621d48cc', '2025-05-01', 65),
  ('3578ff51-28af-4f04-b376-0c1a621d48cc', '2025-06-01', 65),
  ('3578ff51-28af-4f04-b376-0c1a621d48cc', '2025-07-01', 60),
  ('3578ff51-28af-4f04-b376-0c1a621d48cc', '2025-08-01', 65),
  ('3578ff51-28af-4f04-b376-0c1a621d48cc', '2025-09-01', 60),
  ('3578ff51-28af-4f04-b376-0c1a621d48cc', '2025-10-01', 70),
  ('3578ff51-28af-4f04-b376-0c1a621d48cc', '2025-11-01', 60),
  ('3578ff51-28af-4f04-b376-0c1a621d48cc', '2025-12-01', 50),
  ('3578ff51-28af-4f04-b376-0c1a621d48cc', '2026-01-01', 70),
  ('3578ff51-28af-4f04-b376-0c1a621d48cc', '2026-02-01', 65),
  ('3578ff51-28af-4f04-b376-0c1a621d48cc', '2026-03-01', 70),
  ('3578ff51-28af-4f04-b376-0c1a621d48cc', '2026-04-01', 65),
  ('3578ff51-28af-4f04-b376-0c1a621d48cc', '2026-05-01', 70),
  ('3578ff51-28af-4f04-b376-0c1a621d48cc', '2026-06-01', 70),
  ('3578ff51-28af-4f04-b376-0c1a621d48cc', '2026-07-01', 75),
  ('3578ff51-28af-4f04-b376-0c1a621d48cc', '2026-08-01', 75),
  ('3578ff51-28af-4f04-b376-0c1a621d48cc', '2026-09-01', 75),
  ('3578ff51-28af-4f04-b376-0c1a621d48cc', '2026-10-01', 75),
  ('3578ff51-28af-4f04-b376-0c1a621d48cc', '2026-11-01', 70),
  ('3578ff51-28af-4f04-b376-0c1a621d48cc', '2026-12-01', 60)
ON CONFLICT (user_id, month) DO UPDATE SET available_days = EXCLUDED.available_days;

-- 3. Initiatives - Uplift is %, Priority Score uses effort factor
-- Formula: score = (uplift * confidence) * (1 / (1 + log(effort_estimate)))
INSERT INTO initiatives (user_id, name, value_lever, uplift, confidence, effort_estimate, is_mandatory, priority_score, start_month, end_month)
VALUES
  -- Mandatory
  ('3578ff51-28af-4f04-b376-0c1a621d48cc', 'Regulatory Compliance Update Q3', 'bau', 0, 100, 40, TRUE, 0, null, null),
  ('3578ff51-28af-4f04-b376-0c1a621d48cc', 'Security Patch Rollout', 'bau', 0, 100, 15, TRUE, 0, null, null),

  -- High Priority / High Impact (Uplift adjusted AGAIN)
  ('3578ff51-28af-4f04-b376-0c1a621d48cc', 'Streamlined Loan Application Flow', 'conversion', 1.5, 80, 70, FALSE, 7.62, null, '2025-08-01'), -- Adjusted Uplift from 3 to 1.5
  ('3578ff51-28af-4f04-b376-0c1a621d48cc', 'Improve ID Verification Speed', 'conversion', 1, 90, 30, FALSE, 6.13, null, null), -- Adjusted Uplift from 2 to 1

  -- Average Loan Size
  ('3578ff51-28af-4f04-b376-0c1a621d48cc', 'Promote Top-Up Loans Feature', 'average_loan_size', 5, 70, 50, FALSE, 71.28, null, null),
  ('3578ff51-28af-4f04-b376-0c1a621d48cc', 'Introduce Higher Loan Tiers', 'average_loan_size', 10, 50, 85, FALSE, 91.91, null, null),

  -- Interest Rate (Uplift adjusted)
  ('3578ff51-28af-4f04-b376-0c1a621d48cc', 'Risk-Based Pricing Adjustment', 'interest_rate', 5, 75, 60, FALSE, 220.04, null, null), -- Adjusted Uplift from 15 to 5

  -- Customer Acq/Retention
  ('3578ff51-28af-4f04-b376-0c1a621d48cc', 'Referral Program Launch', 'customer_acquisition', 10, 60, 45, FALSE, 124.83, '2025-11-01', null), -- Added start_month
  ('3578ff51-28af-4f04-b376-0c1a621d48cc', 'Implement Loyalty Rewards', 'customer_retention', 5, 50, 55, FALSE, 49.94, null, null),

  -- Lower Priority / Small Impact (Uplift adjusted AGAIN)
  ('3578ff51-28af-4f04-b376-0c1a621d48cc', 'Update FAQ Section', 'bau', 0, 100, 5, FALSE, 0, null, null),
  ('3578ff51-28af-4f04-b376-0c1a621d48cc', 'Minor UI Polish - Dashboard', 'conversion', 0.2, 95, 10, FALSE, 1.44, null, null), -- Adjusted Uplift from 0.5 to 0.2

  -- Multi-Month
  ('3578ff51-28af-4f04-b376-0c1a621d48cc', 'Core Platform Infrastructure Upgrade', 'bau', 0, 90, 150, FALSE, 0, null, null),

  -- Low Confidence / Potential Capacity Issue (Uplift adjusted AGAIN)
  ('3578ff51-28af-4f04-b376-0c1a621d48cc', 'Experimental Feature X (Low Conf)', 'conversion', 1, 20, 70, FALSE, 3.05, null, null), -- Adjusted Uplift from 2 to 1

  -- Added for testing date constraints
  ('3578ff51-28af-4f04-b376-0c1a621d48cc', 'Late Start, Low Prio', 'bau', 0, 100, 50, FALSE, 0, '2027-01-01', null), -- Start after capacity horizon
  ('3578ff51-28af-4f04-b376-0c1a621d48cc', 'Very High Effort, Low Prio', 'bau', 0, 100, 500, FALSE, 0, null, '2026-06-01') -- High effort, likely unscheduled, deadline miss

ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id,
  name = EXCLUDED.name,
  value_lever = EXCLUDED.value_lever,
  uplift = EXCLUDED.uplift,
  confidence = EXCLUDED.confidence,
  effort_estimate = EXCLUDED.effort_estimate,
  is_mandatory = EXCLUDED.is_mandatory,
  priority_score = EXCLUDED.priority_score,
  start_month = EXCLUDED.start_month,
  end_month = EXCLUDED.end_month,
  updated_at = now();
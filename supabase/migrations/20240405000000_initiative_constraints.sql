-- Create value_lever ENUM type
CREATE TYPE value_lever AS ENUM (
  'conversion',
  'average_loan_size',
  'interest_rate',
  'customer_acquisition',
  'customer_retention',
  'cost_reduction',
  'compliance_risk',
  'bau'
);

-- Update initiatives table
ALTER TABLE initiatives
  ALTER COLUMN value_lever TYPE value_lever USING value_lever::value_lever,
  ADD CONSTRAINT confidence_range CHECK (confidence >= 0 AND confidence <= 100),
  ADD CONSTRAINT effort_positive CHECK (effort_estimate > 0),
  ADD CONSTRAINT valid_dates CHECK (start_month <= COALESCE(end_month, start_month));

-- Add indexes
CREATE INDEX idx_initiatives_user_id ON initiatives(user_id);
CREATE INDEX idx_initiatives_start_month ON initiatives(start_month);

-- Add RLS policies if not already present
ALTER TABLE initiatives ENABLE ROW LEVEL SECURITY;

-- Only allow users to see their own initiatives
CREATE POLICY "Users can view own initiatives" ON initiatives
  FOR SELECT USING (auth.uid() = user_id);

-- Only allow users to modify their own initiatives
CREATE POLICY "Users can insert own initiatives" ON initiatives
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own initiatives" ON initiatives
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own initiatives" ON initiatives
  FOR DELETE USING (auth.uid() = user_id); 
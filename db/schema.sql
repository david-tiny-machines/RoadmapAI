-- Create ENUMs
CREATE TYPE metric_type AS ENUM ('conversion', 'loan_size', 'interest_rate');
CREATE TYPE user_role AS ENUM ('admin', 'user');
CREATE TYPE value_lever AS ENUM (
  'conversion',
  'average_loan_size',
  'interest_rate',
  'customer_acquisition',
  'customer_retention',
  'bau'
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create historical_metrics table
CREATE TABLE IF NOT EXISTS historical_metrics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type metric_type NOT NULL,
  value NUMERIC NOT NULL CHECK (value >= 0),
  month DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (type, month)
);

-- Create index for date range queries
CREATE INDEX historical_metrics_date_idx ON historical_metrics (month);

-- Create index for type and date queries
CREATE INDEX historical_metrics_type_date_idx ON historical_metrics (type, month);

-- Add RLS policies for historical_metrics
ALTER TABLE historical_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view historical metrics"
  ON historical_metrics
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can modify historical metrics"
  ON historical_metrics
  FOR ALL
  TO public
  USING (auth.uid() IS NOT NULL);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Add RLS policies for user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON user_profiles
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles
  FOR UPDATE
  TO public
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete their own profile"
  ON user_profiles
  FOR DELETE
  TO public
  USING (auth.uid() = id);

-- Create trigger for user_profiles updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create initiatives table
CREATE TABLE IF NOT EXISTS initiatives (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  value_lever value_lever NOT NULL,
  uplift NUMERIC NOT NULL,
  confidence INTEGER NOT NULL,
  effort_estimate INTEGER NOT NULL,
  start_month DATE,
  end_month DATE,
  is_mandatory BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  priority_score DOUBLE PRECISION NOT NULL
);

-- Add the corrected date range constraint
ALTER TABLE initiatives
ADD CONSTRAINT valid_date_range CHECK (start_month IS NULL OR end_month IS NULL OR end_month >= start_month);

-- Create index for initiatives
CREATE INDEX initiatives_user_id_idx ON initiatives (user_id);

-- Add RLS policies for initiatives
ALTER TABLE initiatives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all initiatives"
  ON initiatives
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can insert their own initiatives"
  ON initiatives
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own initiatives"
  ON initiatives
  FOR UPDATE
  TO public
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own initiatives"
  ON initiatives
  FOR DELETE
  TO public
  USING (auth.uid() = user_id);

-- Create trigger for initiatives updated_at
CREATE TRIGGER update_initiatives_updated_at
  BEFORE UPDATE ON initiatives
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create monthly_capacity table
CREATE TABLE public.monthly_capacity (
  id uuid NOT NULL default extensions.uuid_generate_v4(),
  user_id uuid NOT NULL,
  month date NOT NULL,
  available_days integer NOT NULL,
  created_at timestamp with time zone NOT NULL default now(),
  updated_at timestamp with time zone NOT NULL default now(),
  constraint monthly_capacity_pkey PRIMARY KEY (id),
  constraint unique_user_month_capacity unique (user_id, month),
  constraint monthly_capacity_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE,
  constraint positive_capacity check ((available_days >= 0))
) TABLESPACE pg_default;

-- Create index for monthly_capacity
CREATE INDEX IF NOT EXISTS idx_monthly_capacity_user_month ON public.monthly_capacity USING btree (user_id, month) TABLESPACE pg_default;

-- Add RLS policies for monthly_capacity
ALTER TABLE monthly_capacity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own capacity" ON monthly_capacity
  FOR SELECT
  TO public
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own capacity" ON monthly_capacity
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own capacity" ON monthly_capacity
  FOR UPDATE
  TO public
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own capacity" ON monthly_capacity
  FOR DELETE
  TO public
  USING (auth.uid() = user_id);

-- Create trigger for monthly_capacity updated_at
CREATE TRIGGER update_monthly_capacity_updated_at BEFORE UPDATE ON monthly_capacity FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Table to store overall scenario details
CREATE TABLE IF NOT EXISTS scenarios (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for user's scenarios
CREATE INDEX scenarios_user_id_idx ON scenarios (user_id);

-- Enable RLS for scenarios
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;

-- Policies for scenarios: Users manage their own
CREATE POLICY "Users can view their own scenarios" ON scenarios
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own scenarios" ON scenarios
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own scenarios" ON scenarios
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own scenarios" ON scenarios
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger for scenarios updated_at
CREATE TRIGGER update_scenarios_updated_at
  BEFORE UPDATE ON scenarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Junction table linking initiatives to scenarios
-- Stores which initiatives are included in a specific scenario
CREATE TABLE IF NOT EXISTS scenario_initiatives (
  scenario_id UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  initiative_id UUID NOT NULL REFERENCES initiatives(id) ON DELETE CASCADE,
  -- Add scenario-specific overrides here if needed in future (e.g., different start/end?)
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (scenario_id, initiative_id) -- Composite primary key
);

-- Index for faster lookups
CREATE INDEX scenario_initiatives_scenario_id_idx ON scenario_initiatives (scenario_id);
CREATE INDEX scenario_initiatives_initiative_id_idx ON scenario_initiatives (initiative_id);

-- Enable RLS for scenario_initiatives
ALTER TABLE scenario_initiatives ENABLE ROW LEVEL SECURITY;

-- Policies for scenario_initiatives: Users can manage links for their own scenarios
-- Assumes users implicitly own initiatives linked to their scenarios. Refine if initiative ownership differs.
CREATE POLICY "Users can view initiative links for their own scenarios" ON scenario_initiatives
  FOR SELECT USING (EXISTS (SELECT 1 FROM scenarios WHERE scenarios.id = scenario_id AND scenarios.user_id = auth.uid()));
CREATE POLICY "Users can insert initiative links for their own scenarios" ON scenario_initiatives
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM scenarios WHERE scenarios.id = scenario_id AND scenarios.user_id = auth.uid()));
CREATE POLICY "Users can delete initiative links for their own scenarios" ON scenario_initiatives
  FOR DELETE USING (EXISTS (SELECT 1 FROM scenarios WHERE scenarios.id = scenario_id AND scenarios.user_id = auth.uid()));





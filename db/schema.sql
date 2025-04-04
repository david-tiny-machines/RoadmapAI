-- Create enum for metric types
CREATE TYPE metric_type AS ENUM ('conversion', 'loan_size', 'interest_rate');

-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('admin', 'user');

-- Create users table (extends Supabase auth.users)
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create initiatives table
CREATE TABLE initiatives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  value_lever TEXT NOT NULL,
  uplift DECIMAL NOT NULL,
  confidence INTEGER NOT NULL CHECK (confidence BETWEEN 0 AND 100),
  effort_estimate INTEGER NOT NULL CHECK (effort_estimate > 0),
  start_month DATE,
  end_month DATE,
  is_mandatory BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_date_range CHECK (
    (start_month IS NULL AND end_month IS NULL) OR
    (start_month IS NOT NULL AND end_month IS NOT NULL AND start_month <= end_month)
  )
);

-- Create historical metrics table
CREATE TABLE historical_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_type metric_type NOT NULL,
  value DECIMAL NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(metric_type, date)
);

-- Enable Row Level Security
ALTER TABLE initiatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE historical_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view all initiatives"
  ON initiatives FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own initiatives"
  ON initiatives FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own initiatives"
  ON initiatives FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own initiatives"
  ON initiatives FOR DELETE
  USING (auth.uid() = user_id);

-- Historical metrics policies
CREATE POLICY "Everyone can view historical metrics"
  ON historical_metrics FOR SELECT
  USING (true);

CREATE POLICY "Only admins can modify historical metrics"
  ON historical_metrics FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- User profiles policies
CREATE POLICY "Users can view all profiles"
  ON user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create indexes for better performance
CREATE INDEX initiatives_user_id_idx ON initiatives(user_id);
CREATE INDEX historical_metrics_date_idx ON historical_metrics(date);
CREATE INDEX historical_metrics_type_date_idx ON historical_metrics(metric_type, date);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_initiatives_updated_at
    BEFORE UPDATE ON initiatives
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 
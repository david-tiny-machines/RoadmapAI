-- Create the initiatives table
CREATE TABLE IF NOT EXISTS initiatives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    uplift INTEGER NOT NULL,
    confidence INTEGER NOT NULL,
    effort_estimate INTEGER NOT NULL,
    is_mandatory BOOLEAN DEFAULT false,
    priority_score FLOAT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE initiatives ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own initiatives" ON initiatives
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own initiatives" ON initiatives
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own initiatives" ON initiatives
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own initiatives" ON initiatives
    FOR DELETE
    USING (auth.uid() = user_id); 
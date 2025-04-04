-- Add priority_score column to initiatives table
ALTER TABLE initiatives ADD COLUMN IF NOT EXISTS priority_score FLOAT;

-- Update existing rows to calculate priority_score
UPDATE initiatives 
SET priority_score = (uplift * confidence / effort_estimate)
WHERE priority_score IS NULL;

-- Make priority_score NOT NULL after updating existing rows
ALTER TABLE initiatives ALTER COLUMN priority_score SET NOT NULL; 
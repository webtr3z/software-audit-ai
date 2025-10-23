-- Create consolidated_reports table
CREATE TABLE IF NOT EXISTS consolidated_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  project_ids UUID[] NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add comment on table
COMMENT ON TABLE consolidated_reports IS 'Stores consolidated reports that combine multiple project analyses';

-- Enable RLS
ALTER TABLE consolidated_reports ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own reports" ON consolidated_reports;
DROP POLICY IF EXISTS "Public reports are viewable by anyone" ON consolidated_reports;
DROP POLICY IF EXISTS "Users can insert own reports" ON consolidated_reports;
DROP POLICY IF EXISTS "Users can update own reports" ON consolidated_reports;
DROP POLICY IF EXISTS "Users can delete own reports" ON consolidated_reports;

-- Create policies
CREATE POLICY "Users can view own reports"
  ON consolidated_reports
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Public reports are viewable by anyone"
  ON consolidated_reports
  FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can insert own reports"
  ON consolidated_reports
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reports"
  ON consolidated_reports
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reports"
  ON consolidated_reports
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_consolidated_reports_user_id 
  ON consolidated_reports(user_id);

CREATE INDEX IF NOT EXISTS idx_consolidated_reports_slug 
  ON consolidated_reports(slug);

CREATE INDEX IF NOT EXISTS idx_consolidated_reports_created_at 
  ON consolidated_reports(created_at DESC);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_consolidated_reports_updated_at ON consolidated_reports;

CREATE TRIGGER update_consolidated_reports_updated_at
  BEFORE UPDATE ON consolidated_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


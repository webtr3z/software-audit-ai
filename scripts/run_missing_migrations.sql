-- ==========================================
-- MIGRATION 1: Add Model Config to Projects
-- ==========================================

-- Add model configuration fields to projects table
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS ai_model VARCHAR(100) DEFAULT 'claude-sonnet-4-5-20250929',
ADD COLUMN IF NOT EXISTS max_tokens INTEGER DEFAULT 16384,
ADD COLUMN IF NOT EXISTS temperature DECIMAL(3,2) DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS analysis_config JSONB DEFAULT '{"retry_attempts": 2, "timeout_minutes": 10}'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN projects.ai_model IS 'AI model to use for analysis (e.g., claude-sonnet-4-5-20250929)';
COMMENT ON COLUMN projects.max_tokens IS 'Maximum tokens per API call during analysis';
COMMENT ON COLUMN projects.temperature IS 'Temperature setting for AI model (0.0 to 2.0)';
COMMENT ON COLUMN projects.analysis_config IS 'Additional analysis configuration as JSON';

-- ==========================================
-- MIGRATION 2: Create Prompt Templates Table
-- ==========================================

-- Create prompt_templates table
CREATE TABLE IF NOT EXISTS prompt_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_type TEXT NOT NULL, 
  prompt_content TEXT NOT NULL,
  is_custom BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(user_id, prompt_type)
);

-- Add comment on table
COMMENT ON TABLE prompt_templates IS 'Stores custom AI prompts for analysis. Types: security, code_quality, performance, bugs, maintainability, architecture, valuation';

-- Enable RLS
ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own prompts" ON prompt_templates;
DROP POLICY IF EXISTS "Users can insert own prompts" ON prompt_templates;
DROP POLICY IF EXISTS "Users can update own prompts" ON prompt_templates;
DROP POLICY IF EXISTS "Users can delete own prompts" ON prompt_templates;

-- Create policies
CREATE POLICY "Users can view own prompts"
  ON prompt_templates
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own prompts"
  ON prompt_templates
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prompts"
  ON prompt_templates
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own prompts"
  ON prompt_templates
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_prompt_templates_user_type 
  ON prompt_templates(user_id, prompt_type);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_prompt_templates_updated_at ON prompt_templates;

CREATE TRIGGER update_prompt_templates_updated_at
  BEFORE UPDATE ON prompt_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


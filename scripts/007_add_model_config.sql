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


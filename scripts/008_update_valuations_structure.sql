-- Update valuations table to support new comprehensive valuation structure
-- This migration adds new fields for the enhanced valuation methodology

-- Add new columns
ALTER TABLE public.valuations
ADD COLUMN IF NOT EXISTS is_asset_or_liability VARCHAR(20) CHECK (is_asset_or_liability IN ('asset', 'liability')),
ADD COLUMN IF NOT EXISTS cost_breakdown JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS depreciation_factors JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS value_increments JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS annual_costs JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS quality_metrics JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS risk_factors JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS assumptions JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS recommendations JSONB DEFAULT '[]'::jsonb;

-- Update existing columns comments for clarity
COMMENT ON COLUMN public.valuations.is_asset_or_liability IS 'Whether the software is an asset or liability based on its value';
COMMENT ON COLUMN public.valuations.cost_breakdown IS 'Detailed cost breakdown: {reconstructionCost, developmentHours, averageHourlyRate, region}';
COMMENT ON COLUMN public.valuations.depreciation_factors IS 'Factors reducing value: {ageDepreciation, technicalDebt, obsolescenceFactor, qualityMultiplier}';
COMMENT ON COLUMN public.valuations.value_increments IS 'Factors adding value: {testCoverage, documentation, security, activeUsers, revenue}';
COMMENT ON COLUMN public.valuations.annual_costs IS 'Annual operational costs: {maintenance, infrastructure, technicalDebtRemediation}';
COMMENT ON COLUMN public.valuations.quality_metrics IS 'Quality measurements: {codeQualityScore, testCoverage, securityScore, documentationScore, maintainabilityIndex}';
COMMENT ON COLUMN public.valuations.risk_factors IS 'Array of risk factors: [{factor, impact, description}]';
COMMENT ON COLUMN public.valuations.assumptions IS 'Array of assumptions made during valuation';
COMMENT ON COLUMN public.valuations.recommendations IS 'Array of recommendations for improving value';

-- The following columns are kept for backward compatibility but may be deprecated:
-- development_cost, maintenance_cost, infrastructure_cost (now in cost_breakdown and annual_costs)
-- complexity_factor, quality_factor, market_factor (now in depreciation_factors and value_increments)

-- Add indexes for JSON queries (optional, for performance)
CREATE INDEX IF NOT EXISTS valuations_is_asset_or_liability_idx ON public.valuations(is_asset_or_liability);
CREATE INDEX IF NOT EXISTS valuations_risk_factors_idx ON public.valuations USING GIN (risk_factors);

-- Update existing records to have default values for new fields
UPDATE public.valuations
SET 
  is_asset_or_liability = 'asset',
  cost_breakdown = jsonb_build_object(
    'reconstructionCost', COALESCE(development_cost, 0),
    'developmentHours', 0,
    'averageHourlyRate', 0,
    'region', 'Unknown'
  ),
  depreciation_factors = jsonb_build_object(
    'ageDepreciation', 0,
    'technicalDebt', 0,
    'obsolescenceFactor', 0,
    'qualityMultiplier', COALESCE(quality_factor, 1.0)
  ),
  value_increments = jsonb_build_object(
    'testCoverage', 0,
    'documentation', 0,
    'security', 0,
    'activeUsers', 0,
    'revenue', 0
  ),
  annual_costs = jsonb_build_object(
    'maintenance', COALESCE(maintenance_cost, 0),
    'infrastructure', COALESCE(infrastructure_cost, 0),
    'technicalDebtRemediation', 0
  ),
  quality_metrics = jsonb_build_object(
    'codeQualityScore', 0,
    'testCoverage', 0,
    'securityScore', 0,
    'documentationScore', 0,
    'maintainabilityIndex', 0
  ),
  risk_factors = '[]'::jsonb,
  assumptions = '["Migrated from old valuation structure"]'::jsonb,
  recommendations = '[]'::jsonb
WHERE is_asset_or_liability IS NULL;


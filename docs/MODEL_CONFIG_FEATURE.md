# Model Configuration Feature

## Overview

This feature allows users to configure AI model parameters for each project, including max tokens, model selection, temperature, and retry settings.

## Implementation

### 1. Database Schema (`scripts/007_add_model_config.sql`)

Added the following fields to the `projects` table:

- `ai_model` (VARCHAR): AI model to use (default: claude-sonnet-4-5-20250929)
- `max_tokens` (INTEGER): Maximum tokens per API call (default: 16384)
- `temperature` (DECIMAL): Temperature setting 0.0-2.0 (default: 1.0)
- `analysis_config` (JSONB): Additional configuration including retry_attempts and timeout_minutes

**To apply**: Run the SQL script against your Supabase database:

```sql
-- See scripts/007_add_model_config.sql
```

### 2. UI Component (`components/model-config-form.tsx`)

A comprehensive form component that allows users to configure:

- **AI Model Selection**: Choose between Claude Sonnet 4.5, Opus 4, and 3.5 Sonnet
- **Max Tokens**: 4,096 to 200,000 (default: 16,384)
- **Temperature**: 0.0 to 2.0 (default: 1.0)
- **Retry Attempts**: 0 to 5 (default: 2)
- **Timeout**: 5 to 60 minutes (default: 10)

Features:

- Real-time validation
- Helpful tooltips and descriptions
- Toast notifications for save success/failure
- Spanish UI text (per project requirements)

### 3. Server Action (`lib/actions/projects.ts`)

New `updateProjectConfig` function:

- Validates input parameters
- Ensures user authentication
- Updates project configuration in database
- Revalidates the project page

### 4. Project Page with Tabs (`app/dashboard/projects/[id]/page.tsx`)

Updated to use tabs:

- **Vista General**: Original project overview and analysis results
- **Configuración**: New model configuration tab

The configuration is now easily accessible without cluttering the main view.

### 5. Analyzer Integration (`lib/ai/analyzer.ts`)

Updated functions to accept and use configuration:

- `AnalysisConfig` interface for type safety
- `analyzeCodeCategory`: Uses configured max_tokens, temperature, and retry_attempts
- `analyzeCodeComplete`: Passes configuration to all category analyses
- Dynamic token limits: Base tokens on first attempt, double on retry (up to 200K max)

### 6. Analysis Action (`lib/actions/analyze.tsx`)

Updated `startAnalysis` to:

- Fetch project configuration from database
- Extract and apply model settings
- Pass configuration to analyzer
- Log configuration for debugging

## Default Values

The system uses generous defaults to ensure comprehensive analysis:

| Parameter      | Default           | Range           | Description                     |
| -------------- | ----------------- | --------------- | ------------------------------- |
| AI Model       | claude-sonnet-4.5 | -               | Balanced speed and quality      |
| Max Tokens     | 16,384            | 4,096 - 200,000 | Generous for detailed responses |
| Temperature    | 1.0               | 0.0 - 2.0       | Balanced creativity             |
| Retry Attempts | 2                 | 0 - 5           | Resilient to transient errors   |
| Timeout        | 10 min            | 5 - 60          | Enough for large projects       |

## User Workflow

1. **Create or select a project**
2. **Go to the Configuración tab**
3. **Adjust settings** as needed for the project
4. **Save configuration** - settings are stored in database
5. **Start analysis** - uses the saved configuration automatically

## Benefits

✅ **Flexible**: Configure per-project settings for different analysis needs
✅ **User-Friendly**: Clear UI with helpful descriptions
✅ **Robust**: Validation and error handling
✅ **Performance**: Users can increase tokens for complex projects
✅ **Cost-Effective**: Users can reduce tokens for simple projects
✅ **Persistent**: Configuration saved in database

## Example Use Cases

### Large Complex Project

```
Max Tokens: 32,768 or higher
Model: Claude Opus 4
Temperature: 1.0
Retry: 3
```

### Quick Simple Analysis

```
Max Tokens: 8,192
Model: Claude 3.5 Sonnet
Temperature: 0.7
Retry: 1
```

### High-Precision Security Audit

```
Max Tokens: 16,384
Model: Claude Opus 4
Temperature: 0.5 (more deterministic)
Retry: 2
```

## Testing

Before running analysis:

1. Apply the database migration
2. Create or open a project
3. Navigate to Configuración tab
4. Set desired max tokens (recommend 16,384+)
5. Save configuration
6. Run analysis from Vista General tab
7. Check console logs to verify config is being used

## Notes

- Configuration is per-project, allowing different settings for different codebases
- The system automatically falls back to defaults if configuration is missing
- Higher max_tokens = more detailed analysis but higher API costs
- Temperature affects consistency: lower = more deterministic, higher = more creative
- All UI text is in Spanish as per project requirements

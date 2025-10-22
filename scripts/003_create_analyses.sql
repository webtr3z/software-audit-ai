-- Create analyses table to store AI analysis results
create table if not exists public.analyses (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  
  -- Overall scores (1-10 scale)
  overall_score numeric(3,1) not null check (overall_score >= 1 and overall_score <= 10),
  security_score numeric(3,1) not null check (security_score >= 1 and security_score <= 10),
  code_quality_score numeric(3,1) not null check (code_quality_score >= 1 and code_quality_score <= 10),
  performance_score numeric(3,1) not null check (performance_score >= 1 and performance_score <= 10),
  bugs_score numeric(3,1) not null check (bugs_score >= 1 and bugs_score <= 10),
  maintainability_score numeric(3,1) not null check (maintainability_score >= 1 and maintainability_score <= 10),
  architecture_score numeric(3,1) not null check (architecture_score >= 1 and architecture_score <= 10),
  
  -- Analysis metadata
  analysis_duration_seconds integer,
  ai_model text not null,
  confidence_level numeric(3,2) check (confidence_level >= 0 and confidence_level <= 1),
  
  -- Summary and recommendations
  summary text,
  recommendations jsonb default '[]'::jsonb,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.analyses enable row level security;

-- RLS Policies for analyses
create policy "Users can view their own analyses"
  on public.analyses for select
  using (auth.uid() = user_id);

create policy "Users can insert their own analyses"
  on public.analyses for insert
  with check (auth.uid() = user_id);

-- Create indexes
create index if not exists analyses_project_id_idx on public.analyses(project_id);
create index if not exists analyses_user_id_idx on public.analyses(user_id);

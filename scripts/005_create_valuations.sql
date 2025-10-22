-- Create valuations table to store monetary appraisals
create table if not exists public.valuations (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.analyses(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  
  -- Valuation amounts (in USD)
  estimated_value numeric(12,2) not null,
  min_value numeric(12,2) not null,
  max_value numeric(12,2) not null,
  
  -- Cost breakdown
  development_cost numeric(12,2),
  maintenance_cost numeric(12,2),
  infrastructure_cost numeric(12,2),
  
  -- Valuation factors
  complexity_factor numeric(3,2),
  quality_factor numeric(3,2),
  market_factor numeric(3,2),
  
  -- Metadata
  confidence_level numeric(3,2) check (confidence_level >= 0 and confidence_level <= 1),
  methodology text,
  comparable_projects jsonb default '[]'::jsonb,
  notes text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.valuations enable row level security;

-- RLS Policies for valuations
create policy "Users can view their own valuations"
  on public.valuations for select
  using (auth.uid() = user_id);

create policy "Users can insert their own valuations"
  on public.valuations for insert
  with check (auth.uid() = user_id);

-- Create indexes
create index if not exists valuations_analysis_id_idx on public.valuations(analysis_id);
create index if not exists valuations_project_id_idx on public.valuations(project_id);
create index if not exists valuations_user_id_idx on public.valuations(user_id);

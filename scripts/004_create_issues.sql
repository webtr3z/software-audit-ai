-- Create issues table to store detected problems
create table if not exists public.issues (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.analyses(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  
  -- Issue details
  category text not null check (category in ('security', 'code_quality', 'performance', 'bug', 'maintainability', 'architecture')),
  severity text not null check (severity in ('critical', 'high', 'medium', 'low', 'info')),
  title text not null,
  description text not null,
  
  -- Location
  file_path text,
  line_number integer,
  code_snippet text,
  
  -- Fix suggestion
  suggested_fix text,
  auto_fixable boolean default false,
  
  -- Status
  status text not null default 'open' check (status in ('open', 'fixed', 'ignored', 'false_positive')),
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.issues enable row level security;

-- RLS Policies for issues
create policy "Users can view their own issues"
  on public.issues for select
  using (auth.uid() = user_id);

create policy "Users can insert their own issues"
  on public.issues for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own issues"
  on public.issues for update
  using (auth.uid() = user_id);

create policy "Users can delete their own issues"
  on public.issues for delete
  using (auth.uid() = user_id);

-- Create indexes
create index if not exists issues_analysis_id_idx on public.issues(analysis_id);
create index if not exists issues_project_id_idx on public.issues(project_id);
create index if not exists issues_user_id_idx on public.issues(user_id);
create index if not exists issues_category_idx on public.issues(category);
create index if not exists issues_severity_idx on public.issues(severity);
create index if not exists issues_status_idx on public.issues(status);

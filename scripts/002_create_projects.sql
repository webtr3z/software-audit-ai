-- Create projects table to store uploaded code projects
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  source_type text not null check (source_type in ('upload', 'github')),
  github_url text,
  file_count integer default 0,
  total_lines integer default 0,
  languages jsonb default '[]'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'analyzing', 'completed', 'failed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.projects enable row level security;

-- RLS Policies for projects
create policy "Users can view their own projects"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "Users can insert their own projects"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own projects"
  on public.projects for update
  using (auth.uid() = user_id);

create policy "Users can delete their own projects"
  on public.projects for delete
  using (auth.uid() = user_id);

-- Create index for faster queries
create index if not exists projects_user_id_idx on public.projects(user_id);
create index if not exists projects_status_idx on public.projects(status);

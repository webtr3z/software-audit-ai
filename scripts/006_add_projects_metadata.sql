-- Add metadata column to projects table for storing additional data like GitHub tokens
alter table public.projects add column if not exists metadata jsonb default '{}'::jsonb;

-- Create index for metadata queries
create index if not exists projects_metadata_idx on public.projects using gin (metadata);

-- Add comment
comment on column public.projects.metadata is 'Stores additional metadata such as GitHub tokens for private repositories';


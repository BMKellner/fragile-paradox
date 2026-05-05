-- Fully Customizable Templates
-- Adds reusable user template documents with version history and portfolio linkage.

create extension if not exists pgcrypto;

-- Keep timestamp trigger helper available in fresh environments.
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table if not exists public.user_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  portfolio_id uuid references public.portfolios(id) on delete set null,
  name text not null default 'Untitled template',
  template_id text not null,
  schema_version integer not null default 1 check (schema_version > 0),
  version integer not null default 1 check (version > 0),
  document jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_template_versions (
  id uuid primary key default gen_random_uuid(),
  user_template_id uuid not null references public.user_templates(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  version integer not null check (version > 0),
  schema_version integer not null default 1 check (schema_version > 0),
  document jsonb not null,
  change_summary text,
  created_at timestamptz not null default now(),
  unique (user_template_id, version)
);

alter table public.portfolios
  add column if not exists user_template_id uuid;

alter table public.portfolios
  drop constraint if exists portfolios_user_template_id_fkey;

alter table public.portfolios
  add constraint portfolios_user_template_id_fkey
  foreign key (user_template_id)
  references public.user_templates(id)
  on delete set null;

create index if not exists idx_user_templates_user_id on public.user_templates(user_id);
create index if not exists idx_user_templates_portfolio_id on public.user_templates(portfolio_id);
create index if not exists idx_user_templates_template_id on public.user_templates(template_id);
create index if not exists idx_user_template_versions_template on public.user_template_versions(user_template_id, version desc);

alter table public.user_templates enable row level security;
alter table public.user_template_versions enable row level security;

drop policy if exists "Users can view their own user templates" on public.user_templates;
create policy "Users can view their own user templates"
  on public.user_templates
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own user templates" on public.user_templates;
create policy "Users can insert their own user templates"
  on public.user_templates
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own user templates" on public.user_templates;
create policy "Users can update their own user templates"
  on public.user_templates
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own user templates" on public.user_templates;
create policy "Users can delete their own user templates"
  on public.user_templates
  for delete
  using (auth.uid() = user_id);

drop policy if exists "Users can view their own template versions" on public.user_template_versions;
create policy "Users can view their own template versions"
  on public.user_template_versions
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own template versions" on public.user_template_versions;
create policy "Users can insert their own template versions"
  on public.user_template_versions
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own template versions" on public.user_template_versions;
create policy "Users can update their own template versions"
  on public.user_template_versions
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own template versions" on public.user_template_versions;
create policy "Users can delete their own template versions"
  on public.user_template_versions
  for delete
  using (auth.uid() = user_id);

drop trigger if exists update_user_templates_updated_at on public.user_templates;
create trigger update_user_templates_updated_at
before update on public.user_templates
for each row
execute function public.update_updated_at_column();

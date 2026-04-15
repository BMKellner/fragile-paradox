create table if not exists public.friend_requests (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'cancelled')),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  responded_at timestamp with time zone,
  check (sender_id <> recipient_id)
);

create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  friend_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamp with time zone not null default now(),
  check (user_id <> friend_id),
  check (user_id < friend_id)
);

create index if not exists idx_friend_requests_sender on public.friend_requests(sender_id);
create index if not exists idx_friend_requests_recipient on public.friend_requests(recipient_id);
create index if not exists idx_friend_requests_status on public.friend_requests(status);

create index if not exists idx_friendships_user on public.friendships(user_id);
create index if not exists idx_friendships_friend on public.friendships(friend_id);

create unique index if not exists friendships_user_friend_unique
  on public.friendships(user_id, friend_id);

create unique index if not exists friend_requests_unique_pending_pair
  on public.friend_requests (
    least(sender_id, recipient_id),
    greatest(sender_id, recipient_id)
  )
  where status = 'pending';

alter table public.friend_requests enable row level security;
alter table public.friendships enable row level security;

drop policy if exists "Users can view own friend requests" on public.friend_requests;
create policy "Users can view own friend requests"
  on public.friend_requests
  for select
  to authenticated
  using (auth.uid() = sender_id or auth.uid() = recipient_id);

drop policy if exists "Users can create own sent friend requests" on public.friend_requests;
create policy "Users can create own sent friend requests"
  on public.friend_requests
  for insert
  to authenticated
  with check (auth.uid() = sender_id);

drop policy if exists "Users can update own friend requests" on public.friend_requests;
create policy "Users can update own friend requests"
  on public.friend_requests
  for update
  to authenticated
  using (auth.uid() = sender_id or auth.uid() = recipient_id)
  with check (auth.uid() = sender_id or auth.uid() = recipient_id);

drop policy if exists "Users can delete own friend requests" on public.friend_requests;
create policy "Users can delete own friend requests"
  on public.friend_requests
  for delete
  to authenticated
  using (auth.uid() = sender_id or auth.uid() = recipient_id);

drop policy if exists "Users can view own friendships" on public.friendships;
create policy "Users can view own friendships"
  on public.friendships
  for select
  to authenticated
  using (auth.uid() = user_id or auth.uid() = friend_id);

drop policy if exists "Users can insert own friendships" on public.friendships;
create policy "Users can insert own friendships"
  on public.friendships
  for insert
  to authenticated
  with check (auth.uid() = user_id or auth.uid() = friend_id);

drop policy if exists "Users can delete own friendships" on public.friendships;
create policy "Users can delete own friendships"
  on public.friendships
  for delete
  to authenticated
  using (auth.uid() = user_id or auth.uid() = friend_id);

drop trigger if exists update_friend_requests_updated_at on public.friend_requests;
create trigger update_friend_requests_updated_at
before update on public.friend_requests
for each row execute function public.update_updated_at_column();

grant select, insert, update, delete on public.friend_requests to authenticated;
grant select, insert, delete on public.friendships to authenticated;

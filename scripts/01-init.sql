-- Create a table for public profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  full_name text,
  email text unique,
  avatar_url text,
  role text default 'user',
  -- For operators
  status text, -- e.g., 'pending', 'approved', 'rejected'
  specialty text,
  bio text,
  price_per_minute numeric,
  -- For users
  credits numeric default 0.0,
  free_minutes integer default 0,
  free_minutes_used boolean default false,

  constraint role_check check (role in ('user', 'operator', 'admin'))
);

-- Set up Row Level Security (RLS)
-- See https://supabase.com/docs/guides/auth/row-level-security for more details.
alter table profiles
  enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- This trigger automatically creates a profile for new users.
-- See https://supabase.com/docs/guides/auth/managing-user-data#using-triggers for more details.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role, free_minutes, free_minutes_used, status)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    new.raw_user_meta_data->>'user_type',
    case when new.raw_user_meta_data->>'user_type' = 'user' then 3 else 0 end,
    false,
    case when new.raw_user_meta_data->>'user_type' = 'operator' then 'pending' else 'active' end
  );
  return new;
end;
$$;

-- trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

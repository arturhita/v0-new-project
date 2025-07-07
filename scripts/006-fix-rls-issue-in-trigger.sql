-- This function is triggered when a new user signs up.
-- It creates a corresponding row in the public.profiles table.
-- The "set local role postgres" is a critical addition. It temporarily elevates
-- the function's privileges to that of a superuser for the duration of the transaction.
-- This is necessary to bypass the Row Level Security (RLS) policy on the profiles table,
-- which would otherwise prevent the trigger from inserting a new profile.
-- The RLS policy correctly states that a user can only insert their own profile,
-- but at the moment the trigger runs, the "user" is the system, not the new user,
-- causing a permission conflict that this change resolves.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- Elevate privilege to bypass RLS for this specific insert
  set local role postgres;

  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'name',
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'client')
  );

  -- Revert role elevation
  reset role;

  return new;
end;
$$;

-- Re-apply the trigger to ensure it uses the updated function.
-- This is good practice but might not be strictly necessary.
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

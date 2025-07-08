-- Funzione per creare un profilo per un nuovo utente
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    'client' -- Il ruolo di default è 'client'
  );
  return new;
end;
$$;

-- Trigger per eseguire la funzione dopo la creazione di un nuovo utente
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

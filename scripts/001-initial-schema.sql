-- Creazione della tabella per i profili utente
create table public.profiles (
  id uuid references auth.users not null primary key,
  name text,
  role text check (role in ('client', 'operator', 'admin')),
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Abilita la Row Level Security (RLS) per la tabella dei profili
-- Per impostazione predefinita, nessuno può accedere a questa tabella.
-- Le policy di accesso verranno definite in seguito.
alter table public.profiles enable row level security;

-- Funzione per aggiornare il timestamp 'updated_at'
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql security definer;

-- Trigger che chiama la funzione handle_updated_at() prima di ogni aggiornamento
create trigger on_profile_update
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- Funzione per creare un profilo utente automaticamente dopo la registrazione
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, role, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'role',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger che chiama la funzione handle_new_user() dopo ogni nuova registrazione in auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Policy di accesso: Gli utenti possono vedere tutti i profili (per ora)
-- In un'applicazione reale, potresti voler restringere questa policy
create policy "Public profiles are viewable by everyone."
  on profiles for select using (true);

-- Policy di accesso: Gli utenti possono inserire il proprio profilo
-- La funzione `auth.uid()` restituisce l'ID dell'utente autenticato
create policy "Users can insert their own profile."
  on profiles for insert with check (auth.uid() = id);

-- Policy di accesso: Gli utenti possono aggiornare il proprio profilo
create policy "Users can update their own profile."
  on profiles for update using (auth.uid() = id);

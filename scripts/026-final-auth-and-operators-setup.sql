-- Usa un DO block per creare in modo sicuro i tipi enum se non esistono.
-- Questo previene errori se lo script viene eseguito più volte.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('client', 'operator', 'admin');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'operator_status') THEN
        CREATE TYPE operator_status AS ENUM ('online', 'offline', 'busy');
    END IF;
END$$;

-- Assicura che la tabella profiles esista con le colonne necessarie
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username text UNIQUE,
    full_name text,
    avatar_url text,
    website text,
    role user_role NOT NULL DEFAULT 'client'::user_role,
    updated_at timestamp with time zone,
    CONSTRAINT username_length CHECK ((char_length(username) >= 3))
);

-- Funzione per creare un profilo pubblico per i nuovi utenti
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role, username)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    'client',
    new.raw_user_meta_data->>'username'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger per eseguire la funzione dopo la creazione di un nuovo utente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Assicura che la tabella operators esista e sia collegata a profiles
CREATE TABLE IF NOT EXISTS public.operators (
    id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    bio text,
    specializations text[],
    cost_per_minute numeric(10, 2),
    availability_status operator_status DEFAULT 'offline'::operator_status,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Vista per ottenere dettagli completi degli operatori
CREATE OR REPLACE VIEW public.detailed_operators AS
SELECT
    p.id,
    p.full_name,
    p.username,
    u.email,
    o.bio,
    o.specializations,
    o.cost_per_minute,
    o.availability_status
FROM
    public.profiles p
JOIN
    auth.users u ON p.id = u.id
JOIN
    public.operators o ON p.id = o.id
WHERE
    p.role = 'operator';

-- Istruzioni per l'utente per creare un admin:
-- 1. Crea un utente normale tramite la tua applicazione o la dashboard di Supabase.
-- 2. Vai alla tabella 'profiles' in Supabase.
-- 3. Trova la riga corrispondente al tuo utente admin.
-- 4. Cambia il valore nella colonna 'role' da 'client' a 'admin'.

-- SCRIPT 027: RESET COMPLETO DI PROFILI E OPERATORI
-- Questo script è distruttivo e resetta le tabelle correlate a profili e operatori.
-- Eseguire con cautela.

-- 1. Rimuove gli oggetti dipendenti in ordine inverso per evitare errori.
DROP VIEW IF EXISTS public.detailed_operators;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.operators;
DROP TABLE IF EXISTS public.profiles;
DROP TYPE IF EXISTS public.operator_status;
DROP TYPE IF EXISTS public.user_role;

-- 2. Crea i tipi ENUM necessari.
-- Questo è il primo passo per assicurare che i tipi esistano prima di essere usati.
CREATE TYPE public.user_role AS ENUM ('client', 'operator', 'admin');
CREATE TYPE public.operator_status AS ENUM ('online', 'offline', 'busy');

-- 3. Crea la tabella dei profili, collegata a auth.users
CREATE TABLE public.profiles (
    id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username text UNIQUE,
    full_name text,
    avatar_url text,
    role public.user_role NOT NULL DEFAULT 'client',
    updated_at timestamp with time zone,
    CONSTRAINT username_length CHECK ((char_length(username) >= 3))
);
COMMENT ON TABLE public.profiles IS 'Contiene i dati pubblici del profilo per ogni utente.';

-- 4. Crea la tabella degli operatori, collegata a profiles
-- Ora il tipo 'operator_status' esiste e può essere usato come default.
CREATE TABLE public.operators (
    id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    bio text,
    specializations text[],
    cost_per_minute numeric(10, 2),
    availability_status public.operator_status DEFAULT 'offline',
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
COMMENT ON TABLE public.operators IS 'Contiene i dati specifici per gli utenti che sono operatori.';

-- 5. Crea la funzione per popolare automaticamente i profili
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, username, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'username',
    'client'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
COMMENT ON FUNCTION public.handle_new_user IS 'Crea un record in public.profiles quando un nuovo utente si registra in auth.users.';

-- 6. Crea il trigger per eseguire la funzione
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Crea una vista per semplificare le query sugli operatori
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
COMMENT ON VIEW public.detailed_operators IS 'Vista che unisce profili, utenti e dati operatore per un accesso semplificato.';

-- Istruzioni per l'utente per creare un admin:
-- 1. Crea un utente normale tramite la tua applicazione o la dashboard di Supabase.
-- 2. Vai alla tabella 'profiles' in Supabase.
-- 3. Trova la riga corrispondente al tuo utente admin.
-- 4. Cambia il valore nella colonna 'role' da 'client' a 'admin'.

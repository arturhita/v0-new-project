-- Questo script esegue una demolizione e ricostruzione completa della funzionalità
-- dei profili utente per risolvere definitivamente l'errore "Database error saving new user".
-- Corregge un errore di sintassi nello schema originale e ricostruisce tutti gli
-- oggetti correlati (trigger, funzioni, policy di sicurezza) da zero.

-- STEP 1: Rimuove gli oggetti dipendenti nell'ordine corretto per evitare errori.
-- Prima il trigger, che dipende dalla funzione.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Poi la funzione.
DROP FUNCTION IF EXISTS public.handle_new_user();

-- STEP 2: Rimuove la tabella e il tipo di dato personalizzato su cui si basa.
-- Questo elimina completamente la tabella potenzialmente corrotta.
DROP TABLE IF EXISTS public.profiles;
DROP TYPE IF EXISTS public.user_role;

-- STEP 3: Ricrea il tipo di dato personalizzato per i ruoli utente.
CREATE TYPE public.user_role AS ENUM ('client', 'operator', 'admin');

-- STEP 4: Ricrea la tabella 'profiles' con lo schema CORRETTO.
-- La correzione chiave è "NOT NULL" invece dell'errato "NOT-NULL".
CREATE TABLE public.profiles (
    id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    updated_at timestamp with time zone,
    name character varying,
    email character varying UNIQUE,
    role user_role NOT NULL DEFAULT 'client'::user_role, -- SINTASSI CORRETTA
    avatar_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
-- Aggiunge commenti per chiarezza.
COMMENT ON TABLE public.profiles IS 'Dati del profilo per ogni utente.';
COMMENT ON COLUMN public.profiles.id IS 'Riferimento a auth.users.id';

-- STEP 5: Ricrea la funzione del trigger in modo robusto e sicuro.
-- SECURITY DEFINER le permette di bypassare le regole di sicurezza (RLS) in modo sicuro.
-- Gestisce sia la registrazione dal sito (con metadati) sia la creazione manuale (senza).
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_name text;
  user_role_text text;
BEGIN
  -- Estrae in modo sicuro i metadati, usando NULL se non esistono.
  user_name := new.raw_user_meta_data->>'name';
  user_role_text := new.raw_user_meta_data->>'role';

  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    new.id,
    new.email,
    user_name,
    -- Usa il ruolo fornito, altrimenti imposta 'client' come default.
    COALESCE(user_role_text, 'client')::user_role
  );
  RETURN new;
END;
$$;

-- STEP 6: Ricrea il trigger per eseguire la funzione dopo la registrazione di un utente.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- STEP 7: Ricrea le policy di Row Level Security (RLS) da zero.
-- Abilita la RLS sulla tabella.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Permette a chiunque di vedere tutti i profili.
CREATE POLICY "Profiles are viewable by everyone." ON public.profiles
  FOR SELECT USING (true);

-- Permette a un utente di aggiornare SOLO il proprio profilo.
CREATE POLICY "Users can update their own profile." ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Permette a un utente di cancellare SOLO il proprio profilo.
CREATE POLICY "Users can delete their own profile." ON public.profiles
  FOR DELETE USING (auth.uid() = id);

-- NOTA: Non viene creata una policy di INSERIMENTO per gli utenti.
-- L'inserimento è gestito esclusivamente dal trigger sicuro, risolvendo il conflitto.

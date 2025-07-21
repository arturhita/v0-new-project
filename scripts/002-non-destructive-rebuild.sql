-- Questo script crea una base pulita per i profili utente.
-- È sicuro da eseguire anche più volte.

-- Prima, rimuoviamo la vecchia funzione e il trigger se esistono, per evitare conflitti.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Rimuoviamo la tabella dei profili se esiste, per garantire una ripartenza pulita.
DROP TABLE IF EXISTS public.profiles;

-- Creiamo la tabella `profiles` che conterrà i dati pubblici degli utenti.
-- È collegata direttamente alla tabella `auth.users` di Supabase.
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT UNIQUE,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'operator', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.profiles IS 'Contiene i dati del profilo per tutti gli utenti.';

-- Abilitiamo la Row Level Security (RLS) per proteggere i dati.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy di accesso: Chiunque può vedere i profili (utile per le liste di operatori).
CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT USING (true);

-- Policy diaccesso: Un utente può aggiornare SOLO il proprio profilo.
CREATE POLICY "Users can update their own profile."
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Questa funzione viene eseguita automaticamente ogni volta che un nuovo utente si registra.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Inserisce una nuova riga nella tabella `profiles` con i dati del nuovo utente.
  -- Prende il nome e il ruolo dai "metadata" forniti durante la registrazione.
  -- Prende l'email direttamente dalla tabella `auth.users`.
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'name',
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')::text
  );
  RETURN NEW;
END;
$$;

-- Questo "trigger" collega la funzione `handle_new_user` all'evento di creazione di un nuovo utente.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Rimuoviamo prima il trigger dalla tabella auth.users per evitare errori di dipendenza.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Rimuoviamo la funzione problematica.
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Rimuoviamo la tabella dei profili per ripartire da zero.
DROP TABLE IF EXISTS public.profiles;

-- Creiamo di nuovo la tabella 'profiles' con la struttura corretta e completa.
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('client', 'operator', 'admin')) DEFAULT 'client',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Commenti sulla tabella per chiarezza
COMMENT ON TABLE public.profiles IS 'Contiene i profili pubblici degli utenti, estendendo auth.users.';

-- Creiamo una funzione per aggiornare il timestamp 'updated_at'
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  new.updated_at = timezone('utc'::text, now());
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Applichiamo il trigger per l'aggiornamento del timestamp
CREATE TRIGGER on_profile_update
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Creiamo la NUOVA funzione per creare un profilo utente, robusta e sicura.
-- Questa funzione gestisce correttamente sia la registrazione dal sito che la creazione manuale.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, avatar_url)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'role',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Applichiamo il NUOVO trigger alla tabella auth.users
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Abilitiamo la Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Rimuoviamo tutte le vecchie policy per sicurezza
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile." ON public.profiles;

-- Creiamo le NUOVE policy di sicurezza, corrette e non conflittuali
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile." ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- NOTA: La policy di INSERT non è più necessaria per gli utenti,
-- perché la creazione è gestita in modo sicuro dalla funzione SECURITY DEFINER.

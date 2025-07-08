-- Step 1: Rimuoviamo in sicurezza il vecchio trigger e la vecchia funzione nell'ordine corretto per evitare errori di dipendenza.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 2: Rimuoviamo le vecchie e conflittuali policy di sicurezza dalla tabella 'profiles'.
-- La tabella e i suoi dati rimangono intatti.
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile." ON public.profiles;

-- Step 3: Creiamo la NUOVA funzione per creare un profilo utente.
-- Questa versione è robusta: controlla se i metadati esistono prima di usarli,
-- altrimenti inserisce valori di default, evitando errori.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, avatar_url)
  VALUES (
    new.id,
    new.email,
    -- Controlla se 'name' esiste nei metadati, altrimenti usa l'email come fallback
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    -- Controlla se 'role' esiste, altrimenti imposta 'client' di default
    COALESCE(new.raw_user_meta_data->>'role', 'client'),
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Applichiamo il NUOVO trigger alla tabella auth.users, che chiamerà la nostra nuova funzione sicura.
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Step 5: Creiamo le NUOVE policy di sicurezza, corrette e non conflittuali.
-- Permette a chiunque di vedere i profili (necessario per la piattaforma).
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles
  FOR SELECT USING (true);

-- Permette a ogni utente di modificare SOLO il proprio profilo.
CREATE POLICY "Users can update their own profile." ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- NOTA: Non serve una policy di INSERT per gli utenti, perché la creazione
-- è gestita in modo sicuro e centralizzato dalla nostra funzione (trigger).

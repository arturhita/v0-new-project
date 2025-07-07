-- STEP 1: RISOLUZIONE DELLA DIPENDENZA (CAUSA DELL'ULTIMO ERRORE)
-- Prima eliminiamo il trigger che dipende dalla funzione. Questo è il passaggio chiave che mancava.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- STEP 2: RIMOZIONE DELLA VECCHIA FUNZIONE
-- Ora che il trigger è stato rimosso, possiamo eliminare la funzione senza errori.
DROP FUNCTION IF EXISTS public.handle_new_user();

-- STEP 3: RIMOZIONE DELLE VECCHIE REGOLE DI SICUREZZA
-- Facciamo pulizia completa di tutte le vecchie policy sulla tabella dei profili.
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;

-- STEP 4: CREAZIONE DELLA NUOVA FUNZIONE TRIGGER (SEMPLICE E CORRETTA)
-- Questa è la versione corretta che non dovrebbe causare conflitti.
-- "SECURITY DEFINER" è la chiave: esegue la funzione con i massimi permessi.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    -- Se il ruolo non è fornito, imposta 'client' come default per evitare errori.
    COALESCE((new.raw_user_meta_data->>'role')::public.user_role, 'client')
  );
  RETURN new;
END;
$$;

-- STEP 5: RICREAZIONE DEL TRIGGER
-- Ricolleghiamo la nuova funzione all'evento di creazione di un utente.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- STEP 6: RICREAZIONE DELLE REGOLE DI SICUREZZA (RLS) - CORRETTE E SICURE
-- Questo è il set di regole definitivo.

-- Abilitiamo la Row Level Security sulla tabella.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Regola 1: Chiunque può vedere i profili.
CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING ( true );

-- Regola 2: Un utente può modificare SOLO il proprio profilo.
CREATE POLICY "Users can update own profile."
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = id );

-- NOTA: Non c'è una regola di INSERT per gli utenti. La creazione è gestita dal trigger.

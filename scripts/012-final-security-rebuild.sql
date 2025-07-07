-- STEP 1: RIMOZIONE COMPLETA DELLE VECCHIE CONFIGURAZIONI ERRATE
-- Eliminiamo ogni vecchia policy sulla tabella dei profili per fare pulizia.
-- "IF EXISTS" previene errori se una policy non esiste.
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;

-- Eliminiamo la vecchia funzione del trigger.
DROP FUNCTION IF EXISTS public.handle_new_user();


-- STEP 2: CREAZIONE DELLA NUOVA FUNZIONE TRIGGER (SEMPLICE E CORRETTA)
-- Questa funzione si attiva dopo la registrazione di un nuovo utente.
-- Inserisce il nuovo utente nella tabella 'profiles'.
-- "SECURITY DEFINER" è la chiave: esegue la funzione con i massimi permessi,
-- bypassando in modo sicuro le regole di sicurezza solo per questa operazione.
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
    (new.raw_user_meta_data->>'role')::public.user_role -- Legge il ruolo dai metadati
  );
  RETURN new;
END;
$$;


-- STEP 3: CREAZIONE DEL NUOVO TRIGGER
-- Colleghiamo la nuova funzione all'evento di creazione di un utente nel sistema di autenticazione.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- STEP 4: CREAZIONE DELLE NUOVE REGOLE DI SICUREZZA (RLS) - CORRETTE E SICURE
-- Questo è il set di regole definitivo che non entrerà in conflitto con il trigger.

-- Regola 1: Chiunque può vedere i profili. Necessario per la navigazione del sito.
CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING ( true );

-- Regola 2: Un utente può modificare SOLO il proprio profilo. Regola di sicurezza fondamentale.
CREATE POLICY "Users can update own profile."
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = id );

-- NOTA IMPORTANTE: Non c'è una regola di INSERT per gli utenti.
-- La creazione è gestita ESCLUSIVAMENTE dal trigger automatico.
-- Questo elimina il paradosso e risolve l'errore.

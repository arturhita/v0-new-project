-- Questo script ricostruisce completamente la logica di creazione dei profili
-- per risolvere definitivamente l'errore "Database error saving new user".
-- Esegue le operazioni nell'ordine corretto per evitare errori di dipendenza.

-- 1. Rimuove il vecchio trigger dalla tabella degli utenti di Supabase.
--    Usiamo "IF EXISTS" per evitare errori se il trigger è già stato rimosso.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Rimuove la vecchia funzione che gestiva la creazione del profilo.
--    Usiamo "IF EXISTS" per evitare errori se la funzione è già stata rimossa.
DROP FUNCTION IF EXISTS public.handle_new_user;

-- 3. Crea una NUOVA funzione, corretta e sicura.
--    - "SECURITY DEFINER" è la chiave: permette alla funzione di bypassare le regole
--      di sicurezza (RLS) in modo sicuro, eseguendola con i permessi di amministratore.
--    - La funzione è semplice: inserisce solo l'ID e l'email del nuovo utente,
--      evitando di leggere metadati che potrebbero causare errori.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$;

-- 4. Crea un NUOVO trigger che collega la nuova funzione alla tabella degli utenti.
--    Questo trigger si attiverà dopo la creazione di un nuovo utente in Supabase Auth.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. Resetta completamente le regole di sicurezza (RLS) sulla tabella dei profili.
--    Prima disabilitiamo la RLS per poter cancellare le vecchie regole senza conflitti.
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

--    Cancelliamo tutte le possibili vecchie regole che ho creato erroneamente.
DROP POLICY IF EXISTS "Allow public read access" ON public.profiles;
DROP POLICY IF EXISTS "Allow individual insert access" ON public.profiles;
DROP POLICY IF EXISTS "Allow individual update access" ON public.profiles;
DROP POLICY IF EXISTS "Allow individual delete access" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone." ON public.profiles;


-- 6. Abilita la RLS e crea un nuovo set di regole, corretto e sicuro.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--    - REGOLA DI LETTURA: Chiunque può vedere i profili (necessario per la piattaforma).
CREATE POLICY "Profiles are viewable by everyone." ON public.profiles
  FOR SELECT USING (true);

--    - REGOLA DI AGGIORNAMENTO: Un utente può aggiornare SOLO il proprio profilo.
--      "auth.uid()" è una funzione di Supabase che restituisce l'ID dell'utente autenticato.
CREATE POLICY "Users can update their own profile." ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

--    - REGOLA DI CANCELLAZIONE: Un utente può cancellare SOLO il proprio profilo.
CREATE POLICY "Users can delete their own profile." ON public.profiles
  FOR DELETE USING (auth.uid() = id);

-- NOTA IMPORTANTE: Non creiamo una regola di INSERIMENTO per gli utenti.
-- L'inserimento è gestito esclusivamente dalla nostra funzione automatica (trigger),
-- che agisce come amministratore. Questo risolve il conflitto alla radice.

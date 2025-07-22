-- Assicura che la Row Level Security (RLS) sia abilitata sulla tabella dei profili.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Rimuove le policy esistenti per evitare conflitti e garantire una configurazione pulita.
-- È sicuro eseguire questo blocco anche se le policy non esistono.
DROP POLICY IF EXISTS "Users can view their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles." ON public.profiles;
-- Rimuove anche vecchie policy con nomi diversi per una pulizia completa
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "User can see their own profile only." ON public.profiles;
DROP POLICY IF EXISTS "Users can create a profile." ON public.profiles;


-- POLICY DI LETTURA (SELECT)
-- Questa è la policy cruciale che risolve l'errore "Profilo non trovato".
-- Permette a un utente autenticato di leggere la riga del proprio profilo.
CREATE POLICY "Users can view their own profile."
ON public.profiles FOR SELECT
TO authenticated
USING ( auth.uid() = id );

-- POLICY DI INSERIMENTO (INSERT)
-- Permette a un utente autenticato di creare il proprio profilo.
-- Il `WITH CHECK` garantisce che l'ID del profilo corrisponda al loro ID utente.
CREATE POLICY "Users can insert their own profile."
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK ( auth.uid() = id );

-- POLICY DI AGGIORNAMENTO (UPDATE)
-- Permette a un utente autenticato di aggiornare il proprio profilo.
CREATE POLICY "Users can update their own profile."
ON public.profiles FOR UPDATE
TO authenticated
USING ( auth.uid() = id )
WITH CHECK ( auth.uid() = id );

-- POLICY DI CANCELLAZIONE (DELETE)
-- Permette a un utente autenticato di cancellare il proprio profilo.
CREATE POLICY "Users can delete their own profile."
ON public.profiles FOR DELETE
TO authenticated
USING ( auth.uid() = id );

-- POLICY PER AMMINISTRATORI
-- Permette ai ruoli di servizio (usati dal nostro client admin lato server) di bypassare
-- tutte le restrizioni RLS, garantendo il pieno controllo per le operazioni di backend.
CREATE POLICY "Admins can manage all profiles."
ON public.profiles FOR ALL
TO service_role
USING (true);

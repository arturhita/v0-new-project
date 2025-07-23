-- Abilita la Row Level Security sulla tabella 'profiles' se non è già attiva.
-- Questo è il prerequisito fondamentale perché le policy abbiano effetto.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy per la SELEZIONE (SELECT)
-- Permette a un utente di leggere:
-- 1. Il proprio profilo (auth.uid() = id).
-- 2. Qualsiasi profilo se l'utente ha il ruolo di 'admin' (nel token JWT).
DROP POLICY IF EXISTS "Allow individual read access" ON public.profiles;
CREATE POLICY "Allow individual read access"
ON public.profiles FOR SELECT
USING (auth.uid() = id OR auth.role() = 'admin');


-- Policy per l'AGGIORNAMENTO (UPDATE)
-- Permette a un utente di aggiornare solo ed esclusivamente il proprio profilo.
-- L'admin non può modificare direttamente i profili tramite questa policy,
-- per quello si usano le chiamate con la service_role key dal backend (server actions).
DROP POLICY IF EXISTS "Allow individual update access" ON public.profiles;
CREATE POLICY "Allow individual update access"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);


-- Policy per l'INSERIMENTO (INSERT)
-- Generalmente, l'inserimento nella tabella 'profiles' è gestito da un trigger
-- sulla tabella 'auth.users' (la funzione handle_new_user).
-- Per sicurezza, neghiamo inserimenti diretti da parte degli utenti.
-- Solo il server (usando la service_role) o i trigger dovrebbero inserire qui.
DROP POLICY IF EXISTS "Disallow direct inserts" ON public.profiles;
CREATE POLICY "Disallow direct inserts"
ON public.profiles FOR INSERT
WITH CHECK (false);


-- Policy per la CANCELLAZIONE (DELETE)
-- Similmente all'inserimento, la cancellazione dovrebbe essere gestita
-- in modo controllato dal backend, non direttamente dagli utenti.
-- Un utente non dovrebbe poter cancellare il proprio profilo direttamente via API.
DROP POLICY IF EXISTS "Disallow direct deletes" ON public.profiles;
CREATE POLICY "Disallow direct deletes"
ON public.profiles FOR DELETE
USING (false);

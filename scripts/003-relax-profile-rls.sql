-- =================================================================
-- PROFILES TABLE RLS UPDATE
-- =================================================================

-- Step 1: Rimuovi la vecchia policy di SELECT per evitare conflitti.
-- La vecchia policy permetteva agli utenti di vedere solo il proprio profilo.
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Gli utenti possono vedere il proprio profilo." ON public.profiles;
DROP POLICY IF EXISTS profiles_select_own ON public.profiles;


-- Step 2: Crea una nuova policy di SELECT.
-- Questa policy permette a CHIUNQUE (anche utenti non loggati) di LEGGERE
-- tutti i profili. Questo è necessario per mostrare la lista degli operatori
-- a tutti i visitatori del sito.
-- La sicurezza in scrittura è ancora garantita dalla policy di UPDATE.
CREATE POLICY "Public profiles are viewable by everyone."
ON public.profiles FOR SELECT
USING (true);

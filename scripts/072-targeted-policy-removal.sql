-- Questo script rimuove le policy RLS problematiche dalla tabella 'profiles',
-- disabilita RLS su di essa e crea una funzione sicura per l'accesso ai dati.
-- È una soluzione mirata per risolvere i problemi di login e ricorsione.

BEGIN;

-- Log dell'inizio dello script
RAISE NOTICE 'Inizio esecuzione script 072-targeted-policy-removal.sql';

-- 1. Rimuove le policy specifiche che causano problemi.
-- Usiamo IF EXISTS per evitare errori se una policy è già stata rimossa.
RAISE NOTICE 'Rimozione delle policy RLS dalla tabella profiles...';

DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.profiles;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile and related data" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated users to read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Utenti possono vedere il proprio profilo" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.profiles;

RAISE NOTICE 'Policy RLS rimosse.';

-- 2. Disabilita completamente RLS sulla tabella 'profiles' come misura definitiva.
-- Questo previene qualsiasi problema futuro di RLS su questa tabella.
RAISE NOTICE 'Disabilitazione di Row Level Security per la tabella profiles...';
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
RAISE NOTICE 'RLS disabilitata.';

-- 3. Crea (o rimpiazza) una funzione sicura per recuperare i profili.
-- Questa funzione agisce come un "gatekeeper" controllato per accedere ai dati dei profili.
-- SECURITY DEFINER permette alla funzione di bypassare le RLS (che sono comunque disabilitate,
-- ma è una buona pratica per il futuro).
RAISE NOTICE 'Creazione della funzione sicura get_user_profile...';

CREATE OR REPLACE FUNCTION public.get_user_profile(user_id uuid)
RETURNS TABLE(id uuid, full_name text, avatar_url text, role user_role)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Questa funzione recupera semplicemente un profilo per ID.
  -- La logica di autorizzazione è gestita a livello di applicazione.
  RETURN QUERY
  SELECT p.id, p.full_name, p.avatar_url, p.role
  FROM public.profiles p
  WHERE p.id = get_user_profile.user_id;
END;
$$;

RAISE NOTICE 'Funzione get_user_profile creata.';

-- 4. Concede i permessi di esecuzione sulla funzione.
-- Solo gli utenti autenticati possono chiamare questa funzione.
RAISE NOTICE 'Concessione dei permessi sulla funzione...';
GRANT EXECUTE ON FUNCTION public.get_user_profile(uuid) TO authenticated;
RAISE NOTICE 'Permessi concessi.';

-- 5. Assicura che l'utente che esegue lo script abbia un profilo.
-- Questo previene errori di login se il profilo non è stato creato a causa di trigger falliti.
RAISE NOTICE 'Verifica e creazione del profilo per l''utente corrente (se applicabile)...';
DO $$
DECLARE
    current_user_id uuid := auth.uid();
    current_user_email text;
BEGIN
    IF current_user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = current_user_id) THEN
        current_user_email := (SELECT email FROM auth.users WHERE id = current_user_id);
        RAISE NOTICE 'Profilo non trovato per l''utente %. Creazione in corso...', current_user_id;
        INSERT INTO public.profiles(id, email, full_name, role)
        VALUES (current_user_id, current_user_email, 'New User', 'client');
        RAISE NOTICE 'Profilo creato.';
    ELSE
        RAISE NOTICE 'Profilo già esistente o utente non autenticato. Nessuna azione richiesta.';
    END IF;
END $$;

RAISE NOTICE 'Script 072-targeted-policy-removal.sql completato con successo.';

COMMIT;

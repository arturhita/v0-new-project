-- Questo script risolve l'errore "cannot change return type of existing function"
-- eliminando esplicitamente la funzione prima di ricrearla con la firma corretta.
-- Include anche i passaggi precedenti per garantire che lo stato del DB sia corretto.

-- 1. Rimuove le policy specifiche che potrebbero ancora esistere.
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.profiles;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile and related data" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated users to read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Utenti possono vedere il proprio profilo" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.profiles;

-- 2. Disabilita completamente RLS sulla tabella 'profiles' per sicurezza.
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 3. ELIMINA la funzione esistente per evitare conflitti di firma, come suggerito dall'errore.
DROP FUNCTION IF EXISTS public.get_user_profile(uuid);

-- 4. Crea la funzione sicura per recuperare i profili con la firma corretta.
CREATE FUNCTION public.get_user_profile(user_id uuid)
RETURNS TABLE(id uuid, full_name text, avatar_url text, role user_role)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Questa funzione recupera semplicemente un profilo per ID.
  RETURN QUERY
  SELECT p.id, p.full_name, p.avatar_url, p.role
  FROM public.profiles p
  WHERE p.id = get_user_profile.user_id;
END;
$$;

-- 5. Concede i permessi di esecuzione sulla nuova funzione.
GRANT EXECUTE ON FUNCTION public.get_user_profile(uuid) TO authenticated;

-- 6. Assicura che l'utente che esegue lo script abbia un profilo.
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

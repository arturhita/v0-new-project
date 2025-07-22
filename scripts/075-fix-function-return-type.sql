-- Questo script risolve l'errore "structure of query does not match function result type"
-- modificando la funzione get_user_profile per restituire il ruolo come TEXT.
-- Questo approccio è più robusto e meno soggetto a problemi con i tipi ENUM custom.

-- 1. ELIMINA la funzione esistente per evitare conflitti.
DROP FUNCTION IF EXISTS public.get_user_profile(uuid);

-- 2. Crea la funzione sicura per recuperare i profili con il tipo di ritorno corretto.
--    La modifica chiave è `role TEXT` nel RETURNS e `p.role::text` nel SELECT.
CREATE FUNCTION public.get_user_profile(user_id uuid)
RETURNS TABLE(id uuid, full_name text, avatar_url text, role text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Questa funzione recupera un profilo per ID, convertendo il ruolo in testo.
  RETURN QUERY
  SELECT p.id, p.full_name, p.avatar_url, p.role::text
  FROM public.profiles p
  WHERE p.id = get_user_profile.user_id;
END;
$$;

-- 3. Concede i permessi di esecuzione sulla nuova funzione.
GRANT EXECUTE ON FUNCTION public.get_user_profile(uuid) TO authenticated;

-- 4. Assicura che l'utente che esegue lo script abbia un profilo.
DO $$
DECLARE
    current_user_id uuid := auth.uid();
    current_user_email text;
BEGIN
    IF current_user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = current_user_id) THEN
        SELECT email INTO current_user_email FROM auth.users WHERE id = current_user_id;
        INSERT INTO public.profiles(id, email, full_name, role)
        VALUES (current_user_id, current_user_email, 'New User', 'client');
    END IF;
END $$;

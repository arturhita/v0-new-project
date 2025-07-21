-- Questo script crea una funzione sicura per assegnare i privilegi di amministratore a un utente.
-- È più sicuro che modificare manualmente la tabella auth.users.
-- La funzione può essere chiamata solo da un amministratore del database (ad esempio, dalla dashboard di Supabase).
CREATE OR REPLACE FUNCTION public.grant_admin_role(email_address TEXT)
RETURNS TEXT
LANGUAGE plpgsql
-- SECURITY DEFINER permette a questa funzione di modificare la tabella protetta auth.users
AS $$
DECLARE
  user_id uuid;
BEGIN
  -- Trova l'ID dell'utente dalla sua email
  SELECT id INTO user_id FROM auth.users WHERE email = email_address;

  IF user_id IS NULL THEN
    RETURN 'Errore: Utente non trovato con l'email ' || email_address;
  END IF;

  -- Aggiorna i metadati dell'utente nella tabella auth per includere il ruolo di admin
  UPDATE auth.users
  SET raw_user_meta_data = raw_user_meta_data || '{"user_role": "admin"}'::jsonb
  WHERE id = user_id;

  -- Aggiorna anche la tabella dei profili pubblici per coerenza all'interno dell'app
  UPDATE public.profiles
  SET role = 'admin'
  WHERE id = user_id;

  RETURN 'Successo: Ruolo di amministratore concesso a ' || email_address;
END;
$$;

-- Concede il permesso di esecuzione al ruolo 'postgres' (il superutente predefinito)
-- Questo assicura che tu possa eseguirlo dall'editor SQL di Supabase.
GRANT EXECUTE ON FUNCTION public.grant_admin_role(TEXT) TO postgres;


-- =====================================================================================
-- Chiama la funzione per concedere i diritti di amministratore all'utente specificato.
-- =====================================================================================
SELECT public.grant_admin_role('pagamenticonsulenza@gmail.com');

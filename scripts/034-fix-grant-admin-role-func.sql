CREATE OR REPLACE FUNCTION grant_admin_role(email_address TEXT)
RETURNS TEXT AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Trova l'ID dell'utente basato sull'email
  SELECT id INTO target_user_id FROM auth.users WHERE email = email_address;

  -- Se l'utente esiste, aggiorna i suoi metadati per includere il ruolo di admin
  IF target_user_id IS NOT NULL THEN
    UPDATE auth.users
    SET raw_app_meta_data = raw_app_meta_data || '{"user_role": "admin"}'
    WHERE id = target_user_id;
    
    -- Inserisce o aggiorna il profilo per assicurarsi che il ruolo sia riflesso anche lì
    INSERT INTO public.profiles (id, role)
    VALUES (target_user_id, 'admin')
    ON CONFLICT (id) DO UPDATE 
    SET role = 'admin';

    RETURN 'Success: Admin role granted to ' || email_address;
  ELSE
    -- Se l'utente non viene trovato, restituisci un errore (con l'apostrofo corretto)
    RETURN 'Errore: Utente non trovato con l''email ' || email_address;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Esempio di utilizzo (da non eseguire se non per test):
-- SELECT grant_admin_role('pagamenticonsulenza@gmail.com');

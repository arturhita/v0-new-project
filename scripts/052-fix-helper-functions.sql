-- Funzione per aggiornare il timestamp updated_at
-- Questa funzione è usata come trigger per aggiornare automaticamente il campo `updated_at`
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Funzione per verificare se un utente è un amministratore
-- Assicura che usi la colonna 'id' e non 'user_id' dalla tabella profiles
-- e che il ruolo sia 'admin'.
CREATE OR REPLACE FUNCTION public.is_admin(user_id_to_check uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE
      id = user_id_to_check AND
      role = 'admin'
  );
$$;

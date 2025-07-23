-- Funzione per verificare se un utente è amministratore
-- Utilizza CREATE OR REPLACE per garantire che la funzione sia sempre aggiornata.
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = user_id AND profiles.role = 'admin'
  );
END;
$$;

-- Funzione per aggiornare il timestamp 'updated_at'
-- Utilizza CREATE OR REPLACE per garantire che la funzione sia sempre aggiornata.
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

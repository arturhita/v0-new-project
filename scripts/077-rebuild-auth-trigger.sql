-- Pulisce i vecchi trigger per evitare conflitti.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Funzione robusta per creare un profilo per un nuovo utente.
-- Utilizza SECURITY DEFINER per avere i permessi necessari per scrivere nella tabella public.profiles.
-- Legge i metadati grezzi per evitare errori se i campi non sono direttamente disponibili.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    'client' -- Imposta 'client' come ruolo predefinito per ogni nuovo utente.
  );
  RETURN new;
END;
$$;

-- Crea il trigger che esegue la funzione dopo l'inserimento di un nuovo utente in auth.users.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

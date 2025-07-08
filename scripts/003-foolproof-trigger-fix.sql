-- Disattiva il vecchio trigger se esiste, per sicurezza
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- Rimuovi la vecchia funzione se esiste
DROP FUNCTION IF EXISTS public.handle_new_user;

-- Crea una nuova funzione, semplice e diretta
CREATE OR REPLACE FUNCTION public.create_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Inserisce una nuova riga nella tabella dei profili
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'name', -- Prende il nome dai metadati passati al momento della registrazione
    new.email,
    new.raw_user_meta_data->>'role' -- Prende il ruolo dai metadati, o usa 'client' come default
  );
  RETURN new;
END;
$$;

-- Crea il nuovo trigger che si attiva dopo la creazione di un utente in auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.create_user_profile();

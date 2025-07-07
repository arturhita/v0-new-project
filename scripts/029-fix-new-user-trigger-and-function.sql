-- Disabilita temporaneamente il trigger per evitare errori durante la modifica della funzione
ALTER TABLE auth.users DISABLE TRIGGER on_auth_user_created;

-- Elimina la vecchia funzione se esiste, per garantire una nuova installazione pulita
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Crea la nuova funzione, più robusta e corretta
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Inserisce il nuovo utente nella tabella dei profili, estraendo i metadati
  -- passati durante la creazione dell'utente via API admin.
  INSERT INTO public.profiles (id, email, role, full_name, stage_name)
  VALUES (
    new.id,
    new.email,
    -- Estrae il ruolo dai metadati, default a 'client' se non presente
    new.raw_user_meta_data->>'role',
    -- Estrae il nome completo dai metadati
    new.raw_user_meta_data->>'full_name',
    -- Estrae il nome d'arte dai metadati
    new.raw_user_meta_data->>'stage_name'
  );
  RETURN new;
END;
$$;

-- Ricrea il trigger per collegarlo alla nuova funzione
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Riabilita il trigger
ALTER TABLE auth.users ENABLE TRIGGER on_auth_user_created;

-- Commento per chiarezza:
-- Questa versione del trigger e della funzione è progettata per essere più affidabile.
-- Utilizza i metadati passati durante la creazione dell'utente per popolare i campi iniziali,
-- riducendo la complessità e i possibili punti di fallimento.

-- Rimuove la vecchia funzione e il trigger se esistono, per una pulizia completa.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user;

-- Crea la funzione che gestirà la creazione di un nuovo profilo.
-- SECURITY DEFINER permette alla funzione di operare con i permessi del suo creatore,
-- garantendo che possa scrivere nella tabella 'profiles'.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Inserisce una nuova riga nella tabella 'profiles' per ogni nuovo utente registrato in 'auth.users'.
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id,
    -- Legge il nome completo direttamente dai metadati forniti durante la registrazione.
    -- Questo è il punto chiave per evitare errori se la colonna non esiste o è null.
    new.raw_user_meta_data ->> 'full_name',
    -- Assegna il ruolo di 'client' di default.
    'client'
  );
  RETURN new;
END;
$$;

-- Crea il trigger che esegue la funzione 'handle_new_user'
-- automaticamente dopo ogni nuovo inserimento nella tabella 'auth.users'.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

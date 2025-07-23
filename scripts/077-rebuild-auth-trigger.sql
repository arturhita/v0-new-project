-- Rimuove la vecchia funzione e il trigger se esistono, per evitare conflitti.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Crea la funzione che verrà eseguita dopo la creazione di un nuovo utente in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Inserisce una nuova riga nella tabella public.profiles
  -- L'ID utente viene preso dal nuovo record in auth.users (new.id)
  -- Il nome completo viene estratto dai metadati grezzi dell'utente
  -- Il ruolo di default è 'client'
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    'client'
  );
  RETURN new;
END;
$$;

-- Crea il trigger che chiama la funzione handle_new_user()
-- ogni volta che un nuovo utente viene inserito nella tabella auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Aggiunge un commento per chiarezza
COMMENT ON FUNCTION public.handle_new_user() IS 'Crea un profilo per ogni nuovo utente registrato.';

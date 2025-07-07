-- Questo script corregge definitivamente il problema di creazione dell'utente
-- utilizzando un approccio semplificato e robusto.

-- Inizia rimuovendo la vecchia funzione e il trigger per garantire una nuova installazione pulita.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user;

-- Ora, crea la funzione corretta e semplificata.
-- SECURITY DEFINER è ancora usato per gestire i permessi in modo standard e sicuro.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Inserisce solo le informazioni essenziali e garantite (id e email).
  -- La colonna 'role' userà il suo valore di default ('client').
  -- La colonna 'full_name' sarà NULL, che è permesso.
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$;

-- Infine, ricrea il trigger che si attiva dopo la creazione di un nuovo utente
-- e chiama la nostra nuova funzione semplificata.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

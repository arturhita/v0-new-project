-- Questo script imposta un trigger per creare automaticamente un profilo
-- quando un nuovo utente viene aggiunto al sistema di autenticazione di Supabase.

-- 1. Creare una funzione che verrà eseguita dal trigger.
--    Questa funzione inserisce una nuova riga nella tabella 'public.profiles'.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Inserisce il nuovo utente nella tabella dei profili con un ruolo predefinito 'client'.
  -- Il nome completo viene preso dai metadati dell'utente se disponibile.
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'client');
  RETURN new;
END;
$$;

-- 2. Creare il trigger che chiama la funzione 'handle_new_user'
--    dopo ogni inserimento nella tabella 'auth.users'.
--    Viene prima eliminato il trigger esistente per garantire che lo script possa essere eseguito più volte.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Messaggio di successo per il log
-- (Questo non viene eseguito da SQL, ma è un commento per l'utente)
-- SCRIPT: Trigger 'on_auth_user_created' creato/aggiornato con successo.
-- Ora la creazione di un utente in Auth creerà automaticamente un profilo.

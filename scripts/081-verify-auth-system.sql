-- Questo script verifica e corregge il sistema di autenticazione di base.
-- Assicura che la funzione per creare profili utente esista e sia corretta.

-- 1. Definisci la funzione `handle_new_user` che crea un profilo per ogni nuovo utente.
--    Usiamo `CREATE OR REPLACE FUNCTION` per aggiornarla se esiste già.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserisci una nuova riga nella tabella `profiles` usando l'ID e l'email del nuovo utente.
  -- Il `full_name` viene preso dai metadati forniti durante la registrazione.
  -- Il ruolo di default è 'client'.
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    'client'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Rimuovi eventuali trigger esistenti con lo stesso nome per evitare conflitti.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. Crea il trigger che esegue la funzione `handle_new_user`
--    dopo che un nuovo utente è stato inserito nella tabella `auth.users`.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Aggiungi un commento per chiarezza
COMMENT ON FUNCTION public.handle_new_user IS 'Crea un profilo per ogni nuovo utente registrato.';
COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 'Esegue handle_new_user() per creare un profilo utente.';

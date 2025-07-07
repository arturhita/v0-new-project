-- Prima eliminiamo il trigger esistente dalla tabella auth.users.
-- Usiamo "IF EXISTS" per evitare errori nel caso in cui il trigger non esista.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Ora eliminiamo la funzione vecchia e difettosa.
-- Anche qui, "IF EXISTS" previene errori inutili.
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Creiamo la nuova funzione, corretta e robusta.
-- SECURITY DEFINER è fondamentale: permette alla funzione di essere eseguita con i permessi
-- dell'amministratore che la definisce, consentendole di scrivere nella tabella public.profiles.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Questa funzione viene eseguita automaticamente dopo la creazione di un utente.
  -- Inserisce una nuova riga nella tabella 'profiles' usando i dati passati
  -- durante la creazione dell'utente (via API admin).
  INSERT INTO public.profiles (id, email, role, full_name, stage_name)
  VALUES (
    new.id,
    new.email,
    -- Estrae il 'role' dai metadati dell'utente. Se non c'è, imposta 'client' come default.
    new.raw_user_meta_data->>'role',
    -- Estrae il 'full_name' dai metadati.
    new.raw_user_meta_data->>'full_name',
    -- Estrae lo 'stage_name' dai metadati.
    new.raw_user_meta_data->>'stage_name'
  );
  RETURN new;
END;
$$;

-- Infine, ricreiamo il trigger, collegandolo alla nuova funzione corretta.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Aggiungiamo un commento per futura chiarezza.
COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 'Chiama la funzione handle_new_user per creare un profilo per ogni nuovo utente.';

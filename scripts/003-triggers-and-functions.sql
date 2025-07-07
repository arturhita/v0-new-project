-- Funzione che viene eseguita quando un nuovo utente si registra
-- Prende i dati dalla tabella di autenticazione e li inserisce nella nostra tabella 'profiles'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'name',
    new.email,
    (new.raw_user_meta_data->>'role')::public.user_role, -- Assicura che il ruolo sia del tipo corretto
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$;

-- Trigger: collega la funzione all'evento di creazione di un nuovo utente
-- Ogni volta che un utente viene aggiunto a 'auth.users', esegue 'handle_new_user'
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Abilita le notifiche in tempo reale per le tabelle che ci interessano
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

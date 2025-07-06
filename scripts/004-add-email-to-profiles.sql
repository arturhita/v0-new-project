-- Aggiunge la colonna 'email' alla tabella dei profili se non esiste già.
-- Questo rende l'email accessibile per le query senza dover accedere alla tabella auth.users.
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Aggiorna i profili esistenti che non hanno un'email.
-- Copia l'email dalla tabella auth.users alla tabella public.profiles.
-- Questo è necessario per gli utenti creati prima di questa modifica.
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;

-- Riscrive la funzione che gestisce la creazione di un nuovo utente.
-- Ora, quando un utente si registra, il suo indirizzo email viene automaticamente
-- copiato nella tabella dei profili pubblici.
DROP FUNCTION IF EXISTS public.handle_new_user();
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'name',
    new.email, -- Copia l'email al momento della creazione del profilo
    'client'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Assicura che il trigger on_auth_user_created sia attivo e utilizzi la funzione aggiornata.
-- Questo trigger viene eseguito dopo l'inserimento di un nuovo utente nella tabella di autenticazione.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 🌑 MOONTHIR - SCRIPT DI CONFIGURAZIONE TRIGGER V1.0 🌑
-- Questo script crea la logica per creare automaticamente un profilo
-- quando un nuovo utente si registra.

-- 1. Creazione della funzione che verrà eseguita dal trigger
-- Questa funzione prende l'ID e l'email del nuovo utente da auth.users
-- e crea una riga corrispondente nella nostra tabella public.profiles.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name, email)
  VALUES (new.id, 'client', new.raw_user_meta_data->>'full_name', new.email);
  RETURN new;
END;
$$;

-- 2. Creazione del trigger
-- Questo trigger chiama la funzione handle_new_user() ogni volta che
-- una nuova riga viene inserita nella tabella auth.users.
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

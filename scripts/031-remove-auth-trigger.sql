-- Rimuove in modo sicuro il trigger dalla tabella di autenticazione.
-- Questo è l'elemento che causa gli errori di permesso.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Rimuove in modo sicuro la funzione associata al trigger.
-- Non è più necessaria poiché la logica verrà gestita direttamente nel codice dell'applicazione.
DROP FUNCTION IF EXISTS public.handle_new_user();

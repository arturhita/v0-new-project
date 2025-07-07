-- Questo script ripristina i permessi predefiniti per gli schemi interni di Supabase.
-- È una procedura standard per risolvere errori come "Database error checking email",
-- che di solito indicano un problema di permessi.

-- Concede l'uso dello schema 'auth' ai ruoli necessari.
GRANT USAGE ON SCHEMA auth TO supabase_auth_admin, service_role, postgres, anon, authenticated;

-- Concede tutti i privilegi per lo schema 'auth' a postgres e supabase_auth_admin.
-- Questo è fondamentale per permettere al motore di autenticazione di gestire gli utenti.
GRANT ALL ON ALL TABLES IN SCHEMA auth TO supabase_auth_admin, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO supabase_auth_admin, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA auth TO supabase_auth_admin, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA auth GRANT ALL ON TABLES TO supabase_auth_admin, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA auth GRANT ALL ON SEQUENCES TO supabase_auth_admin, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA auth GRANT ALL ON FUNCTIONS TO supabase_auth_admin, service_role;

-- Concede l'uso dello schema 'storage'.
GRANT USAGE ON SCHEMA storage TO supabase_storage_admin, service_role, postgres, anon, authenticated;

-- Concede tutti i privilegi per lo schema 'storage'.
GRANT ALL ON ALL TABLES IN SCHEMA storage TO supabase_storage_admin, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA storage TO supabase_storage_admin, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA storage TO supabase_storage_admin, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA storage GRANT ALL ON TABLES TO supabase_storage_admin, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA storage GRANT ALL ON SEQUENCES TO supabase_storage_admin, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA storage GRANT ALL ON FUNCTIONS TO supabase_storage_admin, service_role;

-- Concede l'esecuzione su funzioni specifiche agli utenti autenticati, come da standard.
GRANT EXECUTE ON FUNCTION auth.uid() TO authenticated;
GRANT EXECUTE ON FUNCTION auth.role() TO authenticated;
GRANT EXECUTE ON FUNCTION auth.email() TO authenticated;

-- Commento finale per indicare il completamento.
-- I permessi predefiniti per Supabase Auth e Storage sono stati ripristinati.
-- L'errore "Database error checking email" dovrebbe essere risolto.

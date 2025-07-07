-- Questo script è un tentativo mirato e diretto per risolvere il problema "Database error checking email".
-- Si concentra sull'unica autorizzazione essenziale per questa operazione: la capacità di leggere la tabella degli utenti.

-- L'errore suggerisce che il ruolo utilizzato dal servizio di autenticazione non può eseguire
-- una SELECT sulla tabella auth.users per verificare se un'email esiste già.

-- Concediamo esplicitamente questa autorizzazione ai ruoli critici.

-- 1. Concedi al ruolo 'service_role' il permesso di SELEZIONARE dalla tabella auth.users.
--    Questo ruolo è spesso utilizzato per le operazioni interne del backend.
GRANT SELECT ON TABLE auth.users TO service_role;

-- 2. Concedi al ruolo 'supabase_auth_admin' il permesso di SELEZIONARE dalla tabella auth.users.
--    Questo è il ruolo principale per la gestione dell'autenticazione.
GRANT SELECT ON TABLE auth.users TO supabase_auth_admin;

-- 3. Per sicurezza, concediamo anche l'uso dello schema 'auth' a questo ruolo.
GRANT USAGE ON SCHEMA auth TO supabase_auth_admin;

-- Commento finale per indicare il completamento.
-- Se questo script non risolve il problema, l'errore è probabilmente a un livello più profondo
-- dell'infrastruttura del progetto Supabase e potrebbe richiedere assistenza diretta da Supabase.

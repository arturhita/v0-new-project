-- Questo script rimuove la vecchia funzione RPC per la ricerca del profilo operatore.
-- La nuova logica è gestita direttamente nel codice (lib/actions/operator.actions.ts)
-- per una maggiore chiarezza e facilità di debug.
DROP FUNCTION IF EXISTS get_operator_public_profile(TEXT);

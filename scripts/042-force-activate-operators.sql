-- Questo script non cancella nulla.
-- Trova tutti i profili che sono operatori e imposta il loro stato su 'Attivo'.
-- Questo è un intervento diretto per risolvere il problema della visibilità.

UPDATE public.profiles
SET status = 'Attivo'
WHERE role = 'operator';

-- Messaggio di log per confermare l'operazione.
-- Dopo aver eseguito lo script, controlli la sezione "Logs" nel SQL Editor
-- per vedere quanti operatori sono stati aggiornati.
SELECT 'Operazione di attivazione forzata completata. Controllare i risultati.' as "Risultato";

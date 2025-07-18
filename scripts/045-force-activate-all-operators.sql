-- =================================================================
-- SCRIPT DI ATTIVAZIONE FORZATA FINALE
-- Questo script non cancella nulla.
-- La sua unica funzione è trovare tutti i profili che sono operatori
-- e assicurarsi che il loro stato sia 'Attivo', rendendoli visibili.
-- =================================================================

-- Passo 1: Aggiorna lo stato di tutti gli operatori ad 'Attivo'.
-- Questo risolve il problema se lo stato è 'In Attesa', 'Sospeso', o null.
UPDATE public.profiles
SET status = 'Attivo'
WHERE role = 'operator';

-- Passo 2: Messaggio di conferma.
-- Controlla la sezione "Results" nel SQL Editor dopo l'esecuzione
-- per vedere un messaggio di conferma e il numero di righe modificate.
SELECT count(*) || ' operatori sono stati attivati con successo.' as risultato
FROM public.profiles
WHERE role = 'operator' AND status = 'Attivo';

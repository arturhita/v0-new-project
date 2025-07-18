-- =================================================================
-- SCRIPT DI SOCCORSO: ASSEGNAZIONE RUOLO OPERATORE
--
-- MOTIVO: Il sistema riporta "0 operatori" perché nessun profilo
-- ha il campo 'role' impostato su 'operator'.
--
-- OBIETTIVO: Questo script identifica i profili che DOVREBBERO
-- essere operatori (es. hanno un nome d'arte) e assegna loro
-- il ruolo corretto e li attiva.
-- =================================================================

-- Passo 1: Identifica e aggiorna i profili che sembrano operatori
-- ma non hanno il ruolo corretto.
-- La logica è: se un profilo ha un 'stage_name', è quasi certamente un operatore.
UPDATE public.profiles
SET
  role = 'operator', -- Assegna il ruolo mancante
  status = 'Attivo'    -- Attiva il profilo per renderlo visibile
WHERE
  stage_name IS NOT NULL AND stage_name != '' -- Condizione chiave: ha un nome d'arte
  AND (role IS NULL OR role != 'operator'); -- E il ruolo è sbagliato o mancante

-- Passo 2: Messaggio di conferma.
-- Controlla il risultato per vedere quanti profili sono stati corretti.
-- QUESTA VOLTA, IL NUMERO DOVREBBE ESSERE MAGGIORE DI 0.
SELECT count(*) || ' profili sono stati corretti, assegnando il ruolo di operatore e attivati.' as risultato
FROM public.profiles
WHERE stage_name IS NOT NULL AND stage_name != ''
  AND role = 'operator'
  AND status = 'Attivo';

-- Passo 3: Verifica finale.
-- Questo mostra un elenco dei nomi d'arte degli operatori che ora dovrebbero essere attivi.
-- Se questo elenco non è vuoto, la correzione ha funzionato.
SELECT stage_name, email, role, status
FROM public.profiles
WHERE role = 'operator';

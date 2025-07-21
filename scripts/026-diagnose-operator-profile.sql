-- Questo script di diagnostica ti aiuta a verificare perché un profilo operatore
-- potrebbe non essere trovato. Esegui queste query nel tuo SQL Editor di Supabase.
-- Sostituisci 'Sole Aurora' con il nome d'arte che stai cercando in ogni query.

-- Query 1: Ricerca esatta (maiuscole/minuscole sensibile)
-- Controlla se esiste un profilo con ESATTAMENTE questo nome.
SELECT id, full_name, stage_name, role, status
FROM public.profiles
WHERE stage_name = 'Sole Aurora';

-- Query 2: Ricerca insensibile a maiuscole/minuscole e spazi
-- Controlla se esiste un profilo che corrisponde ignorando maiuscole/minuscole e spazi.
SELECT id, full_name, stage_name, role, status
FROM public.profiles
WHERE lower(trim(stage_name)) = lower(trim('Sole Aurora'));

-- Query 3: Ricerca completa (insensibile a maiuscole/minuscole, spazi, accenti)
-- Questa è la stessa logica usata dalla funzione `get_public_profile_by_stage_name`.
-- Se questa query non restituisce risultati, il profilo non esiste nel database.
SELECT id, full_name, stage_name, role, status
FROM public.profiles
WHERE trim(unaccent(lower(stage_name))) = trim(unaccent(lower('Sole Aurora')));

-- Query 4: Ricerca completa con i filtri di stato e ruolo
-- QUESTA È LA QUERY PIÙ IMPORTANTE. Determina se il profilo è visibile pubblicamente.
-- Se questa query non restituisce risultati, il profilo esiste ma non è 'approved'
-- o non ha il ruolo 'operator', quindi non viene mostrato.
SELECT id, full_name, stage_name, role, status
FROM public.profiles
WHERE
  trim(unaccent(lower(stage_name))) = trim(unaccent(lower('Sole Aurora')))
  AND role = 'operator'
  AND status = 'approved';

-- COME INTERPRETARE I RISULTATI:
-- - Se la Query 4 restituisce una riga: La pagina del profilo dovrebbe funzionare. Se non funziona, potrebbe esserci un problema di cache.
-- - Se la Query 4 non restituisce nulla, ma la Query 3 sì: Il profilo esiste, ma il suo 'role' non è 'operator' o il suo 'status' non è 'approved'. Devi correggere i dati nella tabella 'profiles'.
-- - Se nessuna delle query restituisce risultati: Non esiste un operatore con quel nome d'arte nel tuo database.

-- In PostgreSQL, le estensioni devono essere abilitate una sola volta per database.
-- Questa riga assicura che l'estensione 'unaccent' sia disponibile.
-- Se è già abilitata, il comando non farà nulla.
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Prima, eliminiamo la funzione se esiste già per garantire un aggiornamento pulito.
DROP FUNCTION IF EXISTS get_public_profile_by_stage_name(text);

-- Creiamo la funzione che cerca un profilo operatore in modo robusto.
-- Cerca per nome d'arte ignorando maiuscole/minuscole, spazi extra e accenti.
CREATE OR REPLACE FUNCTION get_public_profile_by_stage_name(stage_name_to_find text)
RETURNS SETOF profiles AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.profiles
  WHERE
    -- unaccent: rimuove gli accenti (es. 'è' -> 'e')
    -- lower: converte in minuscolo
    -- trim: rimuove spazi all'inizio e alla fine
    trim(unaccent(lower(stage_name))) = trim(unaccent(lower(stage_name_to_find)))
    AND role = 'operator'
    AND status = 'approved';
END;
$$ LANGUAGE plpgsql;

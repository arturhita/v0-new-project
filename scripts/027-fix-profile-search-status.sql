-- Questo script aggiorna la funzione che cerca i profili pubblici degli operatori.
-- La versione precedente controllava erroneamente per status = 'approved'.
-- Questa versione corregge il controllo in status = 'Attivo', che è lo stato corretto
-- per gli operatori attivi e pubblicamente visibili nel sistema.

CREATE OR REPLACE FUNCTION get_public_profile_by_stage_name(stage_name_to_find TEXT)
RETURNS SETOF profiles AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.profiles
  WHERE
    -- Utilizza una ricerca robusta che ignora maiuscole/minuscole, spazi extra e accenti
    trim(unaccent(lower(stage_name))) = trim(unaccent(lower(stage_name_to_find)))
    -- Assicura che l'utente sia un operatore
    AND role = 'operator'
    -- CORREZIONE CRITICA: Controlla lo stato 'Attivo' invece di 'approved'
    AND status = 'Attivo';
END;
$$ LANGUAGE plpgsql;

-- Abilita l'estensione unaccent se non è già attiva.
-- Questa estensione fornisce funzioni per rimuovere gli accenti dalle stringhe.
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Sostituisce la funzione precedente con una versione migliorata
-- che utilizza unaccent per una ricerca case-insensitive e accent-insensitive.
CREATE OR REPLACE FUNCTION get_operators_by_category_case_insensitive(category_slug TEXT)
RETURNS SETOF profiles AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM profiles
  WHERE
    role = 'operator' AND
    status = 'Attivo' AND
    -- Controlla se esiste una categoria nell'array `categories` che corrisponda
    -- allo slug fornito, dopo aver rimosso gli accenti e convertito in minuscolo.
    EXISTS (
      SELECT 1
      FROM unnest(categories) AS cat
      WHERE lower(unaccent(cat)) = lower(unaccent(category_slug))
    );
END;
$$ LANGUAGE plpgsql;

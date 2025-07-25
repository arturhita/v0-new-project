-- Funzione per cercare operatori per categoria ignorando maiuscole/minuscole
-- Questo risolve il problema per cui "cartomanzia" nell'URL non corrisponde a "Cartomanzia" nel database.
CREATE OR REPLACE FUNCTION get_operators_by_category_case_insensitive(category_slug text)
RETURNS SETOF profiles AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM profiles p
  WHERE p.role = 'operator'
    AND p.status = 'Attivo'
    AND EXISTS (
      SELECT 1
      FROM unnest(p.categories) AS category
      WHERE lower(category) = lower(category_slug)
    );
END;
$$ LANGUAGE plpgsql;

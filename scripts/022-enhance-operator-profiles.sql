-- Aggiunge le colonne mancanti alla tabella dei profili per allinearla ai dati necessari per gli operatori.
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS main_discipline TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' NOT NULL;

-- Commenti per chiarezza
COMMENT ON COLUMN profiles.phone IS 'Numero di telefono dell''operatore (privato).';
COMMENT ON COLUMN profiles.main_discipline IS 'La disciplina principale mostrata in elenchi rapidi.';
COMMENT ON COLUMN profiles.status IS 'Stato dell''account operatore (es. active, pending, suspended).';

-- Aggiorna i profili operatore esistenti con valori di default sensati se sono null
UPDATE profiles
SET
  main_discipline = (
    SELECT c.name
    FROM operator_categories oc
    JOIN categories c ON oc.category_id = c.id
    WHERE oc.operator_id = profiles.id
    LIMIT 1
  )
WHERE role = 'operator' AND main_discipline IS NULL;

UPDATE profiles
SET
  status = 'active'
WHERE role = 'operator' AND status = 'pending' AND is_available = true;

-- Creiamo una vista per semplificare le query di lettura degli operatori nell'admin panel.
-- Questa vista unisce i profili con gli utenti per ottenere l'email.
CREATE OR REPLACE VIEW admin_operators_view AS
SELECT
  p.id,
  p.full_name,
  p.stage_name,
  p.main_discipline,
  p.status,
  p.commission_rate,
  p.created_at AS joined_at,
  u.email,
  p.phone,
  p.bio,
  p.is_available,
  p.profile_image_url,
  p.service_prices,
  p.availability_schedule
FROM
  profiles p
JOIN
  auth.users u ON p.id = u.id
WHERE
  p.role = 'operator';

COMMENT ON VIEW admin_operators_view IS 'Vista aggregata per recuperare facilmente tutti i dati degli operatori per il pannello di amministrazione.';

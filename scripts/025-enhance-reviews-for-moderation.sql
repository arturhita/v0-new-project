-- Aggiunge la colonna 'status' alla tabella delle recensioni se non esiste già.
-- Lo stato può essere 'pending', 'approved', o 'rejected'.
DO $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='reviews' AND column_name='status') THEN
    ALTER TABLE reviews ADD COLUMN status TEXT NOT NULL DEFAULT 'pending';
  END IF;
END $$;

-- Aggiunge un vincolo per assicurare che i valori di 'status' siano validi.
ALTER TABLE reviews
DROP CONSTRAINT IF EXISTS reviews_status_check,
ADD CONSTRAINT reviews_status_check CHECK (status IN ('pending', 'approved', 'rejected'));

-- Aggiunge una colonna per le note del moderatore, utile per registrare il motivo di un rifiuto.
DO $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='reviews' AND column_name='moderator_notes') THEN
    ALTER TABLE reviews ADD COLUMN moderator_notes TEXT;
  END IF;
END $$;

-- Crea o rimpiazza una vista per interrogare facilmente i dati necessari al pannello di moderazione.
CREATE OR REPLACE VIEW admin_reviews_view AS
SELECT
  r.id,
  r.rating,
  r.comment,
  r.status,
  r.created_at,
  client_profile.full_name AS client_name,
  operator_profile.full_name AS operator_name
FROM
  reviews r
LEFT JOIN
  profiles client_profile ON r.client_id = client_profile.id
LEFT JOIN
  profiles operator_profile ON r.operator_id = operator_profile.id;

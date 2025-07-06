-- Questo script corregge e consolida lo schema per gli operatori,
-- assicurando che tutte le colonne necessarie esistano prima di creare la vista di amministrazione.

-- 1. Assicura che tutte le colonne necessarie esistano nella tabella 'profiles'.
-- Usiamo 'ADD COLUMN IF NOT EXISTS' per rendere lo script eseguibile più volte senza errori.

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS commission_rate NUMERIC(5, 2) DEFAULT 15.00,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS main_discipline TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' NOT NULL;

-- Commenti per chiarezza
COMMENT ON COLUMN public.profiles.commission_rate IS 'La percentuale di commissione per l''operatore (es. 15.00 per 15%).';
COMMENT ON COLUMN public.profiles.phone IS 'Numero di telefono dell''operatore (privato).';
COMMENT ON COLUMN public.profiles.main_discipline IS 'La disciplina principale mostrata in elenchi rapidi.';
COMMENT ON COLUMN public.profiles.status IS 'Stato dell''account operatore (es. active, pending, suspended).';


-- 2. Aggiorna i profili operatore esistenti con valori di default sensati se sono null
-- Questo è utile per i dati pre-esistenti.
UPDATE public.profiles
SET
  main_discipline = (
    SELECT c.name
    FROM operator_categories oc
    JOIN categories c ON oc.category_id = c.id
    WHERE oc.operator_id = public.profiles.id
    LIMIT 1
  )
WHERE role = 'operator' AND main_discipline IS NULL;

UPDATE public.profiles
SET
  status = 'active'
WHERE role = 'operator' AND status = 'pending' AND is_available = true;


-- 3. Crea o rimpiazza la vista per semplificare le query di lettura degli operatori nell'admin panel.
-- Questa vista unisce i profili con gli utenti per ottenere l'email e altri dati.
CREATE OR REPLACE VIEW public.admin_operators_view AS
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
  public.profiles p
JOIN
  auth.users u ON p.id = u.id
WHERE
  p.role = 'operator';

COMMENT ON VIEW public.admin_operators_view IS 'Vista aggregata per recuperare facilmente tutti i dati degli operatori per il pannello di amministrazione.';

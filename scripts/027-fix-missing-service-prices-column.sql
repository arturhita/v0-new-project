-- Aggiunge la colonna service_prices alla tabella profiles se non esiste già.
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS service_prices jsonb;

-- Aggiorna la vista admin per includere la nuova colonna e garantire la coerenza.
CREATE OR REPLACE VIEW public.admin_operators_view AS
SELECT
    p.id,
    p.full_name,
    p.stage_name,
    p.email,
    p.role,
    p.status,
    p.is_available,
    p.profile_image_url,
    p.bio,
    p.phone,
    p.main_discipline,
    p.commission_rate,
    p.service_prices, -- Assicura che la colonna sia presente nella vista
    p.average_rating,
    p.review_count,
    p.created_at AS joined_at,
    (
        SELECT json_agg(c.name)
        FROM operator_categories oc
        JOIN categories c ON oc.category_id = c.id
        WHERE oc.operator_id = p.id
    ) AS categories
FROM
    profiles p
WHERE
    p.role = 'operator';

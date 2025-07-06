-- Rimuove la vista se esiste già per garantire una nuova creazione pulita
DROP VIEW IF EXISTS public.operators_view;

-- Crea la vista 'operators_view' per semplificare le query
-- Questa vista unisce i dati dalla tabella 'profiles' e 'operators'
CREATE VIEW public.operators_view AS
SELECT
    p.id AS profile_id,
    p.full_name,
    p.username,
    p.email,
    p.role,
    p.created_at,
    o.commission_rate,
    o.status,
    o.bio,
    o.main_discipline,
    o.specializations,
    o.joined_at
FROM
    public.profiles p
JOIN
    public.operators o ON p.id = o.profile_id
WHERE
    p.role = 'operator';

-- Assicura che la vista sia di proprietà del ruolo corretto
ALTER VIEW public.operators_view OWNER TO postgres;

-- Concede i permessi di SELECT sulla vista ai ruoli appropriati
-- 'anon' e 'authenticated' possono leggere i dati, RLS si occuperà della sicurezza a livello di riga se necessario
GRANT SELECT ON TABLE public.operators_view TO anon;
GRANT SELECT ON TABLE public.operators_view TO authenticated;

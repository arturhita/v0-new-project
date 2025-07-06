-- Assicura che la colonna status esista nella tabella profiles
DO $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='status') THEN
    ALTER TABLE public.profiles ADD COLUMN status TEXT NOT NULL DEFAULT 'active';
  END IF;
END $$;

-- Crea o rimpiazza la vista per gli utenti (clienti)
CREATE OR REPLACE VIEW public.admin_users_view AS
SELECT
    p.id,
    p.full_name,
    u.email,
    u.created_at AS joined_at,
    p.status
FROM
    public.profiles p
JOIN
    auth.users u ON p.id = u.id
WHERE
    p.role = 'client';

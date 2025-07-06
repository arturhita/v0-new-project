-- Questo script imposta il primo utente registrato come amministratore.
-- È un modo sicuro per garantire che ci sia sempre un admin sulla piattaforma.
-- NOTA: Se preferisci, puoi sostituire la subquery con il tuo ID utente specifico.
UPDATE public.profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1
);

-- Inseriamo anche un log per conferma
INSERT INTO public.logs (level, message, context)
VALUES ('info', 'Admin user role ensured for the first registered user.', '{"script": "017-ensure-admin-user.sql"}')
ON CONFLICT DO NOTHING;

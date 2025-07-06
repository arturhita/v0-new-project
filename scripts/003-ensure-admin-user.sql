-- Inserisce l'utente admin in auth.users se non esiste già
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES
(
  '00000000-0000-0000-0000-000000000000',
  'a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a0a0', -- UUID fittizio e statico per l'admin
  'authenticated',
  'authenticated',
  'admin@moonthir.com',
  '$2a$10$XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', -- Password non valida, da resettare
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Admin Moonthir", "role": "admin"}',
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Inserisce il profilo admin in public.profiles se non esiste già
INSERT INTO public.profiles (id, full_name, email, role)
VALUES
('a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a0a0', 'Admin Moonthir', 'admin@moonthir.com', 'admin')
ON CONFLICT (id) DO NOTHING;

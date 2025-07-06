-- =================================================================
-- SEED DATA SCRIPT
-- Descrizione: Inserisce dati di esempio per testare la piattaforma.
-- Eseguire DOPO lo script master dello schema.
-- =================================================================

-- Inserimento Categorie per Astromag
INSERT INTO public.categories (name, slug) VALUES
('Oroscopo', 'oroscopo'),
('Tarocchi', 'tarocchi'),
('Affinità di Coppia', 'affinita-di-coppia')
ON CONFLICT (slug) DO NOTHING;

-- Inserimento di un utente Amministratore
-- NOTA: Questo crea un utente direttamente. Dovrai impostare la sua password
-- dalla UI di Supabase (Authentication -> Users -> clicca sull'utente -> Reset password).
-- Email: admin@moonthir.com | Password: da impostare
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_token, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone, phone_confirmed_at, confirmation_token, confirmation_sent_at)
VALUES
(
  '00000000-0000-0000-0000-000000000000',
  'a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a0a0', -- UUID fittizio per l'admin
  'authenticated',
  'authenticated',
  'admin@moonthir.com',
  '$2a$10$XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', -- Password non valida, da resettare
  NOW(),
  '',
  NULL,
  NULL,
  '{"provider":"email","providers":["email"]}',
  '{"name":"Admin Moonthir"}',
  NOW(),
  NOW(),
  NULL,
  NULL,
  '',
  NULL
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, name, email, role)
VALUES
('a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a0a0', 'Admin Moonthir', 'admin@moonthir.com', 'admin')
ON CONFLICT (id) DO NOTHING;


-- Inserimento di due Operatori di esempio
-- Stessa nota sulla password: andrà resettata dalla UI di Supabase.
-- Operatore 1
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES
(
  '00000000-0000-0000-0000-000000000000',
  'b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1',
  'authenticated',
  'authenticated',
  'selene@example.com',
  '$2a$10$XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Selene Notturna"}',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, name, email, role, stage_name, bio, specializations, is_available, hourly_rate)
VALUES
('b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1', 'Selene Notturna', 'selene@example.com', 'operator', 'Selene', 'Interprete dei sogni e dei tarocchi, ti guido attraverso i simboli del tuo inconscio.', ARRAY['Interpretazione dei Sogni', 'Tarocchi'], true, 60.00)
ON CONFLICT (id) DO NOTHING;

-- Operatore 2
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES
(
  '00000000-0000-0000-0000-000000000000',
  'c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2',
  'authenticated',
  'authenticated',
  'orion@example.com',
  '$2a$10$XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Orion Stellare"}',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, name, email, role, stage_name, bio, specializations, is_available, hourly_rate)
VALUES
('c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2', 'Orion Stellare', 'orion@example.com', 'operator', 'Orion', 'Astrologo e numerologo, leggo il destino nei numeri e nelle stelle.', ARRAY['Astrologia', 'Numerologia'], true, 75.00)
ON CONFLICT (id) DO NOTHING;


-- Inserimento di un Articolo di esempio
INSERT INTO public.articles (title, content, author_id, category_id, slug)
SELECT
  'Le Stelle di Luglio: Previsioni per il Leone',
  'Questo mese, il Sole transita nel tuo segno, caro Leone...',
  (SELECT id FROM public.profiles WHERE email = 'orion@example.com'),
  (SELECT id FROM public.categories WHERE slug = 'oroscopo'),
  'le-stelle-di-luglio-previsioni-leone'
WHERE NOT EXISTS (
  SELECT 1 FROM public.articles WHERE slug = 'le-stelle-di-luglio-previsioni-leone'
);

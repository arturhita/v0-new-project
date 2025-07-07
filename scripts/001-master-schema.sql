-- ----------------------------
-- 1. Cleanup old objects
-- ----------------------------
-- Stop execution if any error occurs
\set ON_ERROR_STOP on

-- Drop policies, triggers, and functions
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."operators";
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON "public"."reviews";
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."reviews";
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."specializations";
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."operator_specializations";
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."operator_services";
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."operator_availability";
DROP POLICY IF EXISTS "Users can update their own profile" ON "public"."users";
DROP POLICY IF EXISTS "Users can insert their own profile" ON "public"."users";
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."users";
DROP POLICY IF EXISTS "Operators can update their own profile" ON "public"."operators";
DROP POLICY IF EXISTS "Authenticated users can insert reviews" ON "public"."reviews";
DROP POLICY IF EXISTS "Users can update their own reviews" ON "public"."reviews";
DROP POLICY IF EXISTS "Users can delete their own reviews" ON "public"."reviews";


DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user;

-- Drop tables in reverse order of dependency
DROP TABLE IF EXISTS public.reviews;
DROP TABLE IF EXISTS public.operator_availability;
DROP TABLE IF EXISTS public.operator_services;
DROP TABLE IF EXISTS public.operator_specializations;
DROP TABLE IF EXISTS public.specializations;
DROP TABLE IF EXISTS public.operators;
DROP TABLE IF EXISTS public.users;

-- Drop custom types
DROP TYPE IF EXISTS public.user_role;
DROP TYPE IF EXISTS public.operator_status;
DROP TYPE IF EXISTS public.service_type;
DROP TYPE IF EXISTS public.day_of_week;

-- ----------------------------
-- 2. Create custom types
-- ----------------------------
CREATE TYPE public.user_role AS ENUM ('client', 'operator', 'admin');
CREATE TYPE public.operator_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
CREATE TYPE public.service_type AS ENUM ('chat', 'call', 'video', 'email');
CREATE TYPE public.day_of_week AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');

-- ----------------------------
-- 3. Create tables
-- ----------------------------

-- Users table
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'client',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.users IS 'Stores public user profile information.';

-- Operators table
CREATE TABLE public.operators (
    id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    display_name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    status operator_status NOT NULL DEFAULT 'pending',
    is_online BOOLEAN NOT NULL DEFAULT false,
    profile_image_url TEXT,
    average_rating NUMERIC(3, 2) DEFAULT 0.00,
    reviews_count INT DEFAULT 0,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen TIMESTAMPTZ
);
COMMENT ON TABLE public.operators IS 'Stores operator-specific profile information.';

-- Specializations table
CREATE TABLE public.specializations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);
COMMENT ON TABLE public.specializations IS 'List of available specializations for operators.';

-- Operator Specializations join table
CREATE TABLE public.operator_specializations (
    operator_id UUID NOT NULL REFERENCES public.operators(id) ON DELETE CASCADE,
    specialization_id INT NOT NULL REFERENCES public.specializations(id) ON DELETE CASCADE,
    PRIMARY KEY (operator_id, specialization_id)
);
COMMENT ON TABLE public.operator_specializations IS 'Links operators to their specializations.';

-- Operator Services table
CREATE TABLE public.operator_services (
    id SERIAL PRIMARY KEY,
    operator_id UUID NOT NULL REFERENCES public.operators(id) ON DELETE CASCADE,
    service_type service_type NOT NULL,
    price_per_minute NUMERIC(10, 2),
    price_per_session NUMERIC(10, 2),
    is_active BOOLEAN NOT NULL DEFAULT true,
    UNIQUE(operator_id, service_type)
);
COMMENT ON TABLE public.operator_services IS 'Defines the services and pricing for each operator.';

-- Operator Availability table
CREATE TABLE public.operator_availability (
    id SERIAL PRIMARY KEY,
    operator_id UUID NOT NULL REFERENCES public.operators(id) ON DELETE CASCADE,
    day_of_week day_of_week NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT true,
    UNIQUE(operator_id, day_of_week, start_time, end_time)
);
COMMENT ON TABLE public.operator_availability IS 'Stores the weekly availability schedule for operators.';

-- Reviews table
CREATE TABLE public.reviews (
    id SERIAL PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    operator_id UUID NOT NULL REFERENCES public.operators(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.reviews IS 'Stores client reviews for operators.';

-- ----------------------------
-- 4. Create functions and triggers
-- ----------------------------

-- Function to create a public user profile when a new user signs up in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- Trigger to call the function on new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ----------------------------
-- 5. Set up Row Level Security (RLS)
-- ----------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specializations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operator_specializations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operator_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operator_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Enable read access for all users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable read access for all users" ON public.operators FOR SELECT USING (true);
CREATE POLICY "Operators can update their own profile" ON public.operators FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable read access for all users" ON public.specializations FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.operator_specializations FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.operator_services FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.operator_availability FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert reviews" ON public.reviews FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = client_id);
CREATE POLICY "Users can delete their own reviews" ON public.reviews FOR DELETE USING (auth.uid() = client_id);

-- ----------------------------
-- 6. Insert initial data
-- ----------------------------
INSERT INTO public.specializations (name, description) VALUES
('Cartomanzia', 'Lettura dei tarocchi e delle carte per svelare passato, presente e futuro.'),
('Astrologia', 'Studio degli astri e dei loro influssi sulla vita delle persone.'),
('Numerologia', 'Interpretazione del significato mistico dei numeri.'),
('Canalizzazione', 'Connessione con entità spirituali per ricevere messaggi e guida.'),
('Guarigione Energetica', 'Tecniche per riequilibrare i campi energetici del corpo.'),
('Rune', 'Antica forma di divinazione nordica basata su simboli.'),
('Sibille', 'Lettura delle carte Sibille per ottenere risposte chiare e dirette.'),
('Registri Akashici', 'Accesso alla memoria universale delle esperienze di ogni anima.')
ON CONFLICT (name) DO NOTHING;

-- ----------------------------
-- 7. Sync existing auth users (if any)
-- ----------------------------
INSERT INTO public.users (id, email, full_name, avatar_url)
SELECT id, email, raw_user_meta_data->>'full_name', raw_user_meta_data->>'avatar_url'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- ----------------------------
-- 8. Create test operators (optional)
-- ----------------------------
-- Before running this, make sure you have created two users in Supabase Auth
-- with emails: operator1@example.com and operator2@example.com

DO $$
DECLARE
    operator1_id UUID;
    operator2_id UUID;
    cartomanzia_id INT;
    astrologia_id INT;
BEGIN
    -- Get user IDs from auth.users
    SELECT id INTO operator1_id FROM auth.users WHERE email = 'operator1@example.com';
    SELECT id INTO operator2_id FROM auth.users WHERE email = 'operator2@example.com';

    -- Get specialization IDs
    SELECT id INTO cartomanzia_id FROM public.specializations WHERE name = 'Cartomanzia';
    SELECT id INTO astrologia_id FROM public.specializations WHERE name = 'Astrologia';

    -- Create Operator 1 if the user exists
    IF operator1_id IS NOT NULL THEN
        -- Update user role
        UPDATE public.users SET role = 'operator' WHERE id = operator1_id;
        -- Insert into operators table
        INSERT INTO public.operators (id, display_name, description, status, is_online, profile_image_url, average_rating, reviews_count, joined_at)
        VALUES (operator1_id, 'Luna Stellare', 'Esperta in letture di tarocchi con 15 anni di esperienza, ti guiderà con chiarezza.', 'approved', true, '/placeholder.svg?width=96&height=96', 4.9, 256, NOW() - INTERVAL '12 day')
        ON CONFLICT (id) DO NOTHING;
        -- Link specializations
        INSERT INTO public.operator_specializations (operator_id, specialization_id) VALUES (operator1_id, cartomanzia_id) ON CONFLICT DO NOTHING;
        -- Add services
        INSERT INTO public.operator_services (operator_id, service_type, price_per_minute) VALUES (operator1_id, 'chat', 2.50) ON CONFLICT DO NOTHING;
        INSERT INTO public.operator_services (operator_id, service_type, price_per_minute) VALUES (operator1_id, 'call', 2.50) ON CONFLICT DO NOTHING;
    END IF;

    -- Create Operator 2 if the user exists
    IF operator2_id IS NOT NULL THEN
        -- Update user role
        UPDATE public.users SET role = 'operator' WHERE id = operator2_id;
        -- Insert into operators table
        INSERT INTO public.operators (id, display_name, description, status, is_online, profile_image_url, average_rating, reviews_count, joined_at)
        VALUES (operator2_id, 'Maestro Cosmos', 'Astrologo professionista specializzato in carte natali e transiti planetari.', 'approved', true, '/placeholder.svg?width=96&height=96', 4.8, 189, NOW() - INTERVAL '60 day')
        ON CONFLICT (id) DO NOTHING;
        -- Link specializations
        INSERT INTO public.operator_specializations (operator_id, specialization_id) VALUES (operator2_id, astrologia_id) ON CONFLICT DO NOTHING;
        -- Add services
        INSERT INTO public.operator_services (operator_id, service_type, price_per_minute) VALUES (operator2_id, 'chat', 3.20) ON CONFLICT DO NOTHING;
        INSERT INTO public.operator_services (operator_id, service_type, price_per_minute) VALUES (operator2_id, 'call', 3.20) ON CONFLICT DO NOTHING;
        INSERT INTO public.operator_services (operator_id, service_type, price_per_session) VALUES (operator2_id, 'email', 35.00) ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- ----------------------------
-- Final message
-- ----------------------------
SELECT 'Database schema created and seeded successfully.' as "Status";

-- ============================================================================
-- MASTER RESET SCRIPT V1.0
-- OBIETTIVO: Cancellare tutto e ricostruire uno schema pulito e stabile.
-- ESEGUIRE QUESTO SCRIPT UNA SOLA VOLTA PER INIZIALIZZARE LA PIATTAFORMA.
-- ============================================================================

-- STEP 1: Rimuoviamo tutto in ordine per evitare errori di dipendenza.
-- Disabilitiamo la sicurezza a livello di riga temporaneamente per pulire
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Droppiamo trigger e funzioni esistenti
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Droppiamo tutte le tabelle usando CASCADE per gestire le dipendenze
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.operator_tax_details CASCADE;
DROP TABLE IF EXISTS public.operator_payout_settings CASCADE;
DROP TABLE IF EXISTS public.commission_requests CASCADE;
DROP TABLE IF EXISTS public.payouts CASCADE;
DROP TABLE IF EXISTS public.operator_earnings CASCADE;
DROP TABLE IF EXISTS public.wallet_transactions CASCADE;
DROP TABLE IF EXISTS public.wallets CASCADE;
DROP TABLE IF EXISTS public.stories CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.consultations CASCADE;
DROP TABLE IF EXISTS public.operator_applications CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;


-- STEP 2: Ricostruzione dello schema.

-- Tabella Categorie (per discipline)
CREATE TABLE public.categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    slug text NOT NULL UNIQUE,
    description text
);
COMMENT ON TABLE public.categories IS 'Stores operator disciplines like "Astrology", "Tarot", etc.';

-- Tabella Profili (Utenti)
CREATE TABLE public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text,
    email text UNIQUE,
    role text DEFAULT 'client'::text NOT NULL,
    status text DEFAULT 'active'::text, -- active, pending_approval, suspended
    is_online boolean DEFAULT false,
    is_available boolean DEFAULT false,
    stage_name text UNIQUE,
    headline text,
    bio text,
    profile_image_url text,
    main_discipline text,
    specialties text[],
    average_rating numeric(3,2) DEFAULT 0.00,
    review_count integer DEFAULT 0,
    chat_price_per_minute numeric(10,2) DEFAULT 1.00,
    call_price_per_minute numeric(10,2) DEFAULT 1.50,
    video_price_per_minute numeric(10,2) DEFAULT 2.00,
    commission_rate numeric(5,2) DEFAULT 20.00,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
COMMENT ON TABLE public.profiles IS 'Central table for user profile data, linked to auth.users.';

-- Tabella Recensioni
CREATE TABLE public.reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id uuid NOT NULL REFERENCES public.profiles(id),
    operator_id uuid NOT NULL REFERENCES public.profiles(id),
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment text,
    created_at timestamptz DEFAULT now(),
    client jsonb, -- Denormalized client data
    operator jsonb -- Denormalized operator data
);
COMMENT ON TABLE public.reviews IS 'Stores reviews from clients for operators.';


-- STEP 3: Funzioni e Trigger.

-- Funzione per creare un profilo quando un nuovo utente si registra in Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger che chiama la funzione alla creazione di un utente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- STEP 4: Abilitiamo la Row Level Security (RLS).
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies per la tabella Profili
CREATE POLICY "Users can view their own profile." ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Profiles are public for everyone to view." ON public.profiles
  FOR SELECT TO anon, authenticated USING (true);


-- STEP 5: Seed dei dati iniziali.

-- Inseriamo le categorie principali
INSERT INTO public.categories (name, slug, description) VALUES
('Cartomanzia', 'cartomanzia', 'Lettura e interpretazione dei tarocchi e altre carte.'),
('Astrologia', 'astrologia', 'Studio degli astri e del loro influsso sulla vita.'),
('Sensitivi', 'sensitivi', 'Percezioni extrasensoriali e connessioni spirituali.'),
('Rune', 'rune', 'Antica divinazione norrena attraverso le rune.'),
('Chiromanzia', 'chiromanzia', 'Lettura della mano per interpretare carattere e destino.')
ON CONFLICT (slug) DO NOTHING;

-- Creiamo un utente ADMIN (sostituire con dati reali se necessario)
-- NOTA: Questo utente deve essere creato prima tramite la UI di Supabase Auth.
-- Questo script aggiornerà il suo ruolo a 'admin'.
-- USARE L'EMAIL DI UN UTENTE GIÀ ESISTENTE IN AUTH.USERS
-- Esempio: admin@moonthir.com
UPDATE public.profiles
SET role = 'admin', full_name = 'Amministratore'
WHERE email = 'admin@moonthir.com'; -- <<< CAMBIARE QUESTA EMAIL

-- Creiamo un paio di operatori di esempio
-- NOTA: Anche questi utenti devono esistere in Supabase Auth.
-- Esempio: operator1@moonthir.com, operator2@moonthir.com
UPDATE public.profiles
SET
  role = 'operator',
  status = 'active',
  stage_name = 'Stella Luminosa',
  headline = 'Guida astrologica per la tua anima',
  bio = 'Con oltre 15 anni di esperienza, interpreto le stelle per illuminare il tuo cammino. Specializzata in temi natali e sinastrie di coppia.',
  main_discipline = 'Astrologia',
  specialties = ARRAY['Tema Natale', 'Transiti Planetari', 'Astrologia Karmica'],
  average_rating = 4.9,
  review_count = 124,
  is_online = true,
  is_available = true
WHERE email = 'operator1@moonthir.com'; -- <<< CAMBIARE QUESTA EMAIL

UPDATE public.profiles
SET
  role = 'operator',
  status = 'active',
  stage_name = 'Arcano Svelato',
  headline = 'I Tarocchi rispondono alle tue domande',
  bio = 'Attraverso la saggezza degli Arcani, ti aiuto a fare chiarezza su amore, lavoro e futuro. Letture intuitive e profonde.',
  main_discipline = 'Cartomanzia',
  specialties = ARRAY['Tarocchi di Marsiglia', 'Sibille', 'Carte degli Angeli'],
  average_rating = 4.8,
  review_count = 98,
  is_online = false,
  is_available = false
WHERE email = 'operator2@moonthir.com'; -- <<< CAMBIARE QUESTA EMAIL

-- Inseriamo una recensione di esempio
-- Assicurarsi che gli UUID corrispondano a un cliente e un operatore esistenti
-- (Questo è più complesso da fare in uno script di seed, ma è un esempio)
-- INSERT INTO public.reviews (client_id, operator_id, rating, comment)
-- VALUES
-- ('uuid-del-cliente', 'uuid-di-stella-luminosa', 5, 'Una lettura incredibilmente accurata e illuminante. Stella è bravissima!');

-- ============================================================================
-- FINE DELLO SCRIPT
-- ============================================================================

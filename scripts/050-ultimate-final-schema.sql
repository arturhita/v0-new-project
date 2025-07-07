-- Questo script è la versione definitiva e corretta.
-- Risolve gli errori di dipendenza e consolida l'intero schema.

-- STEP 1: Drop di tutti gli oggetti dipendenti nell'ordine corretto per evitare errori.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS check_client_message_limit_trigger ON public.messages;

DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.check_client_message_limit();
DROP FUNCTION IF EXISTS public.get_operator_dashboard_data(uuid);
DROP FUNCTION IF EXISTS public.get_operator_earnings_summary(uuid);

DROP VIEW IF EXISTS public.all_users_view;

-- STEP 2: Drop di tutte le tabelle. CASCADE gestisce le dipendenze rimanenti.
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


-- STEP 3: Ricreazione dello schema completo con una struttura pulita.

-- Tabella Profili (Utenti)
CREATE TABLE public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text,
    email text UNIQUE,
    role text DEFAULT 'client'::text NOT NULL,
    is_online boolean DEFAULT false,
    is_available boolean DEFAULT false,
    stage_name text,
    bio text,
    headline text,
    profile_image_url text,
    main_discipline text,
    specialties text[],
    chat_price_per_minute numeric(10,2) DEFAULT 1.00,
    call_price_per_minute numeric(10,2) DEFAULT 1.50,
    video_price_per_minute numeric(10,2) DEFAULT 2.00,
    commission_rate numeric(5,2) DEFAULT 20.00,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
COMMENT ON TABLE public.profiles IS 'Central table for user profile data, linked to auth.users.';

-- Tabella Candidature Operatori
CREATE TABLE public.operator_applications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text NOT NULL,
    email text NOT NULL,
    phone_number text,
    bio text,
    disciplines text[],
    experience text,
    status text DEFAULT 'pending'::text, -- pending, approved, rejected
    admin_notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Tabella Consulti
CREATE TABLE public.consultations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id uuid NOT NULL REFERENCES public.profiles(id),
    operator_id uuid NOT NULL REFERENCES public.profiles(id),
    type text NOT NULL, -- 'chat', 'call', 'video'
    status text NOT NULL, -- 'scheduled', 'ongoing', 'completed', 'cancelled'
    start_time timestamptz,
    end_time timestamptz,
    duration_minutes integer,
    price_per_minute numeric(10,2),
    total_cost numeric(10,2),
    created_at timestamptz DEFAULT now()
);

-- Tabella Messaggi
CREATE TABLE public.messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id uuid NOT NULL REFERENCES public.profiles(id),
    receiver_id uuid NOT NULL REFERENCES public.profiles(id),
    content text NOT NULL,
    created_at timestamptz DEFAULT now(),
    is_read boolean DEFAULT false,
    consultation_id uuid REFERENCES public.consultations(id)
);

-- Tabella Recensioni
CREATE TABLE public.reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id uuid NOT NULL REFERENCES public.consultations(id),
    client_id uuid NOT NULL REFERENCES public.profiles(id),
    operator_id uuid NOT NULL REFERENCES public.profiles(id),
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment text,
    created_at timestamptz DEFAULT now(),
    is_moderated boolean DEFAULT false,
    is_visible boolean DEFAULT true
);

-- Tabella Stories
CREATE TABLE public.stories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id uuid NOT NULL REFERENCES public.profiles(id),
    media_url text NOT NULL,
    media_type text NOT NULL, -- 'image' or 'video'
    expires_at timestamptz NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Tabelle Finanziarie
CREATE TABLE public.wallets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) UNIQUE,
    balance numeric(10, 2) DEFAULT 0.00,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.wallet_transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id uuid NOT NULL REFERENCES public.wallets(id),
    amount numeric(10, 2) NOT NULL,
    type text NOT NULL, -- 'deposit', 'withdrawal', 'payment', 'refund'
    description text,
    related_consultation_id uuid REFERENCES public.consultations(id),
    created_at timestamptz DEFAULT now()
);

CREATE TABLE public.operator_earnings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id uuid NOT NULL REFERENCES public.profiles(id),
    consultation_id uuid NOT NULL REFERENCES public.consultations(id),
    amount numeric(10, 2) NOT NULL,
    commission_rate numeric(5, 2) NOT NULL,
    net_earning numeric(10, 2) NOT NULL,
    payout_id uuid,
    status text DEFAULT 'unpaid'::text, -- unpaid, paid
    created_at timestamptz DEFAULT now()
);

CREATE TABLE public.payouts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id uuid NOT NULL REFERENCES public.profiles(id),
    amount numeric(10, 2) NOT NULL,
    status text NOT NULL, -- 'requested', 'processing', 'completed', 'failed'
    requested_at timestamptz DEFAULT now(),
    completed_at timestamptz,
    transaction_details jsonb
);

CREATE TABLE public.commission_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id uuid NOT NULL REFERENCES public.profiles(id),
    current_commission_rate numeric(5,2) NOT NULL,
    requested_commission_rate numeric(5,2) NOT NULL,
    reason text,
    status text DEFAULT 'pending'::text, -- pending, approved, rejected
    admin_notes text,
    created_at timestamptz DEFAULT now(),
    resolved_at timestamptz
);

CREATE TABLE public.operator_tax_details (
    id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_name text,
    vat_number text,
    tax_id text,
    address text,
    city text,
    zip_code text,
    country text,
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.operator_payout_settings (
    id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    payout_method text DEFAULT 'paypal'::text,
    paypal_email text,
    bank_account_holder text,
    iban text,
    swift_bic text,
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.invoices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id uuid NOT NULL REFERENCES public.profiles(id),
    payout_id uuid REFERENCES public.payouts(id),
    invoice_number text NOT NULL UNIQUE,
    issue_date date NOT NULL,
    amount numeric(10, 2) NOT NULL,
    status text NOT NULL, -- 'draft', 'sent', 'paid'
    pdf_url text,
    created_at timestamptz DEFAULT now()
);

-- STEP 4: Ricreazione di Funzioni e Trigger.

-- Funzione per gestire la creazione del profilo e del wallet per un nuovo utente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserisce il profilo base
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'full_name', 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')::text
  );
  
  -- Inserisce il wallet per il nuovo utente
  INSERT INTO public.wallets (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger per la funzione handle_new_user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Funzione per il limite dei messaggi
CREATE OR REPLACE FUNCTION public.check_client_message_limit()
RETURNS TRIGGER AS $$
DECLARE
  message_count INTEGER;
  sender_role TEXT;
BEGIN
  SELECT role INTO sender_role FROM public.profiles WHERE id = NEW.sender_id;

  IF sender_role = 'client' AND NEW.consultation_id IS NULL THEN
    SELECT count(*) INTO message_count
    FROM public.messages
    WHERE consultation_id IS NULL
      AND ((sender_id = NEW.sender_id AND receiver_id = NEW.receiver_id) OR (sender_id = NEW.receiver_id AND receiver_id = NEW.sender_id));

    IF message_count >= 5 THEN
      RAISE EXCEPTION 'Limite di 5 messaggi gratuiti raggiunto. Per continuare, avvia un consulto a pagamento.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger per il limite dei messaggi
CREATE TRIGGER check_client_message_limit_trigger
  BEFORE INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.check_client_message_limit();

-- Funzione per la dashboard operatore
CREATE OR REPLACE FUNCTION public.get_operator_dashboard_data(p_operator_id uuid)
RETURNS TABLE(monthly_earnings numeric, consultations_count bigint, unread_messages_count bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COALESCE(SUM(oe.net_earning), 0)
     FROM public.operator_earnings oe
     WHERE oe.operator_id = p_operator_id
       AND oe.created_at >= date_trunc('month', now())
    ) AS monthly_earnings,
    (SELECT COUNT(*)
     FROM public.consultations c
     WHERE c.operator_id = p_operator_id
       AND c.status = 'completed'
       AND c.start_time >= date_trunc('month', now())
    ) AS consultations_count,
    (SELECT COUNT(*)
     FROM public.messages m
     WHERE m.receiver_id = p_operator_id
       AND m.is_read = false
    ) AS unread_messages_count;
END;
$$ LANGUAGE plpgsql;

-- Funzione per il riepilogo guadagni
CREATE OR REPLACE FUNCTION public.get_operator_earnings_summary(p_operator_id uuid)
RETURNS TABLE(total_earnings numeric, pending_payout numeric, last_payout_amount numeric, last_payout_date timestamptz) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COALESCE(SUM(net_earning), 0) FROM public.operator_earnings WHERE operator_id = p_operator_id) AS total_earnings,
    (SELECT COALESCE(SUM(net_earning), 0) FROM public.operator_earnings WHERE operator_id = p_operator_id AND status = 'unpaid') AS pending_payout,
    (SELECT amount FROM public.payouts WHERE operator_id = p_operator_id AND status = 'completed' ORDER BY completed_at DESC LIMIT 1) AS last_payout_amount,
    (SELECT completed_at FROM public.payouts WHERE operator_id = p_operator_id AND status = 'completed' ORDER BY completed_at DESC LIMIT 1) AS last_payout_date;
END;
$$ LANGUAGE plpgsql;

-- =================================================================
-- Script di Ricostruzione Sicuro e Non Distruttivo
-- Versione: 1.0
-- Obiettivo: Garantire che lo schema del DB sia completo e corretto
--            senza eliminare alcun dato esistente.
-- =================================================================

-- Estensioni necessarie (se non già presenti)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "unaccent" WITH SCHEMA public;

-- =================================================================
-- TABELLE PRINCIPALI
-- Utilizzo di "IF NOT EXISTS" per prevenire errori e perdite di dati
-- =================================================================

-- Tabella per le impostazioni aziendali
CREATE TABLE IF NOT EXISTS public.company_settings (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name text,
    vat_number text,
    address text,
    email text,
    phone text,
    updated_at timestamptz DEFAULT now()
);

-- Tabella per le promozioni e i codici sconto
CREATE TABLE IF NOT EXISTS public.promotions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    code text NOT NULL UNIQUE,
    description text,
    discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
    value numeric NOT NULL,
    start_date timestamptz NOT NULL,
    end_date timestamptz,
    usage_limit integer,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- Tabella per gli articoli del blog (Astromag)
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    title text NOT NULL,
    slug text NOT NULL UNIQUE,
    content jsonb, -- Per supportare editor complessi come Editor.js
    excerpt text,
    cover_image_url text,
    author_id uuid REFERENCES public.profiles(id),
    category text,
    tags text[],
    status text NOT NULL CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
    published_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Tabella per i ticket di supporto
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES public.profiles(id),
    subject text NOT NULL,
    description text NOT NULL,
    status text NOT NULL CHECK (status IN ('open', 'in_progress', 'closed')) DEFAULT 'open',
    priority text CHECK (priority IN ('low', 'medium', 'high')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Tabella per i messaggi all'interno di un ticket
CREATE TABLE IF NOT EXISTS public.ticket_messages (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    sender_id uuid NOT NULL REFERENCES public.profiles(id),
    message text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Tabella per le fatture
CREATE TABLE IF NOT EXISTS public.invoices (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES public.profiles(id),
    operator_id uuid REFERENCES public.profiles(id),
    invoice_number text NOT NULL UNIQUE,
    amount numeric NOT NULL,
    issue_date date NOT NULL,
    due_date date,
    status text NOT NULL CHECK (status IN ('paid', 'unpaid', 'overdue')),
    pdf_url text,
    created_at timestamptz DEFAULT now()
);

-- Tabella per le richieste di commissione
CREATE TABLE IF NOT EXISTS public.commission_requests (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    operator_id uuid NOT NULL REFERENCES public.profiles(id),
    requested_rate numeric NOT NULL,
    reason text,
    status text NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    reviewed_by uuid REFERENCES public.profiles(id), -- Admin che ha revisionato
    reviewed_at timestamptz,
    created_at timestamptz DEFAULT now()
);

-- Tabella per le richieste di pagamento (payout)
CREATE TABLE IF NOT EXISTS public.payout_requests (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    operator_id uuid NOT NULL REFERENCES public.profiles(id),
    amount numeric NOT NULL,
    status text NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
    payment_details jsonb, -- Dettagli come IBAN, etc.
    processed_by uuid REFERENCES public.profiles(id),
    processed_at timestamptz,
    created_at timestamptz DEFAULT now()
);

-- =================================================================
-- MODIFICHE SICURE ALLA TABELLA PROFILES
-- Aggiunge colonne solo se non esistono già
-- =================================================================

-- Funzione helper per aggiungere una colonna se non esiste
CREATE OR REPLACE FUNCTION add_column_if_not_exists(table_name text, column_name text, column_type text)
RETURNS void AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = table_name
        AND column_name = column_name
    ) THEN
        EXECUTE 'ALTER TABLE public.' || quote_ident(table_name) || ' ADD COLUMN ' || quote_ident(column_name) || ' ' || column_type;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Aggiunta colonne a 'profiles'
SELECT add_column_if_not_exists('profiles', 'full_name', 'text');
SELECT add_column_if_not_exists('profiles', 'stage_name', 'text');
SELECT add_column_if_not_exists('profiles', 'phone', 'text');
SELECT add_column_if_not_exists('profiles', 'bio', 'text');
SELECT add_column_if_not_exists('profiles', 'status', 'text CHECK (status IN (''Attivo'', ''In Attesa'', ''Sospeso''))');
SELECT add_column_if_not_exists('profiles', 'is_online', 'boolean DEFAULT false');
SELECT add_column_if_not_exists('profiles', 'commission_rate', 'numeric');
SELECT add_column_if_not_exists('profiles', 'specialties', 'text[]');
SELECT add_column_if_not_exists('profiles', 'categories', 'text[]');
SELECT add_column_if_not_exists('profiles', 'availability', 'jsonb');
SELECT add_column_if_not_exists('profiles', 'services', 'jsonb');
SELECT add_column_if_not_exists('profiles', 'average_rating', 'numeric');
SELECT add_column_if_not_exists('profiles', 'reviews_count', 'integer');
SELECT add_column_if_not_exists('profiles', 'balance', 'numeric DEFAULT 0.0');

-- =================================================================
-- FUNZIONI E TRIGGER
-- Utilizzo di "CREATE OR REPLACE" per aggiornamenti sicuri
-- =================================================================

-- Funzione per la ricerca full-text senza accenti
CREATE OR REPLACE FUNCTION public.f_unaccent(text)
RETURNS text AS $$
SELECT unaccent('public.unaccent', $1)
$$ LANGUAGE sql IMMUTABLE;

-- Funzione per approvare una candidatura di un operatore
CREATE OR REPLACE FUNCTION public.approve_operator(p_application_id uuid)
RETURNS void AS $$
DECLARE
    v_user_id uuid;
    v_email text;
    v_full_name text;
BEGIN
    -- 1. Aggiorna lo stato della candidatura
    UPDATE public.operator_applications
    SET status = 'approved'
    WHERE id = p_application_id
    RETURNING user_id, email, full_name INTO v_user_id, v_email, v_full_name;

    -- 2. Se l'utente esiste, aggiorna il suo ruolo e stato
    IF v_user_id IS NOT NULL THEN
        UPDATE public.profiles
        SET
            role = 'operator',
            status = 'Attivo',
            full_name = v_full_name
        WHERE id = v_user_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =================================================================
-- RIPRISTINO DATI CRITICI (DA ESEGUIRE CON CAUTELA)
-- Questa sezione riattiva tutti gli operatori esistenti.
-- =================================================================

-- Riporta tutti i profili con ruolo 'operator' allo stato 'Attivo'
-- Questo dovrebbe far riapparire gli operatori che sono diventati invisibili.
UPDATE public.profiles
SET status = 'Attivo'
WHERE role = 'operator' AND (status IS NULL OR status != 'Attivo');

-- Inserisce un record di default per le impostazioni aziendali se non esiste
INSERT INTO public.company_settings (id, company_name)
SELECT '00000000-0000-0000-0000-000000000001', 'La Tua Azienda'
WHERE NOT EXISTS (SELECT 1 FROM public.company_settings);


-- Fine dello script

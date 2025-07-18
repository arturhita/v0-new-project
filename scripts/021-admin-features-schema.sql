-- Abilita l'estensione se non già presente
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabella per le Impostazioni della Piattaforma
CREATE TABLE IF NOT EXISTS platform_settings (
    id TEXT PRIMARY KEY DEFAULT 'singleton',
    settings JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Inseriamo le impostazioni di default se non esistono
-- Questo comando viene eseguito solo la prima volta e non sovrascrive i dati esistenti.
INSERT INTO platform_settings (id, settings)
VALUES ('singleton', '{
    "call_deductions": {
        "enabled": true,
        "user_fixed_deduction": 0.5,
        "operator_fixed_deduction": 0.3
    },
    "payment_processing": {
        "operator_fixed_fee": 0.25,
        "enabled": true
    },
    "operator_deductions": {
        "enabled": true,
        "fixed_deduction": 1.0
    }
}')
ON CONFLICT (id) DO NOTHING;


-- 2. Tabella per le Richieste di Modifica Commissione
CREATE TABLE IF NOT EXISTS commission_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    current_commission NUMERIC(5, 2) NOT NULL,
    requested_commission NUMERIC(5, 2) NOT NULL,
    justification TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
    created_at TIMESTAMPTZ DEFAULT now(),
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES auth.users(id)
);

-- Aggiungiamo indici per velocizzare le query
CREATE INDEX IF NOT EXISTS idx_commission_requests_status ON commission_requests(status);
CREATE INDEX IF NOT EXISTS idx_commission_requests_operator_id ON commission_requests(operator_id);


-- 3. Tabella per i Post del Blog
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT,
    excerpt TEXT,
    category TEXT,
    tags TEXT[],
    status TEXT NOT NULL DEFAULT 'draft', -- draft, published, scheduled
    featured_image_url TEXT,
    author_id UUID REFERENCES auth.users(id),
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    seo_title TEXT,
    seo_description TEXT,
    read_time_minutes INT,
    views INT DEFAULT 0,
    likes INT DEFAULT 0,
    comments_count INT DEFAULT 0
);

-- Indici per il blog
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);


-- 4. Tabella per le Fatture
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operator_id UUID NOT NULL REFERENCES auth.users(id),
    invoice_number TEXT NOT NULL UNIQUE,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft', -- draft, sent, paid, overdue, void
    total_amount NUMERIC(10, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'EUR',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Tabella per le Voci di Fattura
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    item_type TEXT NOT NULL, -- consultation, commission, deduction, fee, bonus
    quantity NUMERIC(10, 2),
    unit_price NUMERIC(10, 2),
    total_amount NUMERIC(10, 2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_invoices_operator_id ON invoices(operator_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);


-- 6. Aggiungiamo la colonna per la commissione al profilo operatore se non esiste
-- La commissione qui è la PERCENTUALE che l'operatore GUADAGNA (es. 70.00 per 70%)
ALTER TABLE operator_profiles
ADD COLUMN IF NOT EXISTS commission_rate NUMERIC(5, 2) DEFAULT 70.00;

-- Aggiungiamo la colonna per le info di pagamento (es. IBAN, Stripe Connect ID)
ALTER TABLE operator_profiles
ADD COLUMN IF NOT EXISTS payout_info JSONB;

-- Funzione per aggiornare `updated_at` in automatico
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Applichiamo il trigger alla tabella dei post
DROP TRIGGER IF EXISTS set_timestamp ON posts;
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON posts
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Applichiamo il trigger alla tabella delle fatture
DROP TRIGGER IF EXISTS set_timestamp ON invoices;
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON invoices
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

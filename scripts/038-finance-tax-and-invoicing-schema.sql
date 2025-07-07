-- Abilita l'estensione per la crittografia se non già fatto
CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";

-- Tabella per i dati fiscali degli operatori (visibile solo agli admin)
CREATE TABLE
  public.operator_tax_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    operator_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
    tax_id TEXT, -- Codice Fiscale
    vat_id TEXT, -- Partita IVA
    company_name TEXT, -- Ragione Sociale (se azienda)
    full_address TEXT, -- Indirizzo completo
    pec_email TEXT, -- Email PEC
    sdi_code TEXT, -- Codice SDI
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

-- Policy di sicurezza per i dati fiscali
ALTER TABLE public.operator_tax_details ENABLE ROW LEVEL SECURITY;

-- L'operatore può inserire i propri dati
CREATE POLICY "Operators can insert their own tax details" ON public.operator_tax_details FOR INSERT
WITH
  CHECK (auth.uid () = operator_id);

-- L'operatore può aggiornare i propri dati
CREATE POLICY "Operators can update their own tax details" ON public.operator_tax_details FOR UPDATE
USING
  (auth.uid () = operator_id);

-- NESSUNO può leggere i dati, tranne tramite accessi con service_role (dal backend/admin)
CREATE POLICY "Tax details are private" ON public.operator_tax_details FOR
SELECT
  USING (FALSE);

-- Tabella per le fatture emesse DALLA piattaforma AGLI operatori (per commissioni)
CREATE TABLE
  public.platform_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    operator_id UUID NOT NULL REFERENCES public.profiles (id),
    invoice_number TEXT NOT NULL UNIQUE,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    tax_amount NUMERIC(10, 2) NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'unpaid', -- unpaid, paid, void
    description TEXT,
    pdf_url TEXT, -- Link al PDF della fattura
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

-- Policy per le fatture della piattaforma
ALTER TABLE public.platform_invoices ENABLE ROW LEVEL SECURITY;

-- L'operatore può vedere solo le proprie fatture
CREATE POLICY "Operators can view their own invoices" ON public.platform_invoices FOR
SELECT
  USING (auth.uid () = operator_id);

-- Solo gli admin (tramite service_role) possono creare/gestire le fatture

-- Aggiungiamo una colonna per la motivazione del rifiuto nella richiesta di commissione
ALTER TABLE public.commission_requests
ADD COLUMN rejection_reason TEXT;

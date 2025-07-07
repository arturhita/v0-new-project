-- Tabella per i dati fiscali degli operatori (visibile solo agli admin)
CREATE TABLE
  public.operator_tax_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    operator_id UUID NOT NULL UNIQUE REFERENCES public.profiles (id) ON DELETE CASCADE,
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

-- L'operatore può inserire e aggiornare i propri dati
CREATE POLICY "Operators can manage their own tax details" ON public.operator_tax_details FOR ALL
USING (auth.uid () = operator_id)
WITH CHECK (auth.uid () = operator_id);

-- Per sicurezza, neghiamo esplicitamente l'accesso in lettura a tutti gli altri.
-- L'admin, usando la service_role_key, bypasserà questa policy.
CREATE POLICY "Tax details are private and not readable by others" ON public.operator_tax_details FOR
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

-- Aggiungiamo una colonna per la motivazione del rifiuto nella richiesta di commissione, se non esiste già
ALTER TABLE public.commission_requests
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

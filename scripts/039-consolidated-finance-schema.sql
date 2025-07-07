-- Questo script consolida la creazione delle tabelle finanziarie e di servizio
-- per garantire il corretto ordine di dipendenza.

-- 1. Tabella per i servizi offerti dagli operatori
CREATE TABLE IF NOT EXISTS public.operator_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    service_name TEXT NOT NULL,
    description TEXT,
    price_per_minute NUMERIC(10, 2),
    price_for_session NUMERIC(10, 2),
    session_duration_minutes INT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.operator_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Operators can manage their own services" ON public.operator_services FOR ALL
    USING (auth.uid() = operator_id)
    WITH CHECK (auth.uid() = operator_id);
CREATE POLICY "Services are visible to everyone" ON public.operator_services FOR SELECT
    USING (true);


-- 2. Tabella per le richieste di modifica commissione
CREATE TABLE IF NOT EXISTS public.commission_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    current_commission_rate NUMERIC(5, 2) NOT NULL,
    requested_commission_rate NUMERIC(5, 2) NOT NULL,
    reason TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
    admin_notes TEXT,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.commission_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Operators can manage their own commission requests" ON public.commission_requests FOR ALL
    USING (auth.uid() = operator_id)
    WITH CHECK (auth.uid() = operator_id);


-- 3. Tabella per i dati fiscali (corretta)
CREATE TABLE IF NOT EXISTS public.operator_tax_details (
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
ALTER TABLE public.operator_tax_details ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Operators can manage their own tax details" ON public.operator_tax_details FOR ALL
    USING (auth.uid () = operator_id)
    WITH CHECK (auth.uid () = operator_id);
CREATE POLICY "Tax details are private" ON public.operator_tax_details FOR SELECT
    USING (FALSE); -- Solo admin con service_role può leggere


-- 4. Tabella per le fatture (corretta)
CREATE TABLE IF NOT EXISTS public.platform_invoices (
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
    pdf_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.platform_invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Operators can view their own invoices" ON public.platform_invoices FOR SELECT
    USING (auth.uid () = operator_id);

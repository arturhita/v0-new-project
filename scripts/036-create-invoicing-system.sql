-- Abilita l'estensione per generare UUID se non già abilitata
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tipi ENUM per garantire la coerenza dei dati
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');
CREATE TYPE invoice_item_type AS ENUM ('consultation', 'commission', 'deduction', 'fee', 'bonus', 'other');

-- Tabella principale per le fatture
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    invoice_number TEXT NOT NULL UNIQUE,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    status invoice_status NOT NULL DEFAULT 'draft',
    total_amount NUMERIC(10, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabella per le singole voci di una fattura
CREATE TABLE IF NOT EXISTS public.invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    item_type invoice_item_type NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price NUMERIC(10, 2) NOT NULL,
    total NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indici per migliorare le performance delle query
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON public.invoice_items(invoice_id);

-- Funzione per aggiornare 'updated_at' automaticamente
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger per la tabella invoices
DROP TRIGGER IF EXISTS set_timestamp ON public.invoices;
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();


-- Sicurezza a livello di riga (RLS)
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- Policy per la tabella invoices
DROP POLICY IF EXISTS "Admins can manage all invoices." ON public.invoices;
CREATE POLICY "Admins can manage all invoices."
ON public.invoices FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Operators can view their own invoices." ON public.invoices;
CREATE POLICY "Operators can view their own invoices."
ON public.invoices FOR SELECT
USING (auth.uid() = user_id);

-- Policy per la tabella invoice_items
DROP POLICY IF EXISTS "Admins can manage all invoice items." ON public.invoice_items;
CREATE POLICY "Admins can manage all invoice items."
ON public.invoice_items FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Operators can view their own invoice items." ON public.invoice_items;
CREATE POLICY "Operators can view their own invoice items."
ON public.invoice_items FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.invoices
    WHERE invoices.id = invoice_items.invoice_id AND invoices.user_id = auth.uid()
));

COMMENT ON TABLE public.invoices IS 'Stores invoice data for operators.';
COMMENT ON TABLE public.invoice_items IS 'Stores individual line items for each invoice.';

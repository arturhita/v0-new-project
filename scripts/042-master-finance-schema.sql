-- Drop dependent views and functions first to avoid errors on re-run
DROP VIEW IF EXISTS public.payout_requests_view;
DROP VIEW IF EXISTS public.commission_requests_view;
DROP FUNCTION IF EXISTS public.get_operator_earnings_details(uuid);
DROP FUNCTION IF EXISTS public.get_operator_dashboard_data(uuid);

-- Drop tables in reverse order of creation to respect foreign keys
DROP TABLE IF EXISTS public.earnings;
DROP TABLE IF EXISTS public.payout_requests;
DROP TABLE IF EXISTS public.operator_payout_methods;
DROP TABLE IF EXISTS public.commission_requests;
DROP TABLE IF EXISTS public.operator_tax_details;
DROP TABLE IF EXISTS public.invoices;


-- 1. Commission Requests Table
CREATE TABLE public.commission_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    current_commission_rate numeric(5, 2) NOT NULL,
    requested_commission_rate numeric(5, 2) NOT NULL,
    reason text,
    status text NOT NULL DEFAULT 'pending'::text, -- pending, approved, rejected
    rejection_reason text,
    admin_notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public.commission_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can manage commission requests" ON public.commission_requests FOR ALL USING (is_admin());
CREATE POLICY "Operators can view their own requests" ON public.commission_requests FOR SELECT USING (auth.uid() = operator_id);
CREATE POLICY "Operators can insert their own requests" ON public.commission_requests FOR INSERT WITH CHECK (auth.uid() = operator_id);


-- 2. Operator Payout Methods Table
CREATE TABLE public.operator_payout_methods (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    method_type text NOT NULL, -- 'bank_account', 'paypal', etc.
    details jsonb NOT NULL, -- e.g., { "iban": "...", "account_holder": "..." } or { "email": "..." }
    is_primary boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public.operator_payout_methods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Operators can manage their own payout methods" ON public.operator_payout_methods FOR ALL USING (auth.uid() = operator_id);
CREATE POLICY "Admin can view payout methods" ON public.operator_payout_methods FOR SELECT USING (is_admin());


-- 3. Payout Requests Table
CREATE TABLE public.payout_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount numeric(10, 2) NOT NULL,
    status text NOT NULL DEFAULT 'pending'::text, -- pending, processing, completed, rejected
    payout_method_id uuid NOT NULL REFERENCES public.operator_payout_methods(id),
    requested_at timestamp with time zone DEFAULT now() NOT NULL,
    processed_at timestamp with time zone,
    admin_processor_id uuid REFERENCES public.profiles(id),
    transaction_id text, -- ID from payment processor
    notes text
);
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can manage payout requests" ON public.payout_requests FOR ALL USING (is_admin());
CREATE POLICY "Operators can view their own payout requests" ON public.payout_requests FOR SELECT USING (auth.uid() = operator_id);
CREATE POLICY "Operators can insert their own payout requests" ON public.payout_requests FOR INSERT WITH CHECK (auth.uid() = operator_id);


-- 4. Earnings Table
CREATE TABLE public.earnings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id uuid NOT NULL REFERENCES public.consultations(id),
    operator_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    client_id uuid NOT NULL REFERENCES public.profiles(id),
    total_charged numeric(10, 2) NOT NULL,
    commission_rate numeric(5, 2) NOT NULL,
    net_earning numeric(10, 2) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public.earnings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can view all earnings" ON public.earnings FOR SELECT USING (is_admin());
CREATE POLICY "Operators can view their own earnings" ON public.earnings FOR SELECT USING (auth.uid() = operator_id);


-- 5. Operator Tax Details Table
CREATE TABLE public.operator_tax_details (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    tax_id text,
    vat_number text,
    company_name text,
    address text,
    city text,
    zip_code text,
    country text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public.operator_tax_details ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can view tax details" ON public.operator_tax_details FOR SELECT USING (is_admin());
CREATE POLICY "Operators can manage their own tax details" ON public.operator_tax_details FOR ALL USING (auth.uid() = operator_id);


-- 6. Invoices Table
CREATE TABLE public.invoices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    payout_request_id uuid UNIQUE REFERENCES public.payout_requests(id),
    operator_id uuid NOT NULL REFERENCES public.profiles(id),
    invoice_number text NOT NULL UNIQUE,
    issue_date date NOT NULL,
    due_date date,
    amount numeric(10, 2) NOT NULL,
    status text NOT NULL, -- 'draft', 'sent', 'paid'
    invoice_data jsonb, -- Contains all details for the invoice PDF
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can manage invoices" ON public.invoices FOR ALL USING (is_admin());
CREATE POLICY "Operators can view their own invoices" ON public.invoices FOR SELECT USING (auth.uid() = operator_id);


-- 7. Views (created after tables)
CREATE OR REPLACE VIEW public.commission_requests_view AS
SELECT
    cr.id,
    cr.operator_id,
    p.full_name AS operator_name,
    p.email AS operator_email,
    cr.current_commission_rate,
    cr.requested_commission_rate,
    cr.reason,
    cr.status,
    cr.rejection_reason,
    cr.admin_notes,
    cr.created_at,
    cr.updated_at
FROM
    public.commission_requests cr
JOIN
    public.profiles p ON cr.operator_id = p.id;

CREATE OR REPLACE VIEW public.payout_requests_view AS
SELECT
    pr.id,
    pr.operator_id,
    p.full_name AS operator_name,
    p.email AS operator_email,
    pr.amount,
    pr.status,
    pr.payout_method_id,
    opm.method_type,
    opm.details AS payout_details,
    pr.requested_at,
    pr.processed_at,
    pr.admin_processor_id
FROM
    public.payout_requests pr
JOIN
    public.profiles p ON pr.operator_id = p.id
LEFT JOIN
    public.operator_payout_methods opm ON pr.payout_method_id = opm.id;


-- 8. Functions (created after tables and views)
CREATE OR REPLACE FUNCTION public.get_operator_dashboard_data(operator_id_param uuid)
RETURNS TABLE(monthly_earnings numeric, consultations_count integer, unread_messages_count integer)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COALESCE(SUM(e.net_earning), 0)
     FROM public.earnings e
     WHERE e.operator_id = operator_id_param
       AND e.created_at >= date_trunc('month', now())),
    (SELECT COUNT(*)::integer
     FROM public.consultations c
     WHERE c.operator_id = operator_id_param),
    (SELECT COUNT(*)::integer
     FROM public.messages m
     WHERE m.receiver_id = operator_id_param
       AND m.is_read = false);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_operator_earnings_details(p_operator_id uuid)
RETURNS TABLE(balance numeric, total_earned numeric, total_withdrawn numeric, transactions jsonb)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH earnings AS (
        SELECT
            SUM(e.net_earning) AS total
        FROM
            public.earnings e
        WHERE
            e.operator_id = p_operator_id
    ),
    payouts AS (
        SELECT
            SUM(pr.amount) AS total
        FROM
            public.payout_requests pr
        WHERE
            pr.operator_id = p_operator_id AND pr.status = 'completed'
    ),
    all_transactions AS (
        (SELECT
            e.id,
            'earning' AS type,
            e.net_earning AS amount,
            'Guadagno da consulto' AS description,
            e.created_at
        FROM
            public.earnings e
        WHERE
            e.operator_id = p_operator_id)
        UNION ALL
        (SELECT
            pr.id,
            'payout' AS type,
            pr.amount * -1,
            'Pagamento ricevuto' AS description,
            pr.processed_at AS created_at
        FROM
            public.payout_requests pr
        WHERE
            pr.operator_id = p_operator_id AND pr.status = 'completed')
    )
    SELECT
        COALESCE((SELECT total FROM earnings), 0) - COALESCE((SELECT total FROM payouts), 0) AS balance,
        COALESCE((SELECT total FROM earnings), 0) AS total_earned,
        COALESCE((SELECT total FROM payouts), 0) AS total_withdrawn,
        (SELECT jsonb_agg(t.* ORDER BY t.created_at DESC) FROM all_transactions t) AS transactions;
END;
$$;

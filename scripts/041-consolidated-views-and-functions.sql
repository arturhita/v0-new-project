-- Drop existing views if they exist to avoid conflicts
DROP VIEW IF EXISTS public.payout_requests_view;
DROP VIEW IF EXISTS public.commission_requests_view;
DROP FUNCTION IF EXISTS public.get_operator_earnings_details(uuid);

-- View for Commission Requests with Profile Details
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

-- View for Payout Requests with Operator and Method Details
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


-- Function to get detailed earnings for an operator
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
            'Guadagno da consulto con ' || c.client_name AS description,
            e.created_at
        FROM
            public.earnings e
        JOIN
            (SELECT cons.id, prof.full_name AS client_name FROM public.consultations cons JOIN public.profiles prof ON cons.client_id = prof.id) c ON e.consultation_id = c.id
        WHERE
            e.operator_id = p_operator_id)
        UNION ALL
        (SELECT
            pr.id,
            'payout' AS type,
            pr.amount,
            'Richiesta di pagamento' AS description,
            pr.requested_at AS created_at
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

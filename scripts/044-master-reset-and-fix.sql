-- =================================================================
-- MASTER RESET AND FIX SCRIPT
-- This script is designed to be run on a potentially broken schema.
-- It creates tables if they don't exist, fixes relationships,
-- and correctly sets up RLS policies and RPC functions.
-- =================================================================

-- Step 1: Create missing tables to ensure all dependencies exist.

-- Promotions Table (Redesigned)
DROP TABLE IF EXISTS public.promotions CASCADE;
CREATE TABLE IF NOT EXISTS public.promotions (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    title text NOT NULL,
    description text,
    special_price numeric(10, 2),
    discount_percentage integer,
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT promotions_check CHECK (((special_price IS NOT NULL) AND (discount_percentage IS NULL)) OR ((special_price IS NULL) AND (discount_percentage IS NOT NULL)))
);
COMMENT ON TABLE public.promotions IS 'Global promotions applicable to all operators.';

-- Commission Increase Requests Table
CREATE TABLE IF NOT EXISTS public.commission_increase_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    operator_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    current_rate numeric(4, 2) NOT NULL,
    requested_rate numeric(4, 2) NOT NULL,
    reason text,
    status text DEFAULT 'pending'::text NOT NULL, -- pending, approved, rejected
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    processed_at timestamp with time zone
);
COMMENT ON TABLE public.commission_increase_requests IS 'Requests from operators to increase their commission rate.';

-- Broadcast Notifications Table
CREATE TABLE IF NOT EXISTS public.broadcast_notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    title text NOT NULL,
    message text NOT NULL,
    target_role text NOT NULL, -- 'all', 'client', 'operator'
    sent_at timestamp with time zone DEFAULT now() NOT NULL
);
COMMENT ON TABLE public.broadcast_notifications IS 'Notifications sent by admins to groups of users.';

-- Step 2: Fix Payouts relationship
-- Ensure operator_id exists and has the correct foreign key.
ALTER TABLE public.payout_requests
ADD COLUMN IF NOT EXISTS operator_id uuid,
ADD CONSTRAINT payout_requests_operator_id_fkey
  FOREIGN KEY (operator_id)
  REFERENCES public.profiles(id)
  ON DELETE SET NULL;

-- Step 3: Insert or Update Advanced Settings
INSERT INTO public.advanced_settings (key, value, description, type)
VALUES
    ('default_commission_rate', '0.3', 'Tasso di commissione predefinito per i nuovi operatori (es. 0.3 per 30%).', 'number'),
    ('payment_processing_fee_percentage', '2.9', 'Commissione del processore di pagamento in percentuale (es. 2.9 per 2.9%).', 'number'),
    ('payment_processing_fee_fixed', '0.30', 'Commissione fissa del processore di pagamento in euro (es. 0.30 per 30 centesimi).', 'number'),
    ('call_forwarding_fee_client', '0.05', 'Costo al minuto addebitato al cliente per il trasferimento di chiamata.', 'number'),
    ('call_forwarding_fee_operator', '0.02', 'Costo al minuto addebitato all''operatore per il trasferimento di chiamata.', 'number')
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    description = EXCLUDED.description,
    type = EXCLUDED.type;

-- Step 4: Enable RLS and define policies correctly.

-- Commission Increase Requests
ALTER TABLE public.commission_increase_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage all commission requests" ON public.commission_increase_requests;
CREATE POLICY "Admins can manage all commission requests" ON public.commission_increase_requests
    FOR ALL USING (is_admin(auth.uid()));
DROP POLICY IF EXISTS "Operators can view their own requests" ON public.commission_increase_requests;
CREATE POLICY "Operators can view their own requests" ON public.commission_increase_requests
    FOR SELECT USING (operator_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Payout Requests
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage all payout requests" ON public.payout_requests;
CREATE POLICY "Admins can manage all payout requests" ON public.payout_requests
    FOR ALL USING (is_admin(auth.uid()));
DROP POLICY IF EXISTS "Operators can view their own payout requests" ON public.payout_requests;
CREATE POLICY "Operators can view their own payout requests" ON public.payout_requests
    FOR SELECT USING (operator_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Step 5: Create or Replace RPC Functions

-- Function for Admin Dashboard Stats (with real data)
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS TABLE(total_users bigint, total_operators bigint, pending_operators bigint, total_revenue numeric, monthly_revenue numeric)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT count(*) FROM auth.users WHERE (raw_user_meta_data->>'role' IS NULL OR raw_user_meta_data->>'role' = 'client'))::bigint AS total_users,
        (SELECT count(*) FROM public.profiles WHERE role = 'operator' AND status = 'active')::bigint AS total_operators,
        (SELECT count(*) FROM public.profiles WHERE role = 'operator' AND status = 'pending')::bigint AS pending_operators,
        COALESCE((SELECT sum(amount) FROM public.transactions WHERE type = 'charge'), 0)::numeric AS total_revenue,
        COALESCE((SELECT sum(amount) FROM public.transactions WHERE type = 'charge' AND created_at >= date_trunc('month', now())), 0)::numeric AS monthly_revenue;
END;
$$;

-- Function for sending broadcast notifications
CREATE OR REPLACE FUNCTION public.send_broadcast_notification(p_title text, p_message text, p_target_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.broadcast_notifications (title, message, target_role)
    VALUES (p_title, p_message, p_target_role);

    -- This is a simplified version. In a real scenario, you might loop through users
    -- and insert into a user-specific notifications table.
    -- For now, this logs the broadcast.
END;
$$;

-- =================================================================
-- END OF SCRIPT
-- =================================================================

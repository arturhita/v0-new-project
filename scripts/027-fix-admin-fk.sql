-- =================================================================
-- 0. SETUP: CREATE ENUM TYPES
-- =================================================================
-- Drop types if they exist to avoid conflicts during re-runs
DROP TYPE IF EXISTS public.payout_status;
DROP TYPE IF EXISTS public.commission_request_status;

-- Create types
CREATE TYPE public.payout_status AS ENUM ('pending', 'processing', 'paid', 'rejected', 'on_hold');
CREATE TYPE public.commission_request_status AS ENUM ('pending', 'approved', 'rejected');

-- =================================================================
-- 1. PAYOUT REQUESTS TABLE
-- =================================================================
-- Drop table if exists for a clean slate
DROP TABLE IF EXISTS public.payout_requests;

-- Create table
CREATE TABLE public.payout_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    operator_id uuid NOT NULL,
    amount numeric(10, 2) NOT NULL,
    status public.payout_status DEFAULT 'pending'::public.payout_status NOT NULL,
    payment_details jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    processed_at timestamp with time zone,
    CONSTRAINT payout_requests_amount_check CHECK ((amount > (0)::numeric)),
    -- THIS IS THE FIX: Foreign key now correctly references profiles(id)
    CONSTRAINT payout_requests_operator_id_fkey FOREIGN KEY (operator_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- Add comments for clarity
COMMENT ON TABLE public.payout_requests IS 'Stores payout requests from operators.';
COMMENT ON COLUMN public.payout_requests.operator_id IS 'References the operator''s ID in the profiles table.';

-- =================================================================
-- 2. COMMISSION REQUESTS TABLE
-- =================================================================
-- Drop table if exists for a clean slate
DROP TABLE IF EXISTS public.commission_requests;

-- Create table
CREATE TABLE public.commission_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    operator_id uuid NOT NULL,
    current_rate numeric(5, 2) NOT NULL,
    requested_rate numeric(5, 2) NOT NULL,
    justification text,
    status public.commission_request_status DEFAULT 'pending'::public.commission_request_status NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    reviewed_at timestamp with time zone,
    -- THIS IS THE FIX: Foreign key now correctly references profiles(id)
    CONSTRAINT commission_requests_operator_id_fkey FOREIGN KEY (operator_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- Add comments for clarity
COMMENT ON TABLE public.commission_requests IS 'Stores operator requests to change their commission rate.';
COMMENT ON COLUMN public.commission_requests.operator_id IS 'References the operator''s ID in the profiles table.';

-- =================================================================
-- 3. ADMIN DASHBOARD STATS FUNCTION
-- =================================================================
-- Drop function if it exists to ensure the latest version is used
DROP FUNCTION IF EXISTS public.get_admin_dashboard_stats();

-- Create the function to calculate key metrics
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS TABLE(total_users bigint, total_operators bigint, total_revenue numeric, total_consultations bigint)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT count(*) FROM auth.users) AS total_users,
        (SELECT count(*) FROM public.profiles WHERE role = 'operator' AND status = 'approved') AS total_operators,
        (SELECT COALESCE(sum(amount), 0) FROM public.transactions WHERE type = 'credit_purchase' AND status = 'succeeded') AS total_revenue,
        (SELECT count(*) FROM public.consultations WHERE status = 'completed') AS total_consultations;
END;
$$;

-- =================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- =================================================================
-- Enable RLS on the new tables
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to prevent duplication
DROP POLICY IF EXISTS "Allow admin full access" ON public.payout_requests;
DROP POLICY IF EXISTS "Allow operator to manage own requests" ON public.payout_requests;
DROP POLICY IF EXISTS "Allow admin full access" ON public.commission_requests;
DROP POLICY IF EXISTS "Allow operator to manage own requests" ON public.commission_requests;

-- Policies for payout_requests
CREATE POLICY "Allow admin full access" ON public.payout_requests
    FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Allow operator to manage own requests" ON public.payout_requests
    FOR ALL USING (get_profile_id_by_user_id(auth.uid()) = operator_id)
    WITH CHECK (get_profile_id_by_user_id(auth.uid()) = operator_id);

-- Policies for commission_requests
CREATE POLICY "Allow admin full access" ON public.commission_requests
    FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Allow operator to manage own requests" ON public.commission_requests
    FOR ALL USING (get_profile_id_by_user_id(auth.uid()) = operator_id)
    WITH CHECK (get_profile_id_by_user_id(auth.uid()) = operator_id);

-- =================================================================
-- END OF SCRIPT
-- =================================================================

-- =================================================================
-- 0. HELPER FUNCTIONS (FIX FOR "function does not exist" ERROR)
-- =================================================================
-- This function checks if a user has the 'admin' role in their profile.
-- It's SECURITY DEFINER so it can read the profiles table even when called by a user.
CREATE OR REPLACE FUNCTION public.is_admin(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = p_user_id AND role = 'admin'
  );
END;
$$;

-- This function gets the profile's primary key `id` from an `auth.users.id`.
-- Needed for RLS policies where we compare against the operator_id (which is profiles.id).
CREATE OR REPLACE FUNCTION public.get_profile_id_by_user_id(p_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_profile_id uuid;
BEGIN
  SELECT id INTO v_profile_id
  FROM public.profiles
  WHERE user_id = p_user_id;
  RETURN v_profile_id;
END;
$$;

-- =================================================================
-- 1. ENUM TYPES
-- =================================================================
-- Drop types if they exist to allow clean re-runs
DROP TYPE IF EXISTS public.payout_status CASCADE;
DROP TYPE IF EXISTS public.commission_request_status CASCADE;

-- Create fresh types
CREATE TYPE public.payout_status AS ENUM ('pending', 'processing', 'paid', 'rejected', 'on_hold');
CREATE TYPE public.commission_request_status AS ENUM ('pending', 'approved', 'rejected');

-- =================================================================
-- 2. PAYOUT REQUESTS TABLE
-- =================================================================
CREATE TABLE IF NOT EXISTS public.payout_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    operator_id uuid NOT NULL,
    amount numeric(10, 2) NOT NULL,
    status public.payout_status DEFAULT 'pending'::public.payout_status NOT NULL,
    payment_details jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    processed_at timestamp with time zone,
    CONSTRAINT payout_requests_amount_check CHECK ((amount > (0)::numeric)),
    CONSTRAINT payout_requests_operator_id_fkey FOREIGN KEY (operator_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);
COMMENT ON TABLE public.payout_requests IS 'Stores payout requests from operators.';

-- =================================================================
-- 3. COMMISSION REQUESTS TABLE
-- =================================================================
CREATE TABLE IF NOT EXISTS public.commission_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    operator_id uuid NOT NULL,
    current_rate numeric(5, 2) NOT NULL,
    requested_rate numeric(5, 2) NOT NULL,
    justification text,
    status public.commission_request_status DEFAULT 'pending'::public.commission_request_status NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    reviewed_at timestamp with time zone,
    CONSTRAINT commission_requests_operator_id_fkey FOREIGN KEY (operator_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);
COMMENT ON TABLE public.commission_requests IS 'Stores operator requests to change their commission rate.';

-- =================================================================
-- 4. ADMIN DASHBOARD STATS FUNCTION
-- =================================================================
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS TABLE(total_users bigint, total_operators bigint, total_revenue numeric, total_consultations bigint)
LANGUAGE plpgsql
STABLE
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
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- =================================================================
-- Enable RLS
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_requests ENABLE ROW LEVEL SECURITY;

-- Drop old policies before creating new ones
DROP POLICY IF EXISTS "Allow admin full access" ON public.payout_requests;
DROP POLICY IF EXISTS "Allow operator to manage own requests" ON public.payout_requests;
DROP POLICY IF EXISTS "Allow admin full access" ON public.commission_requests;
DROP POLICY IF EXISTS "Allow operator to manage own requests" ON public.commission_requests;

-- Policies for payout_requests (USING THE NEWLY CREATED is_admin FUNCTION)
CREATE POLICY "Allow admin full access" ON public.payout_requests
    FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Allow operator to manage own requests" ON public.payout_requests
    FOR ALL USING (get_profile_id_by_user_id(auth.uid()) = operator_id);

-- Policies for commission_requests (USING THE NEWLY CREATED is_admin FUNCTION)
CREATE POLICY "Allow admin full access" ON public.commission_requests
    FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Allow operator to manage own requests" ON public.commission_requests
    FOR ALL USING (get_profile_id_by_user_id(auth.uid()) = operator_id);

-- =================================================================
-- END OF SCRIPT
-- =================================================================

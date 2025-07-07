-- ============================================================================
-- MASTER RESET SCRIPT
-- This script resets the core application schema to a known, stable state.
-- It defines the critical is_admin() function and rebuilds tables in the
-- correct dependency order.
-- ============================================================================

-- Step 1: Drop existing objects in reverse order of dependency to avoid errors.
DROP VIEW IF EXISTS public.payout_requests_view;
DROP VIEW IF EXISTS public.commission_requests_view;
DROP VIEW IF EXISTS public.admin_operators_view;
DROP FUNCTION IF EXISTS public.get_operator_earnings_details(uuid);
DROP FUNCTION IF EXISTS public.get_operator_dashboard_data(uuid);
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.is_admin();

-- Drop tables, using CASCADE to handle dependencies automatically.
DROP TABLE IF EXISTS public.earnings CASCADE;
DROP TABLE IF EXISTS public.payout_requests CASCADE;
DROP TABLE IF EXISTS public.operator_payout_methods CASCADE;
DROP TABLE IF EXISTS public.commission_requests CASCADE;
DROP TABLE IF EXISTS public.operator_tax_details CASCADE;
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.consultations CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.operator_categories CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
-- Note: 'profiles' table is managed by Supabase Auth, but we might need to clean up triggers.
-- We will recreate the trigger after defining the function.

-- ============================================================================
-- Step 2: Create the missing security function `is_admin()`
-- ============================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  RETURN (
    SELECT EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
END;
$$;

-- ============================================================================
-- Step 3: Recreate tables with correct structure and RLS policies.
-- ============================================================================

-- Categories
CREATE TABLE public.categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    slug text NOT NULL UNIQUE,
    description text
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admin can manage categories" ON public.categories FOR ALL USING (is_admin());

-- Operator Categories (Junction Table)
CREATE TABLE public.operator_categories (
    operator_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    PRIMARY KEY (operator_id, category_id)
);
ALTER TABLE public.operator_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read operator categories" ON public.operator_categories FOR SELECT USING (true);
CREATE POLICY "Admin can manage" ON public.operator_categories FOR ALL USING (is_admin());
CREATE POLICY "Operators can manage their own" ON public.operator_categories FOR ALL USING (auth.uid() = operator_id);


-- Consultations
CREATE TABLE public.consultations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id uuid NOT NULL REFERENCES public.profiles(id),
    operator_id uuid NOT NULL REFERENCES public.profiles(id),
    status text NOT NULL, -- e.g., 'completed', 'pending', 'cancelled'
    consultation_type text NOT NULL, -- 'chat', 'call', 'video'
    duration_minutes integer,
    total_cost numeric(10, 2),
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see their own consultations" ON public.consultations FOR SELECT USING (auth.uid() = client_id OR auth.uid() = operator_id);
CREATE POLICY "Admin can see all consultations" ON public.consultations FOR SELECT USING (is_admin());


-- Messages
CREATE TABLE public.messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id uuid NOT NULL REFERENCES public.profiles(id),
    receiver_id uuid NOT NULL REFERENCES public.profiles(id),
    content text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access their own messages" ON public.messages FOR ALL USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Admin can view all messages" ON public.messages FOR SELECT USING (is_admin());


-- Reviews
CREATE TABLE public.reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id uuid NOT NULL REFERENCES public.profiles(id),
    operator_id uuid NOT NULL REFERENCES public.profiles(id),
    consultation_id uuid REFERENCES public.consultations(id),
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment text,
    is_approved boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read approved reviews" ON public.reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "Users can manage their own reviews" ON public.reviews FOR ALL USING (auth.uid() = client_id);
CREATE POLICY "Admin can manage all reviews" ON public.reviews FOR ALL USING (is_admin());


-- Recreate the financial tables from script 042
-- Commission Requests Table
CREATE TABLE public.commission_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    current_commission_rate numeric(5, 2) NOT NULL,
    requested_commission_rate numeric(5, 2) NOT NULL,
    reason text,
    status text NOT NULL DEFAULT 'pending'::text,
    rejection_reason text,
    admin_notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public.commission_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can manage commission requests" ON public.commission_requests FOR ALL USING (is_admin());
CREATE POLICY "Operators can manage their own requests" ON public.commission_requests FOR ALL USING (auth.uid() = operator_id);

-- Operator Payout Methods Table
CREATE TABLE public.operator_payout_methods (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    method_type text NOT NULL,
    details jsonb NOT NULL,
    is_primary boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public.operator_payout_methods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Operators can manage their own payout methods" ON public.operator_payout_methods FOR ALL USING (auth.uid() = operator_id);
CREATE POLICY "Admin can view payout methods" ON public.operator_payout_methods FOR SELECT USING (is_admin());

-- Payout Requests Table
CREATE TABLE public.payout_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount numeric(10, 2) NOT NULL,
    status text NOT NULL DEFAULT 'pending'::text,
    payout_method_id uuid NOT NULL REFERENCES public.operator_payout_methods(id),
    requested_at timestamp with time zone DEFAULT now() NOT NULL,
    processed_at timestamp with time zone,
    admin_processor_id uuid REFERENCES public.profiles(id),
    transaction_id text,
    notes text
);
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can manage payout requests" ON public.payout_requests FOR ALL USING (is_admin());
CREATE POLICY "Operators can manage their own payout requests" ON public.payout_requests FOR ALL USING (auth.uid() = operator_id);

-- Earnings Table
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

-- Operator Tax Details Table
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

-- Invoices Table
CREATE TABLE public.invoices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    payout_request_id uuid UNIQUE REFERENCES public.payout_requests(id),
    operator_id uuid NOT NULL REFERENCES public.profiles(id),
    invoice_number text NOT NULL UNIQUE,
    issue_date date NOT NULL,
    due_date date,
    amount numeric(10, 2) NOT NULL,
    status text NOT NULL,
    invoice_data jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can manage invoices" ON public.invoices FOR ALL USING (is_admin());
CREATE POLICY "Operators can view their own invoices" ON public.invoices FOR SELECT USING (auth.uid() = operator_id);


-- ============================================================================
-- Step 4: Recreate functions and triggers
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'client');
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Recreate the dashboard function
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

-- ============================================================================
-- Step 5: Recreate Views
-- ============================================================================
CREATE OR REPLACE VIEW public.admin_operators_view AS
SELECT
    p.id,
    p.full_name,
    p.stage_name,
    p.email,
    p.status,
    p.is_available,
    p.is_online,
    p.commission_rate,
    p.created_at AS joined_at
FROM
    public.profiles p
WHERE
    p.role = 'operator';

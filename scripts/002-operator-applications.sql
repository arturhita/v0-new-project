-- =================================================================
--  MIGRATION SCRIPT 002 - Operator Applications
-- =================================================================

-- 1. CREATE APPLICATION STATUS TYPE
DROP TYPE IF EXISTS public.application_status;
CREATE TYPE public.application_status AS ENUM ('pending', 'approved', 'rejected');

-- 2. CREATE OPERATOR APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.operator_applications (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name character varying(255) NOT NULL,
  email character varying(255) NOT NULL,
  phone character varying(50),
  specialties text[] NOT NULL,
  bio text NOT NULL,
  cv_url text, -- URL to the uploaded CV file
  status public.application_status NOT NULL DEFAULT 'pending'::application_status,
  created_at timestamp with time zone DEFAULT now(),
  reviewed_at timestamp with time zone,
  reviewer_notes text, -- Notes from the admin who reviewed the application
  CONSTRAINT unique_pending_application UNIQUE (user_id, status) WHERE (status = 'pending')
);
COMMENT ON TABLE public.operator_applications IS 'Stores applications from users wanting to become operators.';
COMMENT ON CONSTRAINT unique_pending_application ON public.operator_applications IS 'A user can only have one pending application at a time.';


-- 3. SETUP ROW LEVEL SECURITY (RLS)
ALTER TABLE public.operator_applications ENABLE ROW LEVEL SECURITY;
-- Users can see their own application
CREATE POLICY "Users can view their own applications."
  ON public.operator_applications FOR SELECT
  USING (auth.uid() = user_id);
-- Admins can see and manage all applications
CREATE POLICY "Admins can manage all applications."
  ON public.operator_applications FOR ALL
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- End of script

-- =================================================================
--  MIGRATION SCRIPT 002 - Operator Applications (v2 - Corrected)
-- =================================================================

-- Drop objects in reverse order of creation to avoid dependency errors
DROP INDEX IF EXISTS public.unique_pending_application_idx;
DROP TABLE IF EXISTS public.operator_applications CASCADE;
DROP TYPE IF EXISTS public.application_status CASCADE;


-- 1. CREATE APPLICATION STATUS TYPE
CREATE TYPE public.application_status AS ENUM ('pending', 'approved', 'rejected');

-- 2. CREATE OPERATOR APPLICATIONS TABLE
CREATE TABLE public.operator_applications (
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
  reviewer_notes text -- Notes from the admin who reviewed the application
);
COMMENT ON TABLE public.operator_applications IS 'Stores applications from users wanting to become operators.';

-- 3. CREATE PARTIAL UNIQUE INDEX
-- This is the correct way to ensure a user can only have one PENDING application.
CREATE UNIQUE INDEX unique_pending_application_idx
ON public.operator_applications (user_id)
WHERE (status = 'pending');
COMMENT ON INDEX public.unique_pending_application_idx IS 'Ensures a user can only have one pending application at a time.';


-- 4. SETUP ROW LEVEL SECURITY (RLS)
ALTER TABLE public.operator_applications ENABLE ROW LEVEL SECURITY;

-- Drop policies if they exist to avoid errors on re-run
DROP POLICY IF EXISTS "Users can view their own applications." ON public.operator_applications;
DROP POLICY IF EXISTS "Admins can manage all applications." ON public.operator_applications;

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

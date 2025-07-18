-- ========= Platform Settings Table ==========
-- Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.platform_settings (
    id text PRIMARY KEY DEFAULT 'singleton',
    settings jsonb,
    company_details jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz
);

-- Ensure the singleton row exists for settings
INSERT INTO public.platform_settings(id, settings, company_details)
VALUES ('singleton', '{}'::jsonb, '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;


-- ========= Invoices Table Correction ==========
-- Create the table if it doesn't exist, with a minimal structure
CREATE TABLE IF NOT EXISTS public.invoices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz DEFAULT now()
);

-- Drop the incorrect user_id column if it exists
DO $$
BEGIN
   IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='user_id') THEN
      ALTER TABLE public.invoices DROP COLUMN user_id;
   END IF;
END $$;

-- Add the correct columns if they don't exist
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS operator_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS invoice_number text UNIQUE;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS amount numeric(10, 2);
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS due_date date;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft'; -- e.g., draft, sent, paid, overdue
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS invoice_details jsonb;


-- ========= Internal Messages Table ==========
CREATE TABLE IF NOT EXISTS public.internal_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recipient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject text NOT NULL,
    body text,
    read_at timestamptz,
    created_at timestamptz DEFAULT now()
);


-- ========= Newsletters Table ==========
CREATE TABLE IF NOT EXISTS public.newsletters (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    subject text NOT NULL,
    content text NOT NULL,
    status text NOT NULL DEFAULT 'draft', -- e.g., draft, sending, sent
    sent_at timestamptz,
    sent_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now()
);


-- ========= RLS Policies (Basic Admin Access) ==========
-- Enable RLS for all tables
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internal_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Policies for Invoices
DROP POLICY IF EXISTS "Allow full access to service_role on invoices" ON public.invoices;
CREATE POLICY "Allow full access to service_role on invoices" ON public.invoices
    FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- Policies for Internal Messages
DROP POLICY IF EXISTS "Allow users to see their own messages" ON public.internal_messages;
CREATE POLICY "Allow users to see their own messages" ON public.internal_messages
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Allow users to send messages" ON public.internal_messages;
CREATE POLICY "Allow users to send messages" ON public.internal_messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Policies for Newsletters
DROP POLICY IF EXISTS "Allow full access to service_role on newsletters" ON public.newsletters;
CREATE POLICY "Allow full access to service_role on newsletters" ON public.newsletters
    FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- Policies for Platform Settings
DROP POLICY IF EXISTS "Allow full access to service_role on platform_settings" ON public.platform_settings;
CREATE POLICY "Allow full access to service_role on platform_settings" ON public.platform_settings
    FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

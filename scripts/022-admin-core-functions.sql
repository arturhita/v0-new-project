-- 1. Add company_details and newsletter_settings to platform_settings
-- This ensures the table exists before altering it.
CREATE TABLE IF NOT EXISTS platform_settings (
    id TEXT PRIMARY KEY,
    settings JSONB,
    updated_at TIMESTAMPTZ
);

-- Insert a singleton row if it doesn't exist
INSERT INTO platform_settings (id, settings)
VALUES ('singleton', '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;


ALTER TABLE platform_settings
ADD COLUMN IF NOT EXISTS company_details JSONB,
ADD COLUMN IF NOT EXISTS newsletter_settings JSONB;

-- Initialize with default empty values if they are null
UPDATE platform_settings
SET
  company_details = '{}'::jsonb,
  newsletter_settings = '{}'::jsonb
WHERE id = 'singleton' AND (company_details IS NULL OR newsletter_settings IS NULL);


-- 2. Create internal_messages table
CREATE TABLE IF NOT EXISTS internal_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    read_at TIMESTAMPTZ,
    CONSTRAINT sender_recipient_check CHECK (sender_id <> recipient_id)
);

-- RLS for internal_messages
ALTER TABLE internal_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own messages" ON internal_messages;
CREATE POLICY "Users can view their own messages"
ON internal_messages FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Users can send messages" ON internal_messages;
CREATE POLICY "Users can send messages"
ON internal_messages FOR INSERT
WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Users can mark their received messages as read" ON internal_messages;
CREATE POLICY "Users can mark their received messages as read"
ON internal_messages FOR UPDATE
USING (auth.uid() = recipient_id);


-- 3. Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    invoice_number TEXT UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    operator_id UUID REFERENCES auth.users(id), -- Can be null for platform fees
    amount NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- e.g., pending, paid, overdue, cancelled
    due_date DATE NOT NULL,
    paid_at TIMESTAMPTZ,
    invoice_details JSONB -- Store line items, etc.
);

-- RLS for invoices
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own invoices" ON invoices;
CREATE POLICY "Users can view their own invoices"
ON invoices FOR SELECT
USING (auth.uid() = user_id OR auth.uid() = operator_id);


-- 4. Create newsletters table (basic structure)
CREATE TABLE IF NOT EXISTS newsletters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    sent_at TIMESTAMPTZ,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    sent_by UUID REFERENCES auth.users(id),
    status TEXT NOT NULL DEFAULT 'draft' -- e.g., draft, sending, sent
);

-- RLS for newsletters
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;
-- For now, access is handled by server-side admin client.

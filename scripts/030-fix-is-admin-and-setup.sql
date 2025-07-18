-- =================================================================
-- 1. FIX CRITICO: CREAZIONE DELLA FUNZIONE is_admin()
-- Questa funzione è essenziale per tutte le policy di sicurezza.
-- =================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
    is_admin_user boolean;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE user_id = auth.uid() AND role = 'admin'
    ) INTO is_admin_user;
    RETURN is_admin_user;
END;
$$;

-- =================================================================
-- 2. RIAPPLICAZIONE SICURA DELLE POLICY
-- Riesegue la creazione delle policy che erano fallite.
-- =================================================================

-- Policy per i ticket di supporto
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own tickets" ON support_tickets;
CREATE POLICY "Users can manage their own tickets" ON support_tickets
FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can access all tickets and replies" ON support_tickets;
CREATE POLICY "Admins can access all tickets and replies" ON support_tickets
FOR ALL USING (public.is_admin());

ALTER TABLE ticket_replies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own replies" ON ticket_replies;
CREATE POLICY "Users can manage their own replies" ON ticket_replies
FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can access all tickets and replies" ON ticket_replies;
CREATE POLICY "Admins can access all tickets and replies" ON ticket_replies
FOR ALL USING (public.is_admin());

-- Policy per le notifiche
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can see their own notifications" ON notifications;
CREATE POLICY "Users can see their own notifications" ON notifications
FOR SELECT USING (auth.uid() = recipient_user_id);
DROP POLICY IF EXISTS "Admins can create notifications" ON notifications;
CREATE POLICY "Admins can create notifications" ON notifications
FOR INSERT WITH CHECK (public.is_admin());

-- Policy per i post del blog
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read published posts" ON posts;
CREATE POLICY "Public can read published posts" ON posts
FOR SELECT USING (status = 'published' AND (published_at IS NULL OR published_at <= now()));
DROP POLICY IF EXISTS "Admins can manage all posts" ON posts;
CREATE POLICY "Admins can manage all posts" ON posts
FOR ALL USING (public.is_admin());

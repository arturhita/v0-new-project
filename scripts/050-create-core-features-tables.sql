-- Tabella per gli articoli del blog
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT,
    author_id UUID REFERENCES public.profiles(id),
    category TEXT,
    tags TEXT[],
    image_url TEXT,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public blog posts are viewable by everyone." ON public.blog_posts FOR SELECT USING (true);
CREATE POLICY "Admins can manage blog posts." ON public.blog_posts FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));


-- Tabella per i ticket di supporto
CREATE TABLE IF NOT EXISTS public.tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open', -- open, in_progress, closed
    priority TEXT DEFAULT 'medium', -- low, medium, high
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own tickets." ON public.tickets FOR ALL USING (auth.uid() = public.tickets.user_id);
CREATE POLICY "Admins can manage all tickets." ON public.tickets FOR ALL USING (public.is_admin(auth.uid()));


-- Tabella per le notifiche
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own notifications." ON public.notifications FOR SELECT USING (auth.uid() = public.notifications.user_id);
CREATE POLICY "Users can update their own notifications." ON public.notifications FOR UPDATE USING (auth.uid() = public.notifications.user_id);


-- Tabelle per la chat
CREATE TABLE IF NOT EXISTS public.chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.profiles(id) NOT NULL,
    operator_id UUID REFERENCES public.profiles(id) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, active, completed, cancelled
    created_at TIMESTAMPTZ DEFAULT now(),
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ
);
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants can access their chat sessions." ON public.chat_sessions FOR SELECT USING (auth.uid() = public.chat_sessions.client_id OR auth.uid() = public.chat_sessions.operator_id);
CREATE POLICY "Participants can update their chat sessions." ON public.chat_sessions FOR UPDATE USING (auth.uid() = public.chat_sessions.client_id OR auth.uid() = public.chat_sessions.operator_id);


CREATE TABLE IF NOT EXISTS public.chat_messages (
    id BIGSERIAL PRIMARY KEY,
    session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES public.profiles(id) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants can access messages in their sessions." ON public.chat_messages FOR SELECT USING (
    session_id IN (SELECT s.id FROM public.chat_sessions s WHERE auth.uid() = s.client_id OR auth.uid() = s.operator_id)
);
CREATE POLICY "Users can send messages in their sessions." ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);


-- Tabella per i consulti scritti
CREATE TABLE IF NOT EXISTS public.written_consultations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.profiles(id) NOT NULL,
    operator_id UUID REFERENCES public.profiles(id) NOT NULL,
    question TEXT NOT NULL,
    answer TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, answered, cancelled
    created_at TIMESTAMPTZ DEFAULT now(),
    answered_at TIMESTAMPTZ
);
ALTER TABLE public.written_consultations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants can access their written consultations." ON public.written_consultations FOR SELECT USING (auth.uid() = public.written_consultations.client_id OR auth.uid() = public.written_consultations.operator_id);
CREATE POLICY "Clients can create written consultations." ON public.written_consultations FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Operators can answer written consultations." ON public.written_consultations FOR UPDATE USING (auth.uid() = operator_id) WITH CHECK (auth.uid() = operator_id);

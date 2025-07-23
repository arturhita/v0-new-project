-- Questo script è distruttivo. Elimina le tabelle esistenti per garantirne una ricreazione pulita.
-- Drop tables in reverse order of dependency if they exist
DROP TABLE IF EXISTS public.chat_messages CASCADE;
DROP TABLE IF EXISTS public.chat_sessions CASCADE;
DROP TABLE IF EXISTS public.written_consultations CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.tickets CASCADE;
DROP TABLE IF EXISTS public.blog_posts CASCADE;

-- Tabella per gli articoli del blog
CREATE TABLE public.blog_posts (
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
CREATE TRIGGER on_blog_post_updated
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Tabella per i ticket di supporto
CREATE TABLE public.tickets (
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
CREATE POLICY "Users can manage their own tickets." ON public.tickets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all tickets." ON public.tickets FOR ALL USING (public.is_admin(auth.uid()));
CREATE TRIGGER on_ticket_updated
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Tabella per le notifiche
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view and manage their own notifications." ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- Tabelle per la chat
CREATE TABLE public.chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.profiles(id) NOT NULL,
    operator_id UUID REFERENCES public.profiles(id) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, active, completed, cancelled
    created_at TIMESTAMPTZ DEFAULT now(),
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ
);
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants can access their chat sessions." ON public.chat_sessions FOR ALL USING (auth.uid() = client_id OR auth.uid() = operator_id);

CREATE TABLE public.chat_messages (
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
CREATE TABLE public.written_consultations (
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
CREATE POLICY "Participants can access their written consultations." ON public.written_consultations FOR SELECT USING (auth.uid() = client_id OR auth.uid() = operator_id);
CREATE POLICY "Clients can create written consultations." ON public.written_consultations FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Operators can answer written consultations." ON public.written_consultations FOR UPDATE USING (auth.uid() = operator_id) WITH CHECK (auth.uid() = operator_id);

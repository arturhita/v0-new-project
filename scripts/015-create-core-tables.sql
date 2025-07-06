-- Crea la tabella Wallets se non esiste
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    balance NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Crea la tabella Chat Sessions se non esiste
CREATE TABLE IF NOT EXISTS public.chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    operator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, active, ended, cancelled
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ended_at TIMESTAMPTZ
);

-- Crea la tabella Messages se non esiste
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Aggiungi policy RLS per sicurezza
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policy per Wallets: gli utenti possono vedere e modificare solo il proprio wallet
DROP POLICY IF EXISTS "Allow own read access on wallets" ON public.wallets;
CREATE POLICY "Allow own read access on wallets" ON public.wallets FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow own update on wallets" ON public.wallets;
CREATE POLICY "Allow own update on wallets" ON public.wallets FOR UPDATE USING (auth.uid() = user_id);

-- Policy per Chat Sessions: client e operator possono vedere le sessioni a cui partecipano
DROP POLICY IF EXISTS "Allow access to own chat sessions" ON public.chat_sessions;
CREATE POLICY "Allow access to own chat sessions" ON public.chat_sessions FOR SELECT USING (auth.uid() = client_id OR auth.uid() = operator_id);

-- Policy per Messages: sender e receiver possono vedere i messaggi delle loro sessioni
DROP POLICY IF EXISTS "Allow access to own messages" ON public.messages;
CREATE POLICY "Allow access to own messages" ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Allow insert for session participants" ON public.messages;
CREATE POLICY "Allow insert for session participants" ON public.messages FOR INSERT WITH CHECK (
    (auth.uid() = sender_id) AND
    (EXISTS (
        SELECT 1 FROM chat_sessions
        WHERE id = chat_session_id AND (client_id = auth.uid() OR operator_id = auth.uid())
    ))
);

-- Aggiungi indici per performance
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON public.wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_client_id ON public.chat_sessions(client_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_operator_id ON public.chat_sessions(operator_id);
CREATE INDEX IF NOT EXISTS idx_messages_chat_session_id ON public.messages(chat_session_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id_is_read ON public.messages(receiver_id, is_read);

-- Funzione per creare un wallet per un nuovo utente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserisce un wallet per il nuovo utente con saldo 0
  INSERT INTO public.wallets (user_id, balance)
  VALUES (new.id, 0.00);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger che chiama la funzione dopo la creazione di un nuovo profilo
DROP TRIGGER IF EXISTS on_profile_created_create_wallet ON public.profiles;
CREATE TRIGGER on_profile_created_create_wallet
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

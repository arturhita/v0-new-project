-- Tabella per le richieste di modifica commissione da parte degli operatori
CREATE TABLE
  public.commission_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    operator_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
    current_rate NUMERIC(5, 2) NOT NULL,
    requested_rate NUMERIC(5, 2) NOT NULL,
    reason TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    admin_processor_id UUID REFERENCES auth.users (id),
    rejection_reason TEXT
  );

-- Policy di sicurezza per le richieste di commissione
ALTER TABLE public.commission_requests ENABLE ROW LEVEL SECURITY;

-- L'operatore può creare e vedere le proprie richieste
CREATE POLICY "Operators can manage their own commission requests" ON public.commission_requests FOR ALL
USING
  (auth.uid () = operator_id);

-- Gli admin (con un ruolo custom 'admin') possono vedere e gestire tutte le richieste
CREATE POLICY "Admins can manage all commission requests" ON public.commission_requests FOR ALL
USING
  (
    get_my_claim ('user_role') = '"admin"'
  );

-- Aggiungiamo un contatore di messaggi gratuiti alle conversazioni
-- Assumiamo esista una tabella 'conversations' che lega un client_id e un operator_id
-- Se la tabella ha un nome diverso o non esiste, questo schema andrà adattato.
-- Per ora, creo una tabella di riferimento.
CREATE TABLE
  IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    client_id UUID NOT NULL REFERENCES public.profiles (id),
    operator_id UUID NOT NULL REFERENCES public.profiles (id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    free_message_count INT NOT NULL DEFAULT 0,
    UNIQUE (client_id, operator_id)
  );

-- Policy per le conversazioni
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own conversations" ON public.conversations FOR ALL
USING
  (
    auth.uid () IN (client_id, operator_id)
  );

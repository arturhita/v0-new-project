-- Aggiunge la colonna receiver_id alla tabella dei messaggi
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS receiver_id UUID REFERENCES public.profiles(id);

-- Aggiunge un indice per migliorare le performance delle query
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id_is_read ON public.messages (receiver_id, is_read);

-- Popola la colonna receiver_id per i messaggi esistenti (logica di esempio)
-- In una chat, il ricevente è l'utente che non è il mittente.
-- Questa query è complessa e dipende dalla logica esatta della tua app.
-- Per ora, la lasciamo commentata, assumendo che i nuovi messaggi la popoleranno correttamente.
/*
UPDATE messages m
SET receiver_id = (
    SELECT
        CASE
            WHEN cs.client_id = m.sender_id THEN cs.operator_id
            ELSE cs.client_id
        END
    FROM chat_sessions cs
    WHERE cs.id = m.chat_session_id
)
WHERE m.receiver_id IS NULL;
*/

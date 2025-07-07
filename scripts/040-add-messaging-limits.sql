-- Questa funzione viene eseguita prima che un nuovo messaggio venga inserito
-- e controlla se il limite di conversazione è stato raggiunto.
CREATE OR REPLACE FUNCTION check_message_limit()
RETURNS TRIGGER AS $$
DECLARE
    message_count INTEGER;
    -- Limite di messaggi gratuiti (10 totali = 5 scambi)
    FREE_MESSAGE_LIMIT CONSTANT INTEGER := 10;
BEGIN
    -- Conta tutti i messaggi scambiati tra il mittente e il destinatario
    SELECT COUNT(*)
    INTO message_count
    FROM public.messages
    WHERE (sender_id = NEW.sender_id AND receiver_id = NEW.receiver_id)
       OR (sender_id = NEW.receiver_id AND receiver_id = NEW.sender_id);

    -- Se il conteggio ha raggiunto il limite, blocca l'inserimento e solleva un'eccezione
    IF message_count >= FREE_MESSAGE_LIMIT THEN
        RAISE EXCEPTION 'Limite di messaggi gratuiti raggiunto. È necessario avviare un consulto per continuare la conversazione.';
    END IF;

    -- Se il limite non è stato raggiunto, permette l'inserimento del messaggio
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Applica la funzione come "trigger" che si attiva prima di ogni INSERT sulla tabella dei messaggi.
-- Prima di creare il trigger, lo eliminiamo se esiste già per evitare errori.
DROP TRIGGER IF EXISTS enforce_message_limit_trigger ON public.messages;

CREATE TRIGGER enforce_message_limit_trigger
BEFORE INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION check_message_limit();

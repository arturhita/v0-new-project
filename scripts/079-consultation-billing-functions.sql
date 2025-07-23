-- Funzione per terminare un consulto, calcolare i costi finali e registrare i guadagni.
-- Viene chiamata sia manualmente (da client/operatore) sia automaticamente (credito esaurito).
CREATE OR REPLACE FUNCTION end_consultation(p_consultation_id uuid, p_reason text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  consultation_rec record;
  service_rec record;
  final_duration int;
  final_cost numeric;
  commission_rate_val numeric;
  unbilled_seconds int;
  unbilled_cost numeric;
BEGIN
  -- Aggiorna lo stato del consulto, assicurandosi di farlo solo una volta per evitare doppi addebiti.
  UPDATE public.consultations
  SET
    status = 'completed',
    ended_at = now(),
    termination_reason = p_reason
  WHERE id = p_consultation_id AND status = 'active'
  RETURNING * INTO consultation_rec;

  -- Se il consulto non è stato trovato o non era attivo, esce.
  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Recupera i dettagli del servizio per la tariffa al minuto.
  SELECT * INTO service_rec FROM public.operator_services WHERE id = consultation_rec.service_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Servizio con ID % non trovato per il consulto %', consultation_rec.service_id, p_consultation_id;
  END IF;

  -- Calcola il tempo non ancora fatturato dall'ultimo addebito.
  unbilled_seconds := extract(epoch FROM (consultation_rec.ended_at - consultation_rec.last_billed_at))::int;
  IF unbilled_seconds > 0 THEN
    -- Addebita il costo per la frazione di minuto finale, arrotondando per eccesso.
    unbilled_cost := ceil(unbilled_seconds / 60.0) * service_rec.rate_per_minute;
    
    PERFORM public.record_wallet_transaction(
      consultation_rec.client_id,
      -unbilled_cost,
      'consultation_fee_final',
      jsonb_build_object('consultation_id', p_consultation_id, 'unbilled_seconds', unbilled_seconds)
    );
  END IF;

  -- Calcola il costo totale e la durata per il record dei guadagni.
  final_duration := extract(epoch FROM (consultation_rec.ended_at - consultation_rec.started_at))::int;
  final_cost := ceil(final_duration / 60.0) * service_rec.rate_per_minute;

  -- Recupera la commissione della piattaforma.
  SELECT value::numeric / 100.0 INTO commission_rate_val FROM public.app_settings WHERE key = 'default_commission_rate' LIMIT 1;
  IF NOT FOUND THEN
    commission_rate_val := 0.30; -- Fallback al 30%
  END IF;

  -- Registra il guadagno per l'operatore.
  PERFORM public.record_operator_earning(
    consultation_rec.operator_id,
    consultation_rec.type,
    final_cost,
    final_duration / 60,
    p_consultation_id,
    commission_rate_val
  );
END;
$$;

-- Funzione che processa un "tick" di fatturazione per un singolo consulto.
-- Controlla il credito, addebita un minuto o termina la sessione.
CREATE OR REPLACE FUNCTION process_consultation_tick(p_consultation_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  consultation_rec record;
  client_wallet_balance numeric;
  service_rate_per_minute numeric;
  time_since_last_bill int;
  minutes_to_bill int;
  cost_to_bill numeric;
BEGIN
  SELECT * INTO consultation_rec FROM public.consultations WHERE id = p_consultation_id AND status = 'active';
  IF NOT FOUND THEN
    RETURN 'Consulto non attivo o non trovato.';
  END IF;

  SELECT rate_per_minute INTO service_rate_per_minute FROM public.operator_services WHERE id = consultation_rec.service_id;
  IF NOT FOUND THEN
    PERFORM public.end_consultation(p_consultation_id, 'service_not_found');
    RETURN 'Terminato: Servizio non trovato.';
  END IF;

  SELECT balance INTO client_wallet_balance FROM public.wallets WHERE user_id = consultation_rec.client_id;
  client_wallet_balance := COALESCE(client_wallet_balance, 0);

  -- Se il credito non è sufficiente per il prossimo minuto, termina la chiamata.
  IF client_wallet_balance < service_rate_per_minute THEN
    PERFORM public.end_consultation(p_consultation_id, 'insufficient_funds');
    RETURN 'Terminato per credito insufficiente.';
  END IF;

  -- Calcola quanti minuti interi sono passati dall'ultimo addebito.
  time_since_last_bill := extract(epoch FROM (now() - consultation_rec.last_billed_at))::int;
  minutes_to_bill := floor(time_since_last_bill / 60);

  IF minutes_to_bill > 0 THEN
    cost_to_bill := minutes_to_bill * service_rate_per_minute;

    -- Addebita il costo dal portafoglio del cliente.
    PERFORM public.record_wallet_transaction(
      consultation_rec.client_id,
      -cost_to_bill,
      'consultation_fee',
      jsonb_build_object('consultation_id', p_consultation_id, 'minutes_billed', minutes_to_bill)
    );

    -- Aggiorna il timestamp dell'ultimo addebito.
    UPDATE public.consultations
    SET last_billed_at = consultation_rec.last_billed_at + (minutes_to_bill * interval '1 minute')
    WHERE id = p_consultation_id;

    RETURN 'Addebitato/i ' || minutes_to_bill || ' minuto/i.';
  END IF;

  RETURN 'Nessun minuto intero trascorso.';
END;
$$;

-- Funzione principale chiamata dal Cron Job.
-- Scansiona tutti i consulti attivi e li processa.
CREATE OR REPLACE FUNCTION process_all_active_consultations()
RETURNS TABLE(consultation_id uuid, result text)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, public.process_consultation_tick(c.id)
  FROM public.consultations c
  WHERE c.status = 'active';
END;
$$;

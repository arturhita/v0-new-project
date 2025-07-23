CREATE OR REPLACE FUNCTION public.process_minute_billing()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    consultation_record RECORD;
    client_profile RECORD;
    operator_profile RECORD;
    service_record RECORD;
    wallet_balance numeric;
    cost_per_minute numeric;
    cost_for_this_minute numeric;
    commission_rate numeric;
    operator_earning numeric;
    platform_fee numeric;
    new_billed_duration integer;
    termination_message text;
    result_summary jsonb := '{"processed": 0, "terminated": 0, "errors": 0, "details": []}';
    detail_item jsonb;
BEGIN
    -- Itera su tutte le consultazioni attive che non sono state fatturate nell'ultimo minuto
    FOR consultation_record IN
        SELECT * FROM public.consultations
        WHERE status = 'active' AND (last_billed_at IS NULL OR last_billed_at <= now() - interval '55 seconds')
    LOOP
        BEGIN
            -- Ottieni i dettagli del servizio e il costo
            SELECT * INTO service_record FROM public.operator_services WHERE id = consultation_record.service_id;
            cost_per_minute := service_record.price_per_minute;

            -- Ottieni il profilo e il saldo del portafoglio del cliente
            SELECT * INTO client_profile FROM public.profiles WHERE user_id = consultation_record.client_id;
            wallet_balance := client_profile.wallet_balance;

            -- Calcola il costo per il prossimo minuto
            cost_for_this_minute := cost_per_minute;

            -- Controlla se il cliente ha abbastanza credito
            IF wallet_balance >= cost_for_this_minute THEN
                -- Addebita il costo dal portafoglio del cliente
                UPDATE public.profiles
                SET wallet_balance = wallet_balance - cost_for_this_minute
                WHERE user_id = consultation_record.client_id;

                -- Registra la transazione del cliente
                INSERT INTO public.wallet_transactions (user_id, amount, type, description, related_consultation_id)
                VALUES (consultation_record.client_id, -cost_for_this_minute, 'debit', 'Addebito per consulto minuto', consultation_record.id);

                -- Calcola la commissione e il guadagno dell'operatore
                SELECT value::numeric INTO commission_rate FROM public.app_settings WHERE key = 'default_commission_rate';
                commission_rate := COALESCE(commission_rate, 30); -- Fallback a 30%
                
                platform_fee := cost_for_this_minute * (commission_rate / 100.0);
                operator_earning := cost_for_this_minute - platform_fee;

                -- Aggiungi il guadagno al saldo dell'operatore
                UPDATE public.profiles
                SET earnings_balance = earnings_balance + operator_earning
                WHERE user_id = consultation_record.operator_id;

                -- Registra il guadagno
                INSERT INTO public.earnings (operator_id, consultation_id, amount, commission_rate, platform_fee)
                VALUES (consultation_record.operator_id, consultation_record.id, operator_earning, commission_rate, platform_fee);

                -- Aggiorna la consultazione
                new_billed_duration := consultation_record.billed_duration + 60;
                UPDATE public.consultations
                SET last_billed_at = now(),
                    billed_duration = new_billed_duration
                WHERE id = consultation_record.id;
                
                detail_item := jsonb_build_object('consultation_id', consultation_record.id, 'status', 'billed', 'amount', cost_for_this_minute);
                result_summary := jsonb_set(result_summary, '{processed}', (result_summary->>'processed')::int + 1::jsonb);

            ELSE
                -- Credito insufficiente, termina la consultazione
                termination_message := 'Credito insufficiente.';
                UPDATE public.consultations
                SET status = 'completed',
                    ended_at = now(),
                    termination_reason = termination_message
                WHERE id = consultation_record.id;

                detail_item := jsonb_build_object('consultation_id', consultation_record.id, 'status', 'terminated', 'reason', termination_message);
                result_summary := jsonb_set(result_summary, '{terminated}', (result_summary->>'terminated')::int + 1::jsonb);
            END IF;

        EXCEPTION WHEN others THEN
            detail_item := jsonb_build_object('consultation_id', consultation_record.id, 'status', 'error', 'message', SQLERRM);
            result_summary := jsonb_set(result_summary, '{errors}', (result_summary->>'errors')::int + 1::jsonb);
        END;
        
        result_summary := jsonb_set(result_summary, '{details}', result_summary->'details' || detail_item);

    END LOOP;

    RETURN result_summary::json;
END;
$$;

-- Funzione per ottenere le statistiche della dashboard di un operatore
create or replace function get_operator_dashboard_stats(p_operator_id uuid)
returns json
language plpgsql
security definer
as $$
declare
    v_monthly_revenue numeric;
    v_pending_written_consultations int;
    v_monthly_consultations int;
    v_unread_messages int;
    v_new_clients_monthly int;
begin
    -- Calcola le entrate lorde del mese corrente dai consulti completati
    select coalesce(sum(c.price), 0)
    into v_monthly_revenue
    from public.consultations c
    where c.operator_id = p_operator_id
      and c.status = 'completed'
      and c.start_time >= date_trunc('month', now())
      and c.start_time < date_trunc('month', now()) + interval '1 month';

    -- Conteggio consulti scritti in attesa
    select count(*)
    into v_pending_written_consultations
    from public.written_consultations wc
    where wc.operator_id = p_operator_id
      and wc.status = 'pending';

    -- Conteggio consulti completati nel mese
    select count(*)
    into v_monthly_consultations
    from public.consultations
    where operator_id = p_operator_id
      and status = 'completed'
      and start_time >= date_trunc('month', now())
      and start_time < date_trunc('month', now()) + interval '1 month';

    -- Conteggio messaggi non letti
    select count(*)
    into v_unread_messages
    from public.internal_messages
    where recipient_id = p_operator_id and is_read = false;

    -- Conteggio nuovi clienti nel mese
    with first_consultations as (
        select client_id, min(start_time) as first_consultation_time
        from public.consultations
        where operator_id = p_operator_id and status = 'completed'
        group by client_id
    )
    select count(*)
    into v_new_clients_monthly
    from first_consultations
    where first_consultation_time >= date_trunc('month', now())
      and first_consultation_time < date_trunc('month', now()) + interval '1 month';


    return json_build_object(
        'totalEarningsMonth', v_monthly_revenue,
        'pendingConsultations', v_pending_written_consultations,
        'totalConsultationsMonth', v_monthly_consultations,
        'unreadMessages', v_unread_messages,
        'newClientsMonth', v_new_clients_monthly
    );
end;
$$;

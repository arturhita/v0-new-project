-- Funzione per ottenere tutti i KPI della dashboard admin in una sola chiamata
create or replace function get_admin_dashboard_kpis()
returns json
language plpgsql
as $$
declare
    v_total_users bigint;
    v_new_users_this_month bigint;
    v_active_operators bigint;
    v_new_operators_this_week bigint;
    v_revenue_this_month numeric;
    v_consultations_last_24h bigint;
    v_active_promotions bigint;
begin
    -- Utenti
    select count(*) into v_total_users from public.profiles;
    select count(*) into v_new_users_this_month from public.profiles where created_at >= date_trunc('month', now());

    -- Operatori
    select count(*) into v_active_operators from public.profiles where role = 'operator' and status = 'active';
    select count(*) into v_new_operators_this_week from public.profiles where role = 'operator' and created_at >= date_trunc('week', now());

    -- Entrate (basato sui consulti completati nel mese)
    select coalesce(sum(price), 0) into v_revenue_this_month from public.consultations where status = 'completed' and start_time >= date_trunc('month', now());

    -- Consulenze
    select count(*) into v_consultations_last_24h from public.consultations where created_at >= now() - interval '24 hours';

    -- Promozioni
    select count(*) into v_active_promotions from public.promotions where is_active = true and end_date >= now();

    return json_build_object(
        'totalUsers', v_total_users,
        'newUsersThisMonth', v_new_users_this_month,
        'activeOperators', v_active_operators,
        'newOperatorsThisWeek', v_new_operators_this_week,
        'revenueThisMonth', v_revenue_this_month,
        'consultationsLast24h', v_consultations_last_24h,
        'activePromotions', v_active_promotions
    );
end;
$$;


-- Funzione per ottenere tutti i dati della dashboard operatore
create or replace function get_operator_dashboard_data(p_operator_id uuid)
returns json
language plpgsql
as $$
declare
    v_total_earnings_month numeric;
    v_average_rating numeric;
    v_total_reviews bigint;
    v_total_consultations_month bigint;
    v_new_clients_month bigint;
    v_pending_consultations bigint;
    v_unread_messages bigint;
begin
    -- Guadagni del mese dalla tabella earnings
    select coalesce(sum(operator_share), 0)
    into v_total_earnings_month
    from public.earnings
    where operator_id = p_operator_id
      and created_at >= date_trunc('month', now());

    -- Statistiche recensioni
    select coalesce(avg(rating), 0), count(*)
    into v_average_rating, v_total_reviews
    from public.reviews
    where operator_id = p_operator_id and status = 'approved';

    -- Consulti del mese
    select count(*)
    into v_total_consultations_month
    from public.consultations
    where operator_id = p_operator_id
      and status = 'completed'
      and start_time >= date_trunc('month', now());

    -- Nuovi clienti del mese
    with first_consultations as (
        select client_id, min(start_time) as first_consultation_time
        from public.consultations
        where operator_id = p_operator_id and status = 'completed'
        group by client_id
    )
    select count(*)
    into v_new_clients_month
    from first_consultations
    where first_consultation_time >= date_trunc('month', now());

    -- Consulti scritti pendenti
    select count(*)
    into v_pending_consultations
    from public.written_consultations
    where operator_id = p_operator_id and status = 'pending';

    -- Messaggi non letti
    select count(*)
    into v_unread_messages
    from public.internal_messages
    where recipient_id = p_operator_id and is_read = false;

    return json_build_object(
        'totalEarningsMonth', v_total_earnings_month,
        'averageRating', v_average_rating,
        'totalReviews', v_total_reviews,
        'totalConsultationsMonth', v_total_consultations_month,
        'newClientsMonth', v_new_clients_month,
        'pendingConsultations', v_pending_consultations,
        'unreadMessages', v_unread_messages
    );
end;
$$;

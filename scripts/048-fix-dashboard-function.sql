-- ============================================================================
-- SCRIPT DI CORREZIONE DEFINITIVO v048
-- Ricrea la funzione per ottenere i dati della dashboard operatore in modo robusto.
-- ============================================================================

DROP FUNCTION IF EXISTS public.get_operator_dashboard_data(uuid);
CREATE OR REPLACE FUNCTION public.get_operator_dashboard_data(operator_id_param UUID)
RETURNS TABLE(monthly_earnings NUMERIC, consultations_count BIGINT, unread_messages_count BIGINT)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        -- Calcola i guadagni netti del mese corrente
        COALESCE(
            (SELECT SUM(e.net_earning)
             FROM public.earnings e
             WHERE e.operator_id = operator_id_param
               AND date_trunc('month', e.created_at) = date_trunc('month', now())),
            0.00
        ) AS monthly_earnings,

        -- Conta i consulti completati nel mese corrente
        COALESCE(
            (SELECT COUNT(*)
             FROM public.consultations c
             WHERE c.operator_id = operator_id_param
               AND c.status = 'completed'
               AND date_trunc('month', c.created_at) = date_trunc('month', now())),
            0
        ) AS consultations_count,

        -- Conta i messaggi non letti
        COALESCE(
            (SELECT COUNT(*)
             FROM public.messages m
             WHERE m.receiver_id = operator_id_param
               AND m.is_read = FALSE),
            0
        ) AS unread_messages_count;
END;
$$;

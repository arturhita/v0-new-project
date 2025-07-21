-- 1. Create favorite_operators table
    CREATE TABLE IF NOT EXISTS public.favorite_operators (
        id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
        client_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
        operator_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
        created_at timestamp with time zone NOT NULL DEFAULT now(),
        CONSTRAINT favorite_operators_unique_pair UNIQUE (client_id, operator_id)
    );

    -- RLS Policies for favorite_operators
    ALTER TABLE public.favorite_operators ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Clients can view their own favorites" ON public.favorite_operators;
    CREATE POLICY "Clients can view their own favorites"
        ON public.favorite_operators FOR SELECT
        USING (auth.uid() = client_id);

    DROP POLICY IF EXISTS "Clients can insert their own favorites" ON public.favorite_operators;
    CREATE POLICY "Clients can insert their own favorites"
        ON public.favorite_operators FOR INSERT
        WITH CHECK (auth.uid() = client_id);

    DROP POLICY IF EXISTS "Clients can delete their own favorites" ON public.favorite_operators;
    CREATE POLICY "Clients can delete their own favorites"
        ON public.favorite_operators FOR DELETE
        USING (auth.uid() = client_id);

    -- 2. RPC function for dashboard stats
    CREATE OR REPLACE FUNCTION get_client_dashboard_stats(p_client_id uuid)
    RETURNS TABLE(recent_consultations_count bigint, unread_messages_count bigint, wallet_balance numeric)
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
        RETURN QUERY
        SELECT
            (SELECT COUNT(*) FROM public.consultations WHERE client_id = p_client_id AND created_at >= now() - interval '30 days') AS recent_consultations_count,
            (SELECT COUNT(*) FROM public.messages WHERE receiver_id = p_client_id AND is_read = false) AS unread_messages_count,
            (SELECT balance FROM public.wallets WHERE user_id = p_client_id) AS wallet_balance;
    END;
    $$;

    -- 3. RPC function to get favorite operators
    CREATE OR REPLACE FUNCTION get_favorite_operators(p_client_id uuid)
    RETURNS SETOF profiles
    LANGUAGE sql
    STABLE
    AS $$
      SELECT p.*
      FROM public.profiles p
      JOIN public.favorite_operators fo ON p.id = fo.operator_id
      WHERE fo.client_id = p_client_id
      AND p.status = 'Attivo'
      ORDER BY p.is_online DESC, p.stage_name;
    $$;

    -- Grant execution rights
    GRANT EXECUTE ON FUNCTION get_client_dashboard_stats(uuid) TO authenticated;
    GRANT EXECUTE ON FUNCTION get_favorite_operators(uuid) TO authenticated;

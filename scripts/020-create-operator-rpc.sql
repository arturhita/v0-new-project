CREATE OR REPLACE FUNCTION create_full_operator_profile(
    p_user_id uuid,
    p_full_name text,
    p_stage_name text,
    p_phone text,
    p_bio text,
    p_avatar_url text,
    p_status operator_status_enum,
    p_is_online boolean,
    p_commission_rate numeric,
    p_specialties text[],
    p_categories text[],
    p_services jsonb,
    p_availability jsonb
)
RETURNS void AS $$
DECLARE
    service_record jsonb;
    availability_day_key text;
    availability_slots jsonb;
    slot text;
    day_of_week_num int;
    start_time_text text;
    end_time_text text;
BEGIN
    -- 1. Update the profile
    UPDATE public.profiles
    SET
        full_name = p_full_name,
        stage_name = p_stage_name,
        phone = p_phone,
        bio = p_bio,
        avatar_url = p_avatar_url,
        status = p_status,
        is_online = p_is_online,
        commission_rate = p_commission_rate,
        specialties = p_specialties,
        categories = p_categories
    WHERE id = p_user_id;

    -- 2. Insert services
    IF p_services IS NOT NULL AND jsonb_array_length(p_services) > 0 THEN
        FOR service_record IN SELECT * FROM jsonb_array_elements(p_services)
        LOOP
            INSERT INTO public.operator_services (user_id, service_type, price, is_active)
            VALUES (
                p_user_id,
                (service_record->>'service_type')::service_type_enum,
                (service_record->>'price')::numeric,
                (service_record->>'is_active')::boolean
            );
        END LOOP;
    END IF;

    -- 3. Insert availability
    IF p_availability IS NOT NULL THEN
        -- Clear existing availability for this user to prevent duplicates
        DELETE FROM public.operator_availability WHERE user_id = p_user_id;

        FOR availability_day_key IN SELECT * FROM jsonb_object_keys(p_availability)
        LOOP
            day_of_week_num := CASE availability_day_key
                WHEN 'sunday' THEN 0
                WHEN 'monday' THEN 1
                WHEN 'tuesday' THEN 2
                WHEN 'wednesday' THEN 3
                WHEN 'thursday' THEN 4
                WHEN 'friday' THEN 5
                WHEN 'saturday' THEN 6
                ELSE -1
            END;

            IF day_of_week_num != -1 THEN
                availability_slots := p_availability->availability_day_key;
                IF jsonb_array_length(availability_slots) > 0 THEN
                    FOR slot IN SELECT * FROM jsonb_array_elements_text(availability_slots)
                    LOOP
                        start_time_text := split_part(slot, '-', 1) || ':00';
                        end_time_text := split_part(slot, '-', 2) || ':00';

                        INSERT INTO public.operator_availability(user_id, day_of_week, start_time, end_time)
                        VALUES (p_user_id, day_of_week_num, start_time_text::time, end_time_text::time);
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
    END IF;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

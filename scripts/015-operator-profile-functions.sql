-- Drop the old function first to allow for parameter name changes and corrections.
DROP FUNCTION IF EXISTS get_operator_public_profile(text);

-- Funzione per ottenere tutti i dati pubblici di un operatore con una singola chiamata.
-- VERSIONE 4: Aggiunge la ricerca case-insensitive per 'stage_name'.
create or replace function get_operator_public_profile(in_stage_name text)
returns jsonb as $$
declare
  profile_data jsonb;
  reviews_data jsonb;
  services_data jsonb;
  operator_id uuid;
begin
  -- Passo 1: Ottenere i dati base del profilo e le statistiche aggregate
  select
    jsonb_build_object(
      'id', p.id,
      'username', p.stage_name,
      'full_name', p.full_name,
      'avatar_url', p.avatar_url,
      'bio', p.bio,
      'specialization', (p.categories[1]),
      'tags', p.specialties,
      'availability', p.availability,
      'is_online', p.is_online,
      'rating', coalesce(avg(r.rating), 0),
      'reviews_count', count(r.id)
    ) into profile_data
  from
    profiles p
  left join
    reviews r on p.id = r.operator_id and r.status = 'approved'
  where
    -- CORREZIONE: Usa LOWER() per una ricerca case-insensitive, molto più robusta.
    LOWER(p.stage_name) = LOWER(in_stage_name) and p.role = 'operator'
  group by
    p.id;

  -- Se non viene trovato nessun operatore, termina e restituisce null.
  if profile_data is null then
    return null;
  end if;

  -- Estrae l'ID dell'operatore per le query successive.
  operator_id := (profile_data->>'id')::uuid;

  -- Passo 2: Ottenere le recensioni più recenti
  select
    jsonb_agg(
      jsonb_build_object(
        'id', r.id,
        'rating', r.rating,
        'comment', r.comment,
        'created_at', r.created_at,
        'user_name', client_profile.full_name,
        'user_avatar_url', client_profile.avatar_url
      )
    ) into reviews_data
  from
    reviews r
  join
    profiles client_profile on r.client_id = client_profile.id
  where
    r.operator_id = operator_id and r.status = 'approved'
  order by
    r.created_at desc
  limit 10;

  -- Passo 3: Ottenere la lista dei servizi offerti
  select
    jsonb_agg(
      jsonb_build_object(
        'id', os.id,
        'service_type', os.service_type,
        'price', os.price,
        'enabled', os.enabled
      )
    ) into services_data
  from
    operator_services os
  where
    os.operator_id = operator_id and os.enabled = true;

  -- Passo 4: Combinare tutti i dati e restituirli
  return profile_data
    || jsonb_build_object('reviews', coalesce(reviews_data, '[]'::jsonb))
    || jsonb_build_object('services', coalesce(services_data, '[]'::jsonb));
end;
$$ language plpgsql;

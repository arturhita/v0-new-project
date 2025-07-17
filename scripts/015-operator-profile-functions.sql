-- Funzione per ottenere tutti i dati pubblici di un operatore con una singola chiamata.
-- Questo approccio è molto efficiente perché raggruppa più query in una sola operazione sul database.
-- VERSIONE CORRETTA: usa 'in_username' per evitare ambiguità con la colonna 'username'.
create or replace function get_operator_public_profile(in_username text)
returns jsonb as $$
declare
  profile_data jsonb;
  reviews_data jsonb;
  services_data jsonb;
  operator_id uuid;
begin
  -- Passo 1: Ottenere i dati base del profilo e le statistiche aggregate (media voti, numero recensioni)
  select
    jsonb_build_object(
      'id', p.id,
      'username', p.username,
      'full_name', p.full_name,
      'avatar_url', p.avatar_url,
      'bio', p.bio,
      'specialization', p.specialization,
      'tags', p.tags,
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
    p.username = in_username and p.role = 'operator' -- CORREZIONE: usa il parametro non ambiguo
  group by
    p.id;

  -- Se non viene trovato nessun operatore, termina e restituisce null.
  if profile_data is null then
    return null;
  end if;

  -- Estrae l'ID dell'operatore per le query successive.
  operator_id := (profile_data->>'id')::uuid;

  -- Passo 2: Ottenere le recensioni più recenti per questo operatore.
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
  limit 10; -- Limita il risultato alle 10 recensioni più recenti per la pagina profilo.

  -- Passo 3: Ottenere la lista dei servizi offerti dall'operatore.
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

  -- Passo 4: Combinare tutti i dati in un unico oggetto JSON e restituirlo.
  return profile_data
    || jsonb_build_object('reviews', coalesce(reviews_data, '[]'::jsonb))
    || jsonb_build_object('services', coalesce(services_data, '[]'::jsonb));
end;
$$ language plpgsql;

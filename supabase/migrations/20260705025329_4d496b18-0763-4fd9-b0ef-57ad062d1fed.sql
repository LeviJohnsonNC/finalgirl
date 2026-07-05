create or replace function public.get_game_history_summary()
returns table (
  id uuid,
  user_id uuid,
  "timestamp" bigint,
  outcome text,
  killer text,
  location text,
  final_girl text,
  setup_scenario text,
  starting_event text,
  final_horror_level integer,
  final_girl_health integer,
  killer_health integer,
  weapon_used text,
  ending_sub_location text,
  victims_saved integer,
  victims_killed integer,
  poster_image_url text,
  scene_image_url text,
  has_legacy_poster boolean,
  has_legacy_scene boolean
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    id,
    user_id,
    "timestamp",
    outcome,
    killer,
    location,
    final_girl,
    setup_scenario,
    starting_event,
    final_horror_level,
    final_girl_health,
    killer_health,
    weapon_used,
    ending_sub_location,
    victims_saved,
    victims_killed,
    case when poster_image_url like 'data:%' then null else poster_image_url end as poster_image_url,
    case when scene_image_url  like 'data:%' then null else scene_image_url  end as scene_image_url,
    (poster_image_url like 'data:%') as has_legacy_poster,
    (scene_image_url  like 'data:%') as has_legacy_scene
  from public.game_history
  where user_id = auth.uid()
  order by "timestamp" desc;
$$;

grant execute on function public.get_game_history_summary() to authenticated;
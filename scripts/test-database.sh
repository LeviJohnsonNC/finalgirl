#!/usr/bin/env bash
set -euo pipefail
: "${TEST_DATABASE_URL:?Point TEST_DATABASE_URL at a new, disposable PostgreSQL database. Never use production.}"
psql "$TEST_DATABASE_URL" -X -v ON_ERROR_STOP=1 -f tests/database/bootstrap.sql
for migration in supabase/migrations/*.sql; do
  psql "$TEST_DATABASE_URL" -X -v ON_ERROR_STOP=1 --single-transaction -f "$migration"
done
psql "$TEST_DATABASE_URL" -X -v ON_ERROR_STOP=1 -f tests/database/assertions.sql
psql "$TEST_DATABASE_URL" -X -v ON_ERROR_STOP=1 -f tests/database/play-sessions.sql
psql "$TEST_DATABASE_URL" -X -v ON_ERROR_STOP=1 -f tests/database/death-scenes.sql
psql "$TEST_DATABASE_URL" -X -v ON_ERROR_STOP=1 -f tests/database/discard-games.sql
result_dir=$(mktemp -d)
trap 'rm -rf "$result_dir"' EXIT
pids=()
for index in {1..12}; do
  psql "$TEST_DATABASE_URL" -X -qAt -v ON_ERROR_STOP=1 -c "SET ROLE service_role; SELECT allowed FROM public.reserve_ai_usage('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','concurrent-test',3,NULL);" > "$result_dir/$index" &
  pids+=("$!")
done
for pid in "${pids[@]}"; do wait "$pid"; done
allowed=$(cat "$result_dir"/* | awk '$0 == "t" { count++ } END { print count+0 }')
if [[ "$allowed" != 3 ]]; then
  echo "Expected exactly 3 concurrent reservations; got $allowed" >&2
  exit 1
fi
# Different additions to the same collection must all survive concurrent calls.
pids=()
for index in {1..8}; do
  psql "$TEST_DATABASE_URL" -X -qAt -v ON_ERROR_STOP=1 -c "SET ROLE authenticated; SELECT set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',false); SELECT public.apply_collection_delta(ARRAY['concurrent-$index'],ARRAY[]::text[]);" > /dev/null &
  pids+=("$!")
done
for pid in "${pids[@]}"; do wait "$pid"; done
psql "$TEST_DATABASE_URL" -X -v ON_ERROR_STOP=1 -c "DO \$\$ BEGIN ASSERT (SELECT jsonb_array_length(owned_films) FROM public.user_settings WHERE user_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa') = 10; END \$\$;"
# Simultaneous scene requests must permit exactly one paid generation.
pids=()
for index in {1..8}; do
  psql "$TEST_DATABASE_URL" -X -qAt -v ON_ERROR_STOP=1 -c "SET ROLE service_role; SELECT public.claim_death_scene('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','22222222-2222-4222-8222-222222222222','44444444-4444-4444-8444-444444444444',repeat('b',64),0)->>'action';" > "$result_dir/death-$index" &
  pids+=("$!")
done
for pid in "${pids[@]}"; do wait "$pid"; done
generations=$(cat "$result_dir"/death-* | awk '$0 == "generate" { count++ } END { print count+0 }')
if [[ "$generations" != 1 ]]; then echo "Expected one death generation lease; got $generations" >&2; exit 1; fi
echo 'Migration replay, ownership, allowance/collection concurrency and death-scene leases passed.'
# A discard must beat stale session/history writes regardless of arrival order.
race_id=cccccccc-cccc-4ccc-8ccc-cccccccccccc
pids=()
for index in {1..8}; do
  if (( index % 2 == 0 )); then
    query="SELECT public.discard_game_session('$race_id');"
  else
    query="SELECT public.save_play_session('$race_id',0,'{\"version\":1,\"id\":\"$race_id\",\"phase\":\"nowPlaying\",\"selection\":{}}',false); DO \$\$ BEGIN INSERT INTO public.game_history(id,user_id,timestamp,outcome,killer,location,final_girl) VALUES('$race_id',auth.uid(),1,'won','Hans','Camp Happy Trails','Laurie'); EXCEPTION WHEN SQLSTATE 'PT410' OR unique_violation THEN NULL; END \$\$;"
  fi
  psql "$TEST_DATABASE_URL" -X -qAt -v ON_ERROR_STOP=1 -c "SET ROLE authenticated; SELECT set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',false); $query" > "$result_dir/discard-$index" &
  pids+=("$!")
done
for pid in "${pids[@]}"; do wait "$pid"; done
psql "$TEST_DATABASE_URL" -X -v ON_ERROR_STOP=1 -c "DO \$\$ BEGIN ASSERT NOT EXISTS(SELECT 1 FROM public.play_sessions WHERE id='$race_id'); ASSERT NOT EXISTS(SELECT 1 FROM public.game_history WHERE id='$race_id'); ASSERT (SELECT count(*) FROM public.discarded_games WHERE game_id='$race_id')=1; END \$\$;"
echo 'Concurrent discard and stale-save protection passed.'

#!/usr/bin/env bash
set -euo pipefail
: "${TEST_DATABASE_URL:?Point TEST_DATABASE_URL at a new, disposable PostgreSQL database. Never use production.}"
psql "$TEST_DATABASE_URL" -X -v ON_ERROR_STOP=1 -f tests/database/bootstrap.sql
for migration in supabase/migrations/*.sql; do
  psql "$TEST_DATABASE_URL" -X -v ON_ERROR_STOP=1 --single-transaction -f "$migration"
done
psql "$TEST_DATABASE_URL" -X -v ON_ERROR_STOP=1 -f tests/database/assertions.sql
psql "$TEST_DATABASE_URL" -X -v ON_ERROR_STOP=1 -f tests/database/play-sessions.sql
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
echo 'Migration replay, row ownership, allowance concurrency, and collection concurrency passed.'

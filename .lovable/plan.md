## Diagnosis

Scrapbook load = one query per sign-in that pulls every row for the user. The `HISTORY_SUMMARY_SELECT` intentionally omits the big story text columns, but it still selects `poster_image_url` and `scene_image_url`, and those columns contain more than just short URLs.

For your account (47 games), the database has:

- **66 MB** of content in `poster_image_url` + `scene_image_url` combined
- 9 posters and 11 scenes stored as inline `data:image/...;base64,...` URIs (legacy rows, from before the `posters` bucket existed)
- Only ~237 KB of actual story text — text is not the problem

Every scrapbook open streams that ~66 MB payload from Postgres → PostgREST → your browser, then hands it to React and to the localStorage cache writer. That's why it's slow only on your account: no other user has legacy base64 rows.

Secondary amplifier: after each fetch, `useGameHistory` runs `JSON.stringify(prev) === JSON.stringify(slimmed)` to decide whether to update the cache — serializing 66 MB twice per fetch on the main thread.

## Fix

Two-part fix — immediate relief plus a permanent cleanup.

### 1. Immediate: stop sending base64 blobs in the summary query

Add a Postgres SQL function `get_game_history_summary(uid uuid)` that returns the same columns as today, but with:

```sql
CASE WHEN poster_image_url LIKE 'data:%' THEN NULL ELSE poster_image_url END AS poster_image_url
```

(same for `scene_image_url`), plus two booleans `has_legacy_poster` / `has_legacy_scene` so the UI can show a placeholder for legacy rows until they're migrated.

`useGameHistory.fetchFromDb` swaps its `.from('game_history').select(...)` call for `supabase.rpc('get_game_history_summary')`. The individual `fetchGameDetails(id)` call (used when a scrapbook page is opened) still returns the full row, so legacy images still render — one at a time, on demand, instead of all 47 at page load.

Also drop the `JSON.stringify` equality check on the cache write — replace it with a length + id-list comparison so we're not serializing megabytes on the main thread.

Expected result: initial scrapbook payload drops from ~66 MB to a few KB. Load feels instant.

### 2. Permanent: one-time migration of legacy base64 → storage

New edge function `migrate-legacy-images` (JWT-guarded, per-user):

1. Select the caller's rows where `poster_image_url LIKE 'data:%'` OR `scene_image_url LIKE 'data:%'`.
2. For each match, decode the base64, upload to the existing `posters` bucket at `game-posters/<user_id>/<gameId>-poster.jpg` (or `-scene.jpg`), then `UPDATE game_history` with the new public URL.
3. Return a count of migrated rows.

Trigger it automatically the first time a signed-in user with `has_legacy_poster || has_legacy_scene` opens Scrapbooks, with a small "Restoring archived stills..." toast. Runs once, then the flag disappears from every summary row and the CASE fallback becomes a no-op.

### Technical details

- **Migration SQL** — creates the summary function, no schema change to `game_history` itself:
  ```sql
  create or replace function public.get_game_history_summary()
  returns table (...) language sql stable security invoker
  set search_path = public as $$
    select id, user_id, timestamp, outcome, killer, location, final_girl,
           setup_scenario, starting_event, final_horror_level,
           final_girl_health, killer_health, weapon_used, ending_sub_location,
           victims_saved, victims_killed,
           case when poster_image_url like 'data:%' then null else poster_image_url end,
           case when scene_image_url  like 'data:%' then null else scene_image_url  end,
           (poster_image_url like 'data:%') as has_legacy_poster,
           (scene_image_url  like 'data:%') as has_legacy_scene
      from public.game_history
     where user_id = auth.uid()
     order by timestamp desc;
  $$;
  grant execute on function public.get_game_history_summary() to authenticated;
  ```
  RLS on `game_history` still applies since it's `security invoker`.

- **Client** — `useGameHistory.ts`: swap select for `rpc`, extend `fromDbRow` with the two new booleans, add cheap cache-equality (`prev.length === next.length && prev[0]?.id === next[0]?.id`).

- **Edge function** — `supabase/functions/migrate-legacy-images/index.ts` using the existing `_shared/guard.ts` for JWT, service role client for the `UPDATE` after upload. Base64 decode via `Uint8Array.from(atob(...), c => c.charCodeAt(0))`. Content-type parsed from the `data:` prefix.

- **Trigger point** — `Scrapbooks.tsx` runs the migration once when `gameHistory.some(g => g.hasLegacyPoster || g.hasLegacyScene)` and hasn't been attempted this session; on success, calls `retryLoadHistory()` to refresh.

### Out of scope

- Changing story-text loading (not the bottleneck).
- Adding pagination or virtualization to the scrapbook grid (worth doing later, but 47 rows renders fine once the payload isn't 66 MB).

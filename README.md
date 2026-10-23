# Final Girl — Unofficial Case Files

A fan-made web app for casting Final Girl games, generating cinematic stories
and artwork, and keeping a scrapbook of completed plays. It is not endorsed by
or affiliated with Van Ryder Games.

## Development

For adding killers, locations or photographed cards, start with the [module import playbook](docs/MODULE_IMPORT_PLAYBOOK.md). It defines source verification, integration scope, the established Play interface, and completion evidence. Keep a [per-module import record](docs/templates/MODULE_IMPORT_RECORD.md) so later sessions can continue from verified sources and outstanding work.

Use **Node 22** (`nvm use`). npm and `package-lock.json` are the CI dependency source.

```sh
npm ci
npm run dev
```

The tracked environment file contains public project configuration only. Local
builds require `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. Provider
credentials and service-role keys belong in the deployment secret store, never
in a Vite environment variable or the repository.

```sh
npm run check          # lint, typecheck, unit and edge/schema tests
npm run check:assets   # verify original artwork, reject stubs
npm run build
npm run test:browser   # after build; install Chromium with npx playwright install chromium
```

`npm run test:edge` executes the actual guard/schema sources with mocked clients.
GitHub Actions also runs native Deno schema tests and checks the edge entrypoints.
The browser suite covers desktop and mobile with a fully mocked archive: no real
accounts, provider calls, or AI credits are used. Reports and screenshots appear
in `playwright-report/` and `test-results/`.

## Data and recovery

Cloud writes are first persisted to an account-scoped device outbox. Failed saves
remain visible and retry after reconnect, reload, or RETRY SAVE. An active draft
preserves the cast, completed prose/images, and outcome form; RESUME GAME restores
it. Game results can be saved without AI narration. Clearing browser site data
removes device-only drafts and writes that have not reached the archive.

New openings and endings also have a separate private [story evaluation corpus](docs/story-evaluations.md), with full prose, exact prompts, model context and a JSON export in Collection. It is never used as app generation input.

## Database and deployment

See [the reliability rollout](docs/RELIABILITY_ROLLOUT.md) for PR merge order,
migration deployment, edge-function updates, preflight checks, and rollback notes.
Do not reset production or replay historical migrations.

To test all migrations against a **new disposable PostgreSQL database**:

```sh
TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/finalgirl_test npm run test:database
```

This creates test schemas/roles, replays migrations, and checks row ownership and
concurrent AI reservations/collection edits. Never use an existing project URL.

The UI is deployed through the linked [Lovable project](https://lovable.dev/projects/d59a27fc-afa4-4428-82bf-1d9eb9c59108).
Pull requests and CI do not apply production migrations or publish the app.

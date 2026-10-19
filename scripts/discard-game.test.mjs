import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";
import ts from "typescript";
const code = (path) =>
  ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
const shared = {};
new Function(
  "require",
  "exports",
  code("../supabase/functions/_shared/discardedGame.ts"),
)(() => {}, shared);
const gameId = "11111111-1111-4111-8111-111111111111";
function fixture({
  unauthorized = false,
  rpcError = false,
  cleanupError = false,
} = {}) {
  const removed = [],
    rpcCalls = [],
    folders = [];
  let handler;
  const client = {
    auth: {
      getUser: async () => ({
        data: { user: unauthorized ? null : { id: "owner-A" } },
        error: null,
      }),
    },
    rpc: async (name, args) => {
      rpcCalls.push([name, args]);
      return rpcError
        ? { error: { code: "42501" } }
        : { data: { discarded: true, scenes: [] }, error: null };
    },
    from: () => {
      const q = {
        select: () => q,
        eq: () => q,
        update: () => q,
        single: async () => ({ data: { cleanup_revision: 0 }, error: null }),
        maybeSingle: async () => ({ data: { game_id: gameId }, error: null }),
      };
      return q;
    },
    storage: {
      from: () => ({
        list: async (folder) => {
          folders.push(folder);
          return {
            data: [
              { name: gameId + "-scene-123.png" },
              { name: "another-game-scene-123.png" },
              { name: gameId + "-poster-456.webp" },
              { name: gameId + "-scene-path/escape" },
            ],
            error: cleanupError ? { message: "offline" } : null,
          };
        },
        remove: async (paths) => {
          removed.push(...paths);
          return { error: null };
        },
      }),
    },
  };
  new Function(
    "require",
    "exports",
    "Deno",
    code("../supabase/functions/discard-game/index.ts"),
  )(
    (name) => {
      if (name.includes("/http/server.ts"))
        return { serve: (fn) => (handler = fn) };
      if (name.includes("supabase-js")) return { createClient: () => client };
      if (name.endsWith("/auth.ts"))
        return {
          getCorsHeaders: () => ({
            "Access-Control-Allow-Origin": "https://example.test",
          }),
        };
      if (name.endsWith("/discardedGame.ts")) return shared;
      throw new Error(name);
    },
    {},
    { env: { get: () => "configured" } },
  );
  const request = (body = { gameId }, auth = true) =>
    new Request("https://example.test", {
      method: "POST",
      headers: auth ? { Authorization: "Bearer caller" } : {},
      body: JSON.stringify(body),
    });
  return { handler, request, removed, rpcCalls, folders };
}
test("discard uses the ownership-checked transaction and cleans only managed images for this owner/game", async () => {
  const f = fixture();
  const r = await f.handler(f.request());
  assert.equal(r.status, 200);
  assert.equal((await r.json()).cleanupPending, false);
  assert.deepEqual(f.rpcCalls, [
    ["discard_game_session", { p_game_id: gameId }],
  ]);
  assert.deepEqual(f.folders, ["game-posters/owner-A"]);
  assert.deepEqual(f.removed, [
    `game-posters/owner-A/${gameId}-scene-123.png`,
    `game-posters/owner-A/${gameId}-poster-456.webp`,
  ]);
});
test("foreign, unsigned and invalid requests never authorize storage cleanup", async () => {
  for (const [options, body, auth, status] of [
    [{ rpcError: true }, { gameId }, true, 403],
    [{ unauthorized: true }, { gameId }, true, 401],
    [{}, { gameId }, false, 401],
    [{}, { gameId: "not-a-game" }, true, 400],
  ]) {
    const f = fixture(options);
    assert.equal((await f.handler(f.request(body, auth))).status, status);
    assert.equal(f.folders.length, 0);
    assert.equal(f.removed.length, 0);
  }
});
test("storage failure reports a completed record discard with durable cleanup still pending", async () => {
  const f = fixture({ cleanupError: true });
  const r = await f.handler(f.request());
  assert.equal(r.status, 200);
  assert.deepEqual(await r.json(), {
    discarded: true,
    scenes: [],
    cleanupPending: true,
  });
  assert.equal(f.removed.length, 0);
});

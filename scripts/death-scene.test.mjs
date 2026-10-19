import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";
const require = createRequire(import.meta.url);
const code = (path) =>
  ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
function moduleAt(path, imports) {
  const ex = {};
  new Function("require", "exports", code(path))((name) => {
    if (imports[name]) return imports[name];
    throw new Error("Unexpected import " + name);
  }, ex);
  return ex;
}
const buddyland = moduleAt(
  "../supabase/functions/_shared/play/buddyland.ts",
  {},
);
const modules = moduleAt("../supabase/functions/_shared/play/modules.ts", {
  "./buddyland.ts": buddyland,
});
const events = moduleAt("../supabase/functions/_shared/play/events.ts", {
  "./modules.ts": modules,
});
const death = moduleAt("../supabase/functions/_shared/play/death.ts", {
  "./events.ts": events,
  "./modules.ts": modules,
});
const schemas = moduleAt("../supabase/functions/_shared/validation.ts", {
  "https://deno.land/x/zod@v3.22.4/mod.ts": require("zod"),
  "./auth.ts": { corsHeaders: {} },
});
const sessionId = "11111111-1111-4111-8111-111111111111",
  eventId = "22222222-2222-4222-8222-222222222222";
const state = {
  selection: {
    killer: "Billy the Bear",
    location: "Camp Happy Trails",
    finalGirl: "Rena",
  },
  playEvents: [
    {
      id: "33333333-3333-4333-8333-333333333333",
      at: 1,
      kind: "start",
      saved: 0,
      killed: 0,
      round: 1,
    },
    { id: eventId, at: 2, kind: "killed", quantity: 2, cause: "event" },
  ],
};
const completeText =
  "The kitchen clock stopped while the plates were still shaking. Two adults crouched beneath the steel counter and watched the doorway, certain the shelves had taken the worst of it. Then the bolts above them began to unwind, one at a time. When the ceiling finally settled, the counter had become a narrow lid. The clock started again, ticking beneath the silence.";
function fixture(options = {}) {
  const calls = [],
    updates = [],
    filters = [];
  let handler;
  const owned = options.foreign ? null : structuredClone(state);
  if (options.undone)
    owned.playEvents.push({
      id: "44444444-4444-4444-8444-444444444444",
      at: 3,
      kind: "undo",
      target: eventId,
    });
  const client = {
    auth: {
      getUser: async () => ({
        data: { user: options.unauthorized ? null : { id: "owner-A" } },
      }),
    },
    rpc: async () => {
      calls.push("claim");
      return options.claimError
        ? { error: { message: "offline" } }
        : {
            data: {
              action:
                calls.filter((c) => c === "claim").length > 1
                  ? (options.repairAction ?? "generate")
                  : (options.action ?? "generate"),
              id: "scene",
              lease: "lease-token",
              text: options.cachedText ?? completeText,
              model: "cheap",
            },
          };
    },
    from: (table) => {
      const query = {
        select: () => query,
        eq: (key, value) => {
          filters.push([table, key, value]);
          return query;
        },
        order: () => query,
        limit: () => query,
        update: (value) => {
          updates.push(value);
          return query;
        },
        maybeSingle: async () => ({
          data:
            table === "play_sessions"
              ? owned
                ? { state: owned }
                : null
              : { id: "scene" },
          error: null,
        }),
        then: (resolve, reject) =>
          Promise.resolve({
            data: [],
            error: options.repairError ? { message: "repair offline" } : null,
          }).then(resolve, reject),
      };
      return query;
    },
  };
  const imports = {
    "../_shared/auth.ts": { getCorsHeaders: () => ({}) },
    "../_shared/guard.ts": {
      requireUser: async () => {
        calls.push("guard");
        return options.deny
          ? { ok: false, response: new Response("{}", { status: 503 }) }
          : {
              ok: true,
              user: { id: "owner-A" },
              adminClient: client,
              logUsage: async () => {
                calls.push("log");
              },
            };
      },
    },
    "../_shared/validation.ts": schemas,
    "../_shared/aiGateway.ts": {
      generateText: async (opts) => {
        calls.push("AI");
        assert.equal(opts.singleAttempt, true);
        assert.ok(opts.signal instanceof AbortSignal);
        assert.equal(opts.maxTokens, 4096);
        assert.equal(opts.reasoningEffort, "low");
        assert.equal(opts.requireComplete, true);
        if (options.aiError) throw new Error("offline");
        return {
          text: options.text ?? completeText,
          model: "cheap",
        };
      },
      statusFor: () => 500,
      userFacingMessage: () => "The reel jammed.",
      GatewayError: class extends Error {},
    },
    "../_shared/models.ts": { DEATH_MODEL_CANDIDATES: ["cheap"] },
    "../_shared/deathPrompt.ts": {
      deathPrompt: (facts) => {
        assert.equal(facts.location, "Camp Happy Trails");
        assert.equal(facts.cause, "event");
        assert.equal(facts.quantity, 2);
        return { system: "original", user: JSON.stringify(facts) };
      },
    },
    "../_shared/play/death.ts": death,
    "../_shared/play/events.ts": events,
  };
  if (options.realGateway) {
    const real = {};
    new Function(
      "require",
      "exports",
      "Deno",
      "fetch",
      code("../supabase/functions/_shared/aiGateway.ts"),
    )(
      () => ({ usesResponsesApi: () => false }),
      real,
      { env: { get: () => "fake-key" } },
      async (_url, init) => {
        calls.push("AI");
        const body = JSON.parse(init.body);
        assert.equal(body.max_tokens, 4096);
        assert.equal(body.reasoning_effort, "low");
        return new Response(
          JSON.stringify({
            choices: [
              {
                finish_reason: options.finishReason,
                message: { content: options.text ?? completeText },
              },
            ],
          }),
        );
      },
    );
    imports["../_shared/aiGateway.ts"] = real;
  }
  new Function(
    "require",
    "exports",
    "Deno",
    code("../supabase/functions/generate-death-scene/index.ts"),
  )(
    (name) => {
      if (name.includes("/http/server.ts"))
        return {
          serve: (fn) => {
            handler = fn;
          },
        };
      if (name.includes("supabase-js")) return { createClient: () => client };
      if (imports[name]) return imports[name];
      throw new Error(name);
    },
    {},
    { env: { get: () => "configured" } },
  );
  const request = (body) =>
    new Request("https://example.test", {
      method: "POST",
      headers: { Authorization: "Bearer test" },
      body: JSON.stringify(body ?? { sessionId, eventId }),
    });
  return { handler, calls, updates, filters, request, owned };
}
test("cached and in-flight scenes never reserve quota or call a model", async () => {
  for (const action of ["cached", "busy"]) {
    const f = fixture({ action });
    const r = await f.handler(f.request());
    assert.equal(r.status, action === "cached" ? 200 : 409);
    assert.deepEqual(f.calls, ["claim"]);
  }
});
test("generation uses canonical owned observations and a lease before any paid call", async () => {
  const f = fixture();
  assert.equal((await f.handler(f.request())).status, 200);
  assert.deepEqual(f.calls, ["claim", "guard", "AI", "log"]);
  assert.deepEqual(f.owned.playEvents, state.playEvents);
  assert.ok(
    f.filters.some(
      ([table, key, value]) =>
        table === "play_sessions" && key === "user_id" && value === "owner-A",
    ),
  );
  assert.ok(
    f.filters.some(
      ([, key, value]) => key === "lease" && value === "lease-token",
    ),
  );
  assert.ok(f.updates.some((u) => u.status === "ready"));
});
test("new reveal moments are accepted by the real death handler using the owned session", async () => {
  const f = fixture();
  f.owned.playEvents.splice(1, 0,
    events.newPlayEvent({ kind: "moment", momentType: "dark-power", text: "Dark Power", killerCard: "Backup Generator" }),
    events.newPlayEvent({ kind: "moment", momentType: "finale", text: "Finale", killerCard: "Power Surge" }),
  );
  const facts = death.deathFacts(f.owned.selection, f.owned.playEvents, eventId);
  assert.equal(facts.moduleContext.billy.finale, "power-surge");
  assert.equal(facts.moduleContext.billy["power.backup-generator.revealed"], true);
  assert.equal((await f.handler(f.request())).status, 200);
  assert.deepEqual(f.calls, ["claim", "guard", "AI", "log"]);
});
test("foreign, undone and unauthorized deaths do not authorize work", async () => {
  for (const options of [
    { foreign: true },
    { undone: true },
    { unauthorized: true },
  ]) {
    const f = fixture(options);
    const r = await f.handler(f.request());
    assert.ok([401, 409].includes(r.status));
    assert.deepEqual(f.calls, []);
  }
});
test("claim and allowance failures fail closed; AI failure leaves the death intact", async () => {
  for (const options of [
    { claimError: true },
    { deny: true },
    { aiError: true },
  ]) {
    const f = fixture(options);
    const r = await f.handler(f.request());
    assert.ok(r.status >= 500);
    if (!options.aiError) assert.ok(!f.calls.includes("AI"));
    assert.deepEqual(f.owned.playEvents, state.playEvents);
    if (!options.claimError)
      assert.ok(f.updates.some((u) => u.status === "failed"));
  }
});
test("invalid take or caller-supplied fictional actors are rejected before authentication or spending", async () => {
  for (const bad of [
    { sessionId, eventId, take: 3 },
    { sessionId, eventId, killer: "other" },
  ]) {
    const f = fixture();
    assert.equal((await f.handler(f.request(bad))).status, 400);
    assert.deepEqual(f.calls, []);
  }
});

test("the observed fragment is never persisted as a ready death scene", async () => {
  const f = fixture({ text: "The grease-stained" });
  const response = await f.handler(f.request());
  assert.equal(response.status, 500);
  assert.ok(!f.updates.some((u) => u.status === "ready"));
  assert.ok(f.updates.some((u) => u.status === "failed"));
});

test("real gateway and death handler reject clipped, missing-finish and short responses before publishing, and accept a complete story", async () => {
  for (const options of [
    { finishReason: "length", text: "The grease-stained" },
    { finishReason: "length", text: completeText },
    { finishReason: undefined, text: completeText },
    { finishReason: "stop", text: "The grease-stained" },
    { finishReason: "stop", text: completeText },
  ]) {
    const f = fixture({ ...options, realGateway: true });
    const response = await f.handler(f.request());
    const success =
      options.finishReason === "stop" && options.text === completeText;
    assert.equal(response.status, success ? 200 : 500);
    assert.equal(
      f.updates.some((u) => u.status === "ready"),
      success,
    );
    assert.equal(f.calls.filter((c) => c === "AI").length, 1);
    if (success)
      assert.equal((await response.json()).scene.scene_text, completeText);
  }
});

test("cached fragments are repaired in the same slot through a fresh lease, and contention/failures spend no allowance", async () => {
  const f = fixture({ action: "cached", cachedText: "The grease-stained" });
  const response = await f.handler(f.request());
  assert.equal(response.status, 200);
  assert.equal((await response.json()).scene.scene_text, completeText);
  assert.deepEqual(f.calls, ["claim", "claim", "guard", "AI", "log"]);
  assert.ok(
    f.filters.some(
      ([, key, value]) =>
        key === "scene_text" && value === "The grease-stained",
    ),
  );
  assert.ok(
    f.filters.some(
      ([, key, value]) => key === "user_id" && value === "owner-A",
    ),
  );
  assert.equal(f.updates.filter((u) => u.status === "ready").length, 1);
  for (const options of [{ repairAction: "busy" }, { repairError: true }]) {
    const failed = fixture({
      action: "cached",
      cachedText: "The grease-stained",
      ...options,
    });
    assert.ok((await failed.handler(failed.request())).status >= 400);
    assert.ok(!failed.calls.includes("AI"));
    assert.ok(!failed.calls.includes("guard"));
  }
});

import { beforeEach, describe, expect, it, vi } from "vitest";
const mock = vi.hoisted(() => ({
  requests: [] as Record<string, unknown>[],
  fail: false,
}));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => {
      const args: Record<string, unknown> = {};
      const query = {
        select: (v: string) => {
          args.select = v;
          return query;
        },
        eq: (k: string, v: unknown) => {
          args[k] = v;
          return query;
        },
        gt: (_k: string, v: number) => {
          args.after = v;
          return query;
        },
        lte: (_k: string, v: number) => {
          args.ceiling = v;
          return query;
        },
        order: () => query,
        limit: () => query,
        abortSignal: async () => {
          mock.requests.push(args);
          if (mock.fail) return { error: new Error("offline") };
          if (args.select === "sequence") return { data: [{ sequence: 121 }] };
          const start = Number(args.after) + 1;
          return {
            data: Array.from({ length: Math.min(50, 122 - start) }, (_, i) => ({
              id: `id-${start + i}`,
              sequence: start + i,
              user_id: "owner",
              kind: "opening",
              status: "complete",
              story_text: "Full prose. ".repeat(1000),
              system_prompt: "exact",
              user_prompt: "exact user",
            })),
          };
        },
      };
      return query;
    },
  },
}));
import {
  loadStoryEvaluations,
  storyEvaluationDocument,
} from "./storyEvaluationExport";

describe("evaluation JSON export", () => {
  beforeEach(() => {
    mock.requests = [];
    mock.fail = false;
  });
  it("loads every page for the owner and preserves full prose/prompts without account identifiers", async () => {
    const attempts = await loadStoryEvaluations(
      "owner",
      new AbortController().signal,
    );
    expect(attempts).toHaveLength(121);
    expect(mock.requests).toHaveLength(4);
    expect(mock.requests.every((r) => r.user_id === "owner")).toBe(true);
    expect(mock.requests.slice(1).every((r) => r.ceiling === 121)).toBe(true);
    const document = JSON.parse(
      JSON.stringify(storyEvaluationDocument(attempts)),
    );
    expect(document.attemptCount).toBe(121);
    expect(document.attempts[120].story_text).toBe("Full prose. ".repeat(1000));
    expect(document.attempts[0].system_prompt).toBe("exact");
    expect(document.attempts[0].user_id).toBeUndefined();
    expect(document.attempts[0].sequence).toBeUndefined();
  });
  it("fails the whole export on a read failure instead of presenting partial data as complete", async () => {
    mock.fail = true;
    await expect(
      loadStoryEvaluations("owner", new AbortController().signal),
    ).rejects.toThrow("offline");
  });
});

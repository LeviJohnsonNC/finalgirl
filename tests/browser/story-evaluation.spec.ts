import { readFile } from "node:fs/promises";
import { test, expect, activeGame, gameId, userId } from "./fixtures";

test("private evaluation export is explicit, contains whole attempts and fits both layouts", async ({
  page,
  archive,
}, info) => {
  await archive.install(page);
  let reads = 0;
  await page.route("**/rest/v1/story_evaluations*", async (route) => {
    reads++;
    const url = new URL(route.request().url());
    expect(url.searchParams.get("user_id")).toBe(`eq.${userId}`);
    const data =
      url.searchParams.get("select") === "sequence"
        ? [{ sequence: 2 }]
        : [
            {
              id: "attempt-opening",
              sequence: 1,
              user_id: userId,
              game_id: gameId,
              kind: "opening",
              status: "complete",
              story_text: "Full opening. ".repeat(1000),
              system_prompt: "EXACT SYSTEM",
              user_prompt: "EXACT USER",
              model_context: { startingEvent: "Girlfriend" },
              diagnostic_context: { playEvents: [] },
            },
            {
              id: "attempt-ending",
              sequence: 2,
              user_id: userId,
              game_id: gameId,
              kind: "ending",
              status: "incomplete",
              story_text: "Full partial ending",
              system_prompt: "ENDING SYSTEM",
              user_prompt: "ENDING USER",
              model_context: { playSummary: "Short summary" },
              diagnostic_context: { playEvents: ["Full log"] },
            },
          ];
    await route.fulfill({ json: data });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Collection", exact: true }).click();
  expect(reads).toBe(0);
  await page.getByText("Story evaluation", { exact: true }).click();
  expect(reads).toBe(0);
  const downloaded = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "EXPORT JSON", exact: true })
    .click();
  const file = await downloaded;
  const json = JSON.parse(await readFile((await file.path())!, "utf8"));
  expect(json.attemptCount).toBe(2);
  expect(json.attempts[0].story_text).toBe("Full opening. ".repeat(1000));
  expect(json.attempts[1].diagnostic_context.playEvents).toEqual(["Full log"]);
  expect(json.attempts[0].user_id).toBeUndefined();
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: "Exported 2 generation attempts" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page
    .getByText("Story evaluation", { exact: true })
    .scrollIntoViewIfNeeded();
  await page.screenshot({
    path: info.outputPath("story-evaluation-export.png"),
    fullPage: false,
  });
  expect(archive.calls).toEqual([]);
});

test("empty and failed export explain missing data without downloading", async ({
  page,
  archive,
}) => {
  await archive.install(page);
  let failure = false,
    downloads = 0;
  page.on("download", () => downloads++);
  await page.route("**/rest/v1/story_evaluations*", (route) =>
    failure
      ? route.fulfill({ status: 503, json: { message: "offline" } })
      : route.fulfill({ json: [] }),
  );
  await page.goto("/");
  await page.getByRole("button", { name: "Collection", exact: true }).click();
  await page.getByText("Story evaluation", { exact: true }).click();
  const button = page.getByRole("button", {
    name: "EXPORT JSON",
    exact: true,
  });
  await button.click();
  await expect(
    page.getByRole("status").filter({ hasText: "No evaluation data yet" }),
  ).toBeVisible();
  failure = true;
  await button.click();
  await expect(
    page.getByRole("status").filter({ hasText: "Evaluation export failed" }),
  ).toBeVisible();
  expect(downloads).toBe(0);
});

test("clearing evaluation data requires confirmation", async ({
  page,
  archive,
}) => {
  await archive.install(page);
  let deletes = 0;
  await page.route("**/rest/v1/story_evaluations*", async (route) => {
    expect(route.request().method()).toBe("DELETE");
    deletes++;
    await route.fulfill({ status: 204 });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Collection", exact: true }).click();
  await page.getByText("Story evaluation", { exact: true }).click();
  page.once("dialog", (dialog) => dialog.dismiss());
  await page
    .getByRole("button", { name: "Clear evaluation data", exact: true })
    .click();
  expect(deletes).toBe(0);
  page.once("dialog", (dialog) => dialog.accept());
  await page
    .getByRole("button", { name: "Clear evaluation data", exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "Evaluation data cleared" }),
  ).toBeVisible();
  expect(deletes).toBe(1);
});

test("new opening sends game pairing and diagnostic context alongside unchanged story input", async ({
  page,
  archive,
}) => {
  await archive.install(page, {
    draft: { ...activeGame, introStory: undefined },
  });
  await page.goto("/");
  await page.getByRole("button", { name: "RESUME GAME" }).click();
  await expect
    .poll(
      () =>
        archive.generationRequests.filter((r) => r.name === "generate-story")
          .length,
    )
    .toBe(1);
  const request = archive.generationRequests.find(
    (r) => r.name === "generate-story",
  )!;
  expect(request.body.evaluation).toMatchObject({
    gameId,
    context: { selection: activeGame.selection, playEvents: [] },
  });
  expect(request.body.killer).toMatchObject({ name: "Hans" });
});

test("ending diagnostics retain full gameplay and reviewed result while the model keeps its selected summary", async ({
  page,
  archive,
}) => {
  const log = [
    {
      id: "33333333-3333-4333-8333-333333333333",
      at: 1,
      kind: "start",
      round: 2,
      saved: 1,
      killed: 0,
    },
  ];
  await archive.install(page, { draft: { ...activeGame, playEvents: log } });
  await page.goto("/");
  await page.getByRole("button", { name: "RESUME GAME" }).click();
  await page.getByRole("button", { name: "WON", exact: true }).first().click();
  await page.getByLabel("Weapon Used", { exact: true }).fill("Axe");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect
    .poll(() =>
      archive.generationRequests.some((r) => r.name === "generate-ending"),
    )
    .toBe(true);
  const body = archive.generationRequests.find(
    (r) => r.name === "generate-ending",
  )!.body;
  expect(body.evaluation).toMatchObject({
    gameId,
    context: { playEvents: log, reviewedResult: { weaponUsed: "Axe" } },
  });
  expect(body.introStory).toBe(activeGame.introStory);
  expect(body.weaponUsed).toBe("Axe");
  expect(typeof body.playSummary).toBe("string");
});

test("an evaluation write outage warns without breaking the generated opening", async ({
  page,
  archive,
}) => {
  await archive.install(page, {
    draft: { ...activeGame, introStory: undefined },
  });
  await page.route("**/functions/v1/generate-story", (route) =>
    route.fulfill({
      contentType: "text/event-stream",
      body: 'data: {"choices":[{"delta":{"content":"The opening is still available."}}]}\n\ndata: {"evaluation":{"saved":false}}\n\ndata: [DONE]\n\n',
    }),
  );
  await page.goto("/");
  await page.getByRole("button", { name: "RESUME GAME" }).click();
  await expect(
    page.getByRole("region", { name: "Opening narration" }),
  ).toContainText("The opening is still available.");
  await expect(
    page.getByText("Story ready, evaluation copy wasn't saved", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "WON", exact: true }).first(),
  ).toBeEnabled();
});

test("guests have no evaluation controls", async ({ page, archive }) => {
  await archive.install(page, { signedIn: false });
  await page.goto("/");
  await page.getByRole("button", { name: "Collection", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "MY COLLECTION" }),
  ).toBeVisible();
  await expect(page.getByText("Story evaluation", { exact: true })).toHaveCount(
    0,
  );
});

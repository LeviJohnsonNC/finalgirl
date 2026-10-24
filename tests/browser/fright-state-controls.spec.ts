import { test, expect } from "./fixtures";
import { newPlayEvent } from "../../src/lib/play/events";
import { frightState } from "../../supabase/functions/_shared/play/fright";
import { summarizePlay } from "../../src/lib/play/events";
import {
  draft,
  panel,
  dialog,
  resume,
  enter,
  log,
  slide,
  footerVisible,
} from "./fright-helpers";
import type { Page } from "@playwright/test";

const current = async (page: Page) =>
  frightState(summarizePlay(await log(page)).entries)!;
const sleepButton = (
  scope: ReturnType<typeof dialog>,
  state: "Awake" | "Asleep",
) =>
  scope.getByRole("button", {
    name: `Record Final Girl ${state}`,
    exact: true,
  });
const exposed = (page: Page) =>
  dialog(page).locator(".boiler-card-layer:not(.boiler-cover)");

async function concealed(page: Page, state: "awake" | "asleep") {
  await expect(exposed(page)).toHaveCount(0);
  await expect(dialog(page).locator(".boiler-doctor")).toHaveCount(0);
  await expect(dialog(page).locator(".boiler-cover image")).toHaveAttribute(
    "href",
    new RegExp(`${state}-back`),
  );
  await expect(
    sleepButton(dialog(page), state === "awake" ? "Awake" : "Asleep"),
  ).toHaveAttribute("aria-pressed", "true");
}

test("main controls and modal share one-click sleep changes, conceal partial decks and preserve Undo", async ({
  page,
  archive,
}, info) => {
  await page.setViewportSize(
    info.project.name === "desktop"
      ? { width: 1366, height: 768 }
      : { width: 390, height: 844 },
  );
  await archive.install(page, { draft });
  await resume(page);
  const before = await log(page);
  await sleepButton(panel(page), "Asleep").click();
  await panel(page)
    .getByRole("button", { name: /Continue Boiler Room/ })
    .click();
  expect((await log(page)).length).toBe(before.length + 1);
  await concealed(page, "asleep");
  await expect(
    dialog(page).locator(".boiler-meter, .boiler-result"),
  ).toHaveCount(0);
  await expect(dialog(page)).toHaveCSS("background-image", /modal-background/);
  await slide(page, "up");
  await expect(exposed(page)).toHaveCount(1);
  await sleepButton(dialog(page), "Awake").click();
  await concealed(page, "awake");
  const wake = await current(page);
  expect(wake).toMatchObject({
    sleep: "awake",
    path: "",
    deal: "2301",
    cycle: 2,
  });
  const afterWake = await log(page);
  // Native activation of the selected state is a no-op, including rapid repeats.
  await sleepButton(dialog(page), "Awake").evaluate(
    (button: HTMLButtonElement) => {
      button.click();
      button.click();
    },
  );
  expect(await log(page)).toEqual(afterWake);
  await footerVisible(page);
  await page.screenshot({
    path: info.outputPath("boiler-awake-concealed.png"),
  });
  await dialog(page)
    .getByRole("button", { name: "Undo last step", exact: true })
    .click();
  await expect(exposed(page)).toHaveCount(1);
  expect(await current(page)).toMatchObject({
    sleep: "asleep",
    path: "U",
    deal: "0132",
  });
  await dialog(page)
    .getByRole("button", { name: "Back to game", exact: true })
    .click();
  await sleepButton(panel(page), "Awake").click();
  expect(await current(page)).toMatchObject({
    sleep: "awake",
    path: "",
    deal: wake.deal,
    reserve: wake.reserve,
  });
  await page.reload();
  await resume(page);
  await panel(page)
    .getByRole("button", { name: /Enter the Boiler Room/ })
    .click();
  await concealed(page, "awake");
  await sleepButton(dialog(page), "Asleep").click();
  await concealed(page, "asleep");
  expect((await current(page))?.deal).toBe(wake.deal);
  await slide(page, "up");
  await footerVisible(page);
  await page.screenshot({ path: info.outputPath("boiler-asleep-reveal.png") });
});

test("fourth-card attacks finish before the fresh Awake deck; reopening never restores completed cards", async ({
  page,
  archive,
}, info) => {
  const events = draft.playEvents.map((event) =>
    event.moduleData &&
    JSON.parse(event.moduleData.changes.snapshot as string).command ===
      "digital"
      ? {
          ...event,
          moduleData: {
            ...event.moduleData,
            changes: {
              snapshot: JSON.stringify({
                ...JSON.parse(event.moduleData.changes.snapshot as string),
                deal: "0123",
              }),
            },
          },
        }
      : event,
  );
  await archive.install(page, { draft: { ...draft, playEvents: events } });
  await resume(page);
  await enter(page);
  for (let i = 0; i < 4; i++) {
    await slide(page, "up");
    if ((await current(page)).pending) {
      await expect(sleepButton(dialog(page), "Awake")).toBeDisabled();
      if (i === 3) {
        await expect(exposed(page)).toHaveCount(4);
        expect((await current(page)).sleep).toBe("asleep");
      }
      await dialog(page)
        .getByRole("button", { name: "Attack resolved", exact: true })
        .click();
    }
  }
  await concealed(page, "awake");
  expect(await current(page)).toMatchObject({
    path: "",
    lastPath: "UUUU",
    cycle: 2,
    deal: "2301",
  });
  const before = await log(page);
  await dialog(page)
    .getByRole("button", { name: "Back to game", exact: true })
    .click();
  await panel(page)
    .getByRole("button", { name: /Enter the Boiler Room/ })
    .click();
  await concealed(page, "awake");
  expect(await log(page)).toEqual(before);
  for (const size of info.project.name === "desktop"
    ? [
        { width: 1366, height: 768 },
        { width: 1280, height: 640 },
      ]
    : [
        { width: 390, height: 844 },
        { width: 320, height: 568 },
      ]) {
    await page.setViewportSize(size);
    await footerVisible(page);
    for (const button of await dialog(page)
      .locator(".boiler-direction, .fright-sleep-grid button")
      .all())
      await expect(button).toBeInViewport({ ratio: 1 });
    expect(
      await dialog(page).evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
    ).toBe(true);
    await page.screenshot({
      path: info.outputPath(`boiler-reset-${size.width}.png`),
    });
  }
});

test("a failed manual wake keeps the exposed cards and is retryable without duplicate observations", async ({
  page,
  archive,
}) => {
  await archive.install(page, { draft });
  await resume(page);
  await enter(page);
  await slide(page, "up");
  const before = await log(page);
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Object.assign(window, {
      restoreWakeStorage: () => {
        Storage.prototype.setItem = original;
      },
    });
    Storage.prototype.setItem = function (key, value) {
      if (key.startsWith("final-girl-active-game-v1:")) throw new Error("Full");
      return original.call(this, key, value);
    };
  });
  await sleepButton(dialog(page), "Awake").click();
  await expect(dialog(page).getByRole("alert")).toContainText(
    "could not be saved",
  );
  await expect(exposed(page)).toHaveCount(1);
  expect(await log(page)).toEqual(before);
  await page.evaluate(() =>
    (
      window as unknown as { restoreWakeStorage: () => void }
    ).restoreWakeStorage(),
  );
  await sleepButton(dialog(page), "Awake").evaluate(
    (button: HTMLButtonElement) => {
      button.click();
      button.click();
    },
  );
  await concealed(page, "awake");
  expect((await log(page)).length).toBe(before.length + 1);
});

test("forced sleep prevents a manual wake in both entry points without consuming the fresh deck", async ({
  page,
  archive,
}) => {
  const finale = newPlayEvent({
    kind: "moment",
    momentType: "finale",
    text: "Finale revealed",
    permanent: true,
    killerCard: "Face Your Fright",
  });
  await archive.install(page, {
    draft: { ...draft, playEvents: [...draft.playEvents, finale] },
  });
  await resume(page);
  await expect(sleepButton(panel(page), "Awake")).toBeDisabled();
  await enter(page);
  await expect(sleepButton(dialog(page), "Awake")).toBeDisabled();
  await expect(dialog(page)).toContainText(
    "Face Your Fright keeps you Asleep.",
  );
  const before = await log(page);
  await sleepButton(dialog(page), "Awake").evaluate(
    (button: HTMLButtonElement) => button.click(),
  );
  expect(await log(page)).toEqual(before);
  await concealed(page, "asleep");
});

import { expect, activeGame, userId } from "./fixtures";
import { openModule } from "./play-helpers";
import { initialFright } from "../../supabase/functions/_shared/play/fright";
import { newPlayEvent, type PlayEvent } from "../../src/lib/play/events";
import type { Page } from "@playwright/test";

export const start = newPlayEvent({
  kind: "start",
  saved: 0,
  killed: 0,
  round: 1,
});
const seed = newPlayEvent({
  kind: "module",
  moduleData: {
    module: "fright",
    changes: { snapshot: JSON.stringify(initialFright()) },
  },
});
const digital = newPlayEvent({
  kind: "module",
  moduleData: {
    module: "fright",
    changes: {
      snapshot: JSON.stringify({
        ...initialFright(),
        parent: seed.id,
        command: "digital",
        mode: "digital",
        cycle: 1,
        deal: "0132",
        reserve: "2301",
      }),
    },
  },
});
export const draft = {
  ...activeGame,
  playMode: true,
  selection: { ...activeGame.selection, killer: "Dr. Fright" },
  playEvents: [start, seed, digital],
};
export const panel = (page: Page) => page.locator('[data-module="fright"]');
export const dialog = (page: Page) =>
  page.getByRole("dialog", { name: "The Boiler Room", exact: true });
export async function resume(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await openModule(page, "fright");
}
export const log = (page: Page): Promise<PlayEvent[]> =>
  page.evaluate(
    (owner) =>
      JSON.parse(localStorage.getItem("final-girl-active-game-v1:" + owner)!)
        .playEvents,
    userId,
  );
export async function enter(page: Page) {
  await panel(page)
    .getByRole("button", { name: /Enter the Boiler Room/ })
    .click();
  await dialog(page)
    .getByRole("button", { name: "Record falling Asleep", exact: true })
    .click();
}
export const slide = async (page: Page, name: string) => {
  await dialog(page)
    .getByRole("button", {
      name: `Slide ${name}; reveal ${{ up: "bottom", down: "top", left: "right", right: "left" }[name]}`,
      exact: true,
    })
    .click();
  await expect(dialog(page).locator(".boiler-stage")).toHaveAttribute(
    "data-phase",
    "idle",
  );
};
export async function footerVisible(page: Page) {
  for (const button of await dialog(page).locator('.boiler-direction').all()) {
    const bounds = (await button.boundingBox())!;
    expect(bounds.width).toBeGreaterThanOrEqual(44);
    expect(bounds.height).toBeGreaterThanOrEqual(44);
  }
  for (const button of await dialog(page)
    .locator(".boiler-footer button")
    .all())
    await expect(button).toBeInViewport({ ratio: 1 });
  expect(
    await dialog(page).evaluate((el) => el.scrollHeight <= el.clientHeight + 1),
  ).toBe(true);
}

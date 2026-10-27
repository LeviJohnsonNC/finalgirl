import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { test, expect, activeGame } from "../../../tests/browser/fixtures";
import { openModule } from "../../../tests/browser/play-helpers";
import { newPlayEvent, type PlayEvent } from "../../../src/lib/play/events";

const output = process.env.MODULE_REFERENCE_OUTPUT;
test.skip(
  !output,
  "Set MODULE_REFERENCE_OUTPUT to an explicit candidate directory.",
);

const observe = (
  module: "groves" | "inkanyamba",
  changes: Record<string, string | number | boolean | null>,
) => newPlayEvent({ kind: "module", moduleData: { module, changes } });

type Reference = {
  id: string;
  module?: "groves" | "inkanyamba";
  selector: string;
  reveals?: boolean;
  events?: () => PlayEvent[];
};
const references: Reference[] = [
  { id: "headers", selector: ".play-module-stack" },
  {
    id: "reveal-choices",
    module: "inkanyamba",
    selector: ".module-card-section",
    reveals: true,
  },
  {
    id: "revealed-cards",
    module: "inkanyamba",
    selector: ".module-card-section",
    reveals: true,
    events: () => [
      newPlayEvent({
        kind: "moment",
        momentType: "dark-power",
        killerCard: "Rising Dread",
        permanent: true,
        text: "Dark Power revealed",
      }),
      newPlayEvent({
        kind: "moment",
        momentType: "finale",
        killerCard: "Violent Tantrum",
        permanent: true,
        text: "Finale revealed",
      }),
    ],
  },
  { id: "minor-unknown", module: "inkanyamba", selector: ".ink-minors" },
  {
    id: "minor-active",
    module: "inkanyamba",
    selector: ".ink-minors",
    events: () => [observe("inkanyamba", { "minor.boiling-anger.health": 2 })],
  },
  {
    id: "minor-removed",
    module: "inkanyamba",
    selector: ".ink-minors",
    events: () => [observe("inkanyamba", { "minor.boiling-anger.health": 0 })],
  },
  { id: "sacred-clear", module: "groves", selector: ".groves-site-grid" },
  {
    id: "sacred-placed",
    module: "groves",
    selector: ".groves-site-grid",
    events: () => [
      observe("groves", { closed: "burial", fire: "shrine", hallowed: "holy" }),
    ],
  },
  {
    id: "sacred-combined",
    module: "groves",
    selector: ".groves-site-grid",
    events: () => [
      observe("groves", {
        closed: "burial",
        fire: "burial",
        hallowed: "burial",
      }),
    ],
  },
  { id: "terror-off", module: "groves", selector: ".groves-ongoing-terror" },
  {
    id: "terror-on",
    module: "groves",
    selector: ".groves-ongoing-terror",
    events: () => [observe("groves", { fickleness: "active" })],
  },
  {
    id: "killer-wrath-low",
    module: "inkanyamba",
    selector: ".wrath-board--killer",
  },
  {
    id: "killer-wrath-high",
    module: "inkanyamba",
    selector: ".wrath-board--killer",
    events: () => [observe("inkanyamba", { wrath: 10 })],
  },
  {
    id: "divine-wrath-high",
    module: "groves",
    selector: ".wrath-board--divine",
    events: () => [observe("groves", { wrath: 10 })],
  },
  { id: "bloodlust-quiet", selector: ".play-state--bloodlust" },
  {
    id: "bloodlust-high",
    selector: ".play-state--bloodlust",
    events: () => [
      newPlayEvent({ kind: "state", field: "bloodlust", value: 8 }),
    ],
  },
];

for (const reference of references) {
  test(reference.id, async ({ page, archive }, testInfo) => {
    await archive.install(page, {
      draft: {
        ...activeGame,
        introStory:
          "Adelaide stood at the entrance to Sacred Groves. The path ahead was quiet.",
        selection: {
          ...activeGame.selection,
          killer: "Inkanyamba",
          location: "Sacred Groves",
          finalGirl: "Adelaide",
          filmId: "s1-sacred-groves",
          startingEvent: null,
        },
        playMode: true,
        grovesSetupVersion: 1,
        inkanyambaSetupVersion: 1,
        playEvents: [
          newPlayEvent({ kind: "start", saved: 0, killed: 0, round: 1 }),
          newPlayEvent({ kind: "state", field: "bloodlust", value: 0 }),
          observe("inkanyamba", { wrath: 2 }),
          observe("groves", {
            wrath: 2,
            closed: "none",
            fire: "none",
            hallowed: "none",
            fickleness: "ended",
          }),
          ...(reference.events?.() ?? []),
        ],
      },
    });
    await page.goto("/");
    await page
      .getByRole("button", { name: "RESUME GAME", exact: true })
      .click();
    await expect(page.locator(".play-module-stack")).toBeVisible();
    if (reference.module) await openModule(page, reference.module);
    if (reference.reveals)
      await page.locator(".module-card-section > summary").click();
    const target = page.locator(reference.selector);
    await expect(target).toBeVisible();
    await target.scrollIntoViewIfNeeded();
    await page.evaluate(() => document.fonts.ready);
    await expect
      .poll(() =>
        target
          .locator("img:visible")
          .evaluateAll((images) =>
            images.every(
              (image) =>
                image instanceof HTMLImageElement &&
                image.complete &&
                image.naturalWidth > 0,
            ),
          ),
      )
      .toBe(true);
    await page.evaluate(
      () =>
        new Promise<void>((done) =>
          requestAnimationFrame(() => requestAnimationFrame(() => done())),
        ),
    );
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(page.viewportSize()!.width);
    if (testInfo.project.name !== "narrow") {
      await mkdir(resolve(output!), { recursive: true });
      await target.screenshot({
        path: resolve(output!, `${reference.id}-${testInfo.project.name}.jpg`),
        type: "jpeg",
        quality: 78,
        animations: "disabled",
        scale: "css",
        style: ".app-footer { visibility: hidden; }",
      });
    }
  });
}

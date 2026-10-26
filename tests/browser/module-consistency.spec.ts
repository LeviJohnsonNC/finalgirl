import { test, expect, activeGame, userId } from "./fixtures";
import { openModule, statusPick } from "./play-helpers";
import type { PlayEvent } from "../../src/lib/play/events";

const killers = [
  { name: "Billy the Bear", id: "billy", minor: "Backup Generator" },
  { name: "Hans", id: "hans", minor: "Unholy Rage" },
  { name: "Geppetto", id: "geppetto", minor: "Am I a Puppet?" },
];
const locations = [
  { name: "Buddyland", id: "buddyland", person: "Nick the Janitor" },
  { name: "Camp Happy Trails", id: "camp", person: "Girlfriend" },
  { name: "Carnival of Blood", id: "carnival", person: "Sibling" },
];
async function resume(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
}
const log = (page: import("@playwright/test").Page): Promise<PlayEvent[]> =>
  page.evaluate(
    (owner) =>
      JSON.parse(localStorage.getItem("final-girl-active-game-v1:" + owner)!)
        .playEvents,
    userId,
  );

for (const killer of killers)
  for (const location of locations) {
    test(`shared controls: ${killer.name} at ${location.name}`, async ({
      page,
      archive,
    }, info) => {
      await archive.install(page, {
        draft: {
          ...activeGame,
          playMode: true,
          billySetupVersion: 1,
          geppettoSetupVersion: 1,
          carnivalSetupVersion: 1,
          selection: {
            ...activeGame.selection,
            killer: killer.name,
            location: location.name,
            startingEvent: null,
          },
        },
      });
      await resume(page);
      await openModule(page, killer.id);
      await openModule(page, location.id);
      await expect(page.locator(".play-module-panel")).toHaveCount(2);
      const venue = page.locator(`[data-module="${location.id}"]`);
      if (location.id === "carnival")
        await venue
          .locator(".carnival-section > summary")
          .filter({ hasText: "People & props" })
          .click();
      await venue
        .getByRole("button", { name: `Add ${location.person}`, exact: true })
        .click();
      const person = venue
        .locator(".module-character")
        .filter({ has: page.locator("strong", { hasText: location.person }) });
      await person
        .getByRole("button", {
          name: `Mark ${location.person} saved`,
          exact: true,
        })
        .click();
      await expect(person).toHaveAttribute("data-state", "saved");
      // A portrait tap discloses corrections, never resurrects the person.
      await person
        .getByRole("button", { name: `View ${location.person}`, exact: true })
        .click();
      await expect(person).toHaveAttribute("data-state", "saved");
      await expect(
        person.getByRole("button", {
          name: `Mark ${location.person} killed`,
          exact: true,
        }),
      ).toBeDisabled();
      await statusPick(
        page,
        person.getByRole("combobox", {
          name: `${location.person} status`,
          exact: true,
        }),
        "In play",
      );
      await person
        .getByRole("button", {
          name: `Mark ${location.person} killed`,
          exact: true,
        })
        .click();
      await page.getByRole("button", { name: "Undo", exact: true }).click();
      await expect(person).toHaveAttribute(
        "data-state",
        location.id === "buddyland" ? "on-board" : "in-play",
      );
      expect(
        (await log(page)).filter(
          (event) => event.kind === "saved" || event.kind === "killed",
        ),
      ).toHaveLength(0);
      const panel = page.locator(`[data-module="${killer.id}"]`);
      if (killer.id === "geppetto")
        await panel
          .locator(".geppetto-details > summary")
          .filter({ hasText: "Minor Dark Powers" })
          .click();
      const minor = panel
        .locator(".module-minor")
        .filter({ hasText: killer.minor });
      await minor
        .getByRole("button", { name: `Reveal ${killer.minor}`, exact: true })
        .click();
      await minor
        .getByRole("button", {
          name: `Remove one ${killer.minor} health, heart 2`,
          exact: true,
        })
        .click();
      await expect(minor).toContainText("1/2 health");
      await minor
        .getByRole("button", {
          name: `Restore one ${killer.minor} health, heart 2`,
          exact: true,
        })
        .click();
      await expect(minor).toContainText("2/2 health");
      await panel.locator(".module-card-section > summary").click();
      const choice = panel
        .locator('[aria-label="Dark Power selection"] .module-card-grid button')
        .first();
      const name = await choice.locator("strong").innerText();
      await choice.click();
      await expect(panel.getByRole("region", {name:"Dark Power selection",exact:true}).locator(".module-revealed-hero h4")).toHaveText(name);
      await panel.locator(".module-card-section").screenshot({
        path: info.outputPath(`${killer.id}-${location.id}-cards.png`),
        style: ".app-footer {visibility:hidden}",
      });
      await page
        .getByRole("button", { name: "Dark Power", exact: true })
        .click();
      await expect(
        page.getByRole("combobox", { name: "Dark Power card", exact: true }),
      ).toHaveText(name);
      expect(
        (await log(page)).filter(
          (event) =>
            event.kind === "moment" && event.momentType === "dark-power",
        ),
      ).toHaveLength(1);
      await page.getByRole("button", { name: "Record", exact: true }).click();
      await page.reload();
      await resume(page);
      await openModule(page, killer.id);
      await openModule(page, location.id);
      if (killer.id === "geppetto")
        await panel
          .locator(".geppetto-details > summary")
          .filter({ hasText: "Minor Dark Powers" })
          .click();
      await expect(minor).toContainText("2/2 health");
      if (location.id === "carnival")
        await venue
          .locator(".carnival-section > summary")
          .filter({ hasText: "People & props" })
          .click();
      await expect(person).toHaveAttribute(
        "data-state",
        location.id === "buddyland" ? "on-board" : "in-play",
      );
      await panel.locator(".module-card-section > summary").click();
      for (const width of [1366, 390, 320]) {
        await page.setViewportSize({ width, height: 768 });
        await page.evaluate(() => document.fonts.ready);
        const clipped = await panel
          .locator(
            ".module-card-grid .play-tile-caption:visible,.module-minor-art h3:visible",
          )
          .evaluateAll((nodes) =>
            nodes
              .map((element) => {
                const title = element.querySelector("strong") ?? element;
                const tile =
                  element.closest("button") ?? element.parentElement!;
                const textBounds = element.getBoundingClientRect(),
                  tileBounds = tile.getBoundingClientRect();
                return {
                  name: title.textContent,
                  width: title.clientWidth,
                  needed: title.scrollWidth,
                  top: textBounds.top - tileBounds.top,
                  bottom: tileBounds.bottom - textBounds.bottom,
                };
              })
              .filter(
                (bounds) =>
                  bounds.needed > bounds.width + 1 ||
                  bounds.top < -1 ||
                  bounds.bottom < -1,
              ),
          );
        expect(clipped).toEqual([]);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
        for (const control of await page
          .locator(
            ".module-character :is(button,summary):visible,.module-minor :is(button,summary):visible",
          )
          .all()) {
          expect((await control.boundingBox())!.height).toBeGreaterThanOrEqual(
            44,
          );
        }
      }
      await page.setViewportSize({
        width: info.project.name === "mobile" ? 390 : 1366,
        height: 768,
      });
      await person.screenshot({
        path: info.outputPath(`${killer.id}-${location.id}-character.png`),
        style: ".app-footer {visibility:hidden}",
      });
      await minor.screenshot({
        path: info.outputPath(`${killer.id}-${location.id}-minor.png`),
        style: ".app-footer {visibility:hidden}",
      });
    });
  }

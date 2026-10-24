import { test, expect, activeGame, userId } from "./fixtures";
import { openModule } from "./play-helpers";

const log = (page: import("@playwright/test").Page) =>
  page.evaluate(
    (owner) =>
      JSON.parse(localStorage.getItem("final-girl-active-game-v1:" + owner)!)
        .playEvents,
    userId,
  );
test("imported Buddyland and Billy references are searchable in the owned Rulebook", async ({
  page,
  archive,
}, info) => {
  archive.films = ["s4-buddyland"];
  await archive.install(page);
  await page.goto("/");
  await page.getByRole("button", { name: "Rules", exact: true }).click();
  const search = page.getByRole("textbox", {
    name: "Search rules",
    exact: true,
  });
  for (const [term, expected, id] of [
    ["Sing-A-Long", "Sing-A-Long", "location-buddyland-rules"],
    ["Janitor's Mop", "Janitor’s Mop", "location-buddyland-rules"],
    ["Janitor’s Mop", "Janitor’s Mop", "location-buddyland-rules"],
    ["It's Showtime!", "It’s Showtime!", "killer-billy-the-bear-rules"],
    ["Merciless Minions", "Merciless Minions", "killer-billy-the-bear-rules"],
    ["Backup Generator", "Backup Generator", "killer-billy-the-bear-rules"],
  ]) {
    await search.fill(term);
    await expect(page.locator("#" + id)).toContainText(expected);
  }
  await page.screenshot({ path: info.outputPath("parity-rulebook.png") });
});

test("Camp Rules and active reminders remain readable and never record observations", async ({
  page,
  archive,
}, info) => {
  await archive.install(page, {
    draft: {
      ...activeGame,
      playMode: true,
      selection: {
        ...activeGame.selection,
        killer: "Billy the Bear",
        startingEvent: "Clingy Campers",
      },
    },
  });
  await page.goto("/");
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await openModule(page, "camp");
  await openModule(page, "billy");
  const camp = page.locator('[data-module="camp"]');
  const billy = page.locator('[data-module="billy"]');
  await expect(billy.locator(":scope > summary")).toContainText(
    "Buddies not recorded",
  );
  await expect(camp.locator(".module-active-reminder")).toContainText(
    "lose 1 Health per additional save",
  );
  const before = await log(page);
  const event = camp
    .locator('[data-module-control="event"]')
    .filter({ has: page.locator("strong", { hasText: "Clingy Campers" }) });
  await event.locator(".module-card-rules > summary").click();
  await expect(event.locator(".module-card-rules")).toContainText("one Health");
  const person = camp
    .locator('[data-module-control="character"]')
    .filter({ has: page.locator("strong", { hasText: "Girlfriend" }) });
  await person.locator(".module-card-rules > summary").click();
  await expect(person.locator(".module-card-rules")).toContainText(
    "increase Horror by five",
  );
  expect(await log(page)).toEqual(before);
  for (const [width, height] of [
    [1280, 640],
    [1366, 768],
    [1440, 900],
    [320, 568],
    [390, 844],
  ]) {
    await page.setViewportSize({ width, height });
    await camp.screenshot({
      path: info.outputPath(`parity-camp-${width}.png`),
      style: ".app-footer{visibility:hidden}",
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});

test("Buddyland character Rules disclose without status changes or victim totals", async ({
  page,
  archive,
}, info) => {
  await archive.install(page, {
    draft: {
      ...activeGame,
      playMode: true,
      selection: {
        ...activeGame.selection,
        killer: "Geppetto",
        location: "Buddyland",
        startingEvent: "Nick the Janitor",
      },
    },
  });
  await page.goto("/");
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await openModule(page, "buddyland");
  const venue = page.locator('[data-module="buddyland"]');
  const before = await log(page);
  const nick = venue
    .locator('[data-module-control="character"]')
    .filter({ has: page.locator("strong", { hasText: "Nick the Janitor" }) });
  await nick.locator(".module-card-rules > summary").click();
  await expect(nick).toHaveAttribute("data-state", "on-board");
  await expect(nick.locator(".module-card-rules")).toContainText("next Upkeep");
  expect(await log(page)).toEqual(before);
  await nick.screenshot({ path: info.outputPath("parity-nick-rules.png") });
});

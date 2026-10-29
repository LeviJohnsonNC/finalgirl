import { test, expect, activeGame, userId } from "./fixtures";
import { openModule, undoLatestObservation } from "./play-helpers";
import { newPlayEvent } from "../../src/lib/play/events";
import type { Page } from "@playwright/test";

const draft = (killer: string, value = 0) => ({
  ...activeGame,
  playMode: true,
  inkanyambaSetupVersion: 1,
  grovesSetupVersion: 1,
  selection: { ...activeGame.selection, killer, startingEvent: null },
  playEvents: [
    newPlayEvent({ kind: "start", saved: 0, killed: 0, round: 1 }),
    newPlayEvent({ kind: "state", field: "bloodlust", value }),
  ],
});
async function resume(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
}

for (const [killer, maximum] of [
  ["Hans", 10],
  ["Dr. Fright", 9],
  ["Inkanyamba", 8],
  ["Geppetto", 8],
  ["Poltergeist", 8],
  ["Billy the Bear", 10],
] as const) {
  test(`${killer}: every Bloodlust position has a loaded photograph; lowering, Undo and reload preserve the observed value`, async ({
    page,
    archive,
  }, info) => {
    if (killer === 'Hans') test.setTimeout(90000);
    await archive.install(page, { draft: draft(killer) });
    await resume(page);
    const card = page.locator(".play-state--bloodlust");
    const image = card.locator("img");
    const sources: string[] = [];
    for (let value = 0; value <= maximum; value++) {
      if (value)
        await page
          .getByRole("button", { name: "Increase Bloodlust", exact: true })
          .click();
      await expect(
        card.getByRole("button", { name: "Set Bloodlust", exact: true }),
      ).toHaveText(String(value));
      await expect(image).toHaveJSProperty("complete", true);
      expect(
        await image.evaluate((el: HTMLImageElement) => el.naturalWidth),
      ).toBe(768);
      sources.push((await image.getAttribute("src"))!);
      if(killer==='Hans'){
        for(const [width,height] of [[1280,640],[1366,768],[1440,900],[1024,768],[390,844],[320,568]]){
          await page.setViewportSize({width,height});
          expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
          await image.evaluate(async (node:HTMLImageElement)=>{await node.decode();});
          expect(await image.evaluate((node:HTMLImageElement)=>node.naturalHeight)).toBe(512);
          if (value >= 9) {
            // Reviewed lunar-face bounds in the source: preserve the entire face,
            // including its forehead, in narrow cards and wide two-column layouts.
            const visible = await image.evaluate((node:HTMLImageElement) => {
              const frame = node.parentElement!.getBoundingClientRect();
              const scale = Math.max(frame.width/node.naturalWidth, frame.height/node.naturalHeight);
              const left = (frame.width-node.naturalWidth*scale)/2;
              return { left:left+.55*node.naturalWidth*scale, right:left+.78*node.naturalWidth*scale,
                top:.02*node.naturalHeight*scale, bottom:.36*node.naturalHeight*scale,
                width:frame.width, height:frame.height, position:getComputedStyle(node).objectPosition };
            });
            expect(visible.position).toBe('50% 0%');
            expect(visible.left).toBeGreaterThanOrEqual(0);
            expect(visible.right).toBeLessThanOrEqual(visible.width);
            expect(visible.top).toBeGreaterThanOrEqual(0);
            expect(visible.bottom).toBeLessThanOrEqual(visible.height);
          }
          await card.screenshot({path:info.outputPath(`bloodlust-${value}-${width}.png`),style:'.app-footer{visibility:hidden}'});
        }
      }
    }
    expect(new Set(sources).size).toBe(maximum + 1);
    await expect(card).toHaveAttribute("data-bloodlust-stage", "10");
    await page
      .getByRole("button", { name: "Decrease Bloodlust", exact: true })
      .click();
    await expect(image).toHaveAttribute("src", sources[maximum - 1]);
    await undoLatestObservation(page);
    await expect(image).toHaveAttribute("src", sources[maximum]);
    await page.reload();
    await page
      .getByRole("button", { name: "RESUME GAME", exact: true })
      .click();
    await expect(
      card.getByRole("button", { name: "Set Bloodlust", exact: true }),
    ).toHaveText(String(maximum));
    await expect(image).toHaveAttribute("src", sources[maximum]);
    if (killer === "Hans") {
      for (const width of [1366, 390, 320]) {
        await page.setViewportSize({
          width,
          height: width === 1366 ? 768 : 844,
        });
        await card.screenshot({
          path: info.outputPath(`bloodlust-high-${width}.png`),
          style: ".app-footer{visibility:hidden}",
        });
      }
    }
  });
}

test("legacy Bloodlust remains exact, unknown stays untracked, and rejected saves do not advance the photograph", async ({
  page,
  archive,
}, info) => {
  await archive.install(page, { draft: draft("Inkanyamba", 99) });
  await resume(page);
  const card = page.locator(".play-state--bloodlust");
  await expect(
    card.getByRole("button", { name: "Set Bloodlust", exact: true }),
  ).toHaveText("99");
  await expect(card).toHaveAttribute("data-bloodlust-stage", "10");
  await page
    .getByRole("button", { name: "Stop tracking Bloodlust", exact: true })
    .click();
  await expect(card).toHaveAttribute("data-bloodlust-stage", "unknown");
  await page
    .getByRole("button", { name: "Track Bloodlust", exact: true })
    .click();
  await expect(card).toHaveAttribute("data-bloodlust-stage", "0");
  for (const width of [1366, 390, 320]) {
    await page.setViewportSize({ width, height: width === 1366 ? 768 : 844 });
    await card.screenshot({
      path: info.outputPath(`bloodlust-quiet-${width}.png`),
      style: ".app-footer{visibility:hidden}",
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  const before = await page.evaluate(
    (owner) => localStorage.getItem("final-girl-active-game-v1:" + owner),
    userId,
  );
  const src = await card.locator("img").getAttribute("src");
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key.startsWith("final-girl-active-game-v1:"))
        throw new DOMException("Full", "QuotaExceededError");
      return original.call(this, key, value);
    };
  });
  await page
    .getByRole("button", { name: "Increase Bloodlust", exact: true })
    .click();
  await expect(card).toHaveAttribute("data-bloodlust-stage", "0");
  await expect(card.locator("img")).toHaveAttribute("src", src!);
  expect(
    await page.evaluate(
      (owner) => localStorage.getItem("final-girl-active-game-v1:" + owner),
      userId,
    ),
  ).toBe(before);
});

test("Inkanyamba's five photographic Wrath stages fit their controls without changing the location's Wrath", async ({
  page,
  archive,
}, info) => {
  await archive.install(page, {
    draft: {
      ...draft("Inkanyamba"),
      selection: {
        ...activeGame.selection,
        killer: "Inkanyamba",
        location: "Sacred Groves",
        startingEvent: null,
      },
    },
  });
  await resume(page);
  await openModule(page, "inkanyamba");
  await openModule(page, "groves");
  const killer = page.locator(".wrath-board--killer");
  const divine = page.locator(".wrath-board--divine");
  const locationSource = await divine.locator("img").getAttribute("src");
  const photographs = new Set<string>();
  for (const value of [1, 3, 5, 7, 9]) {
    await killer
      .getByRole("button", {
        name: `Set Killer Wrath to ${value}`,
        exact: true,
      })
      .click();
    await expect(killer.locator("img")).toHaveJSProperty("complete", true);
    expect(
      await killer
        .locator("img")
        .evaluate((el: HTMLImageElement) => el.naturalWidth),
    ).toBe(1600);
    photographs.add((await killer.locator("img").getAttribute("src"))!);
    await expect(divine.locator("img")).toHaveAttribute("src", locationSource!);
    for (const width of [1366, 390, 320]) {
      await page.setViewportSize({ width, height: width === 1366 ? 768 : 844 });
      await killer.screenshot({
        path: info.outputPath(`wrath-${value}-${width}.png`),
        style: ".app-footer{visibility:hidden}",
      });
    }
  }
  expect(photographs.size).toBe(5);
});

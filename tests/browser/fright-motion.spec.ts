import { test, expect } from "./fixtures";
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

test.use({ video: "on" });

// Record successful interactions too: still frames cannot establish drag quality.
test.describe("Boiler Room direct manipulation", () => {
  async function gesture(page: Page, touch: boolean) {
    const stage = dialog(page).locator(".boiler-stage");
    await stage.scrollIntoViewIfNeeded();
    const cover = stage.locator(".boiler-cover");
    const b = (await cover.boundingBox())!;
    const start = { x: b.x + b.width / 2, y: b.y + b.height / 2 };
    const client = touch ? await page.context().newCDPSession(page) : null;
    await stage.evaluate((el) =>
      el.addEventListener(
        "pointerdown",
        (event) => {
          (el as HTMLElement).dataset.qaPointer = String(
            (event as PointerEvent).pointerId,
          );
        },
        { once: true },
      ),
    );
    if (client)
      await client.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ ...start, id: 1 }],
      });
    else {
      await page.mouse.move(start.x, start.y);
      await page.mouse.down();
    }
    await expect(stage).toHaveAttribute("data-phase", "dragging");
    return {
      stage,
      cover,
      b,
      move: async (x: number, y: number) => {
        if (client)
          await client.send("Input.dispatchTouchEvent", {
            type: "touchMove",
            touchPoints: [{ x: start.x + x, y: start.y + y, id: 1 }],
          });
        else await page.mouse.move(start.x + x, start.y + y, { steps: 5 });
      },
      up: async () => {
        if (client) {
          await client.send("Input.dispatchTouchEvent", {
            type: "touchEnd",
            touchPoints: [],
          });
          await client.detach();
        } else await page.mouse.up();
      },
      cancel: async () => {
        if (client) {
          await client.send("Input.dispatchTouchEvent", {
            type: "touchCancel",
            touchPoints: [],
          });
          await client.detach();
        } else {
          await stage.dispatchEvent("pointercancel", {
            pointerId: Number(await stage.getAttribute("data-qa-pointer")),
            isPrimary: true,
          });
          await page.mouse.up();
        }
      },
    };
  }

  for (const direction of ["up", "down", "left", "right"]) {
    test(`${direction} follows the native pointer before release and commits one concealed-safe reveal`, async ({
      page,
      archive,
    }, info) => {
      await archive.install(page, { draft });
      await resume(page);
      await panel(page)
        .getByRole("button", { name: /Enter the Boiler Room/ })
        .click();
      const stage = dialog(page).locator(".boiler-stage");
      await expect(stage.locator(".boiler-cover image")).toHaveAttribute(
        "href",
        /awake-back/,
      );
      if (direction === "down")
        await page.screenshot({
          path: info.outputPath("boiler-premium-awake.png"),
        });
      await dialog(page)
        .getByRole("button", { name: "Record Final Girl Asleep", exact: true })
        .click();
      await expect(stage.locator(".boiler-cover image")).toHaveAttribute(
        "href",
        /asleep-back/,
      );
      const before = await log(page);
      const frame = await stage
        .locator("svg.boiler-tableau")
        .getAttribute("viewBox");
      const g = await gesture(page, info.project.name === "mobile");
      const dx =
        direction === "left"
          ? -g.b.width * 0.35
          : direction === "right"
            ? g.b.width * 0.35
            : 0;
      const dy =
        direction === "up"
          ? -g.b.height * 0.35
          : direction === "down"
            ? g.b.height * 0.35
            : 0;
      await g.move(dx, dy);
      const moving = (await g.cover.boundingBox())!;
      expect(Math.abs(moving.x - g.b.x - dx)).toBeLessThan(3);
      expect(Math.abs(moving.y - g.b.y - dy)).toBeLessThan(3);
      expect(
        await stage.locator("svg.boiler-tableau").getAttribute("viewBox"),
      ).toBe(frame);
      expect(await log(page)).toEqual(before);
      await expect(
        stage.locator(".boiler-card-layer:not(.boiler-cover), .boiler-doctor"),
      ).toHaveCount(0);
      if (direction === "down")
        await page.screenshot({
          path: info.outputPath("boiler-premium-mid-drag.png"),
        });
      await g.up();
      if (direction === "down" || direction === "right") {
        await expect(stage.locator(".boiler-doctor--entering")).toHaveCount(1);
        await expect(dialog(page)).toContainText("Dr. Fright attacks.");
      }
      await expect(stage).toHaveAttribute("data-phase", "idle");
      expect((await log(page)).length).toBe(before.length + 1);
      await expect(
        stage.locator(".boiler-card-layer:not(.boiler-cover)"),
      ).toHaveCount(1);
      await footerVisible(page);
      await page.screenshot({
        path: info.outputPath(`boiler-premium-${direction}.png`),
      });
      const committed = await log(page);
      await dialog(page)
        .getByRole("button", { name: "Back to game", exact: true })
        .click();
      await panel(page)
        .getByRole("button", { name: /Continue Boiler Room/ })
        .click();
      await expect(
        dialog(page).locator(".boiler-doctor--entering"),
      ).toHaveCount(0);
      expect(await log(page)).toEqual(committed);
    });
  }

  test("short, canceled, capture-lost, resized and closed gestures do not write or expose a card", async ({
    page,
    archive,
  }, info) => {
    await archive.install(page, { draft });
    await resume(page);
    await enter(page);
    const before = await log(page);
    const stage = dialog(page).locator(".boiler-stage");
    for (const cancel of [
      "short",
      "escape",
      "capture",
      "cancel",
      "resize",
      "close",
    ]) {
      const g = await gesture(page, info.project.name === "mobile");
      await g.move(0, cancel === "short" ? 5 : g.b.height * 0.35);
      if (cancel === "escape") await page.keyboard.press("Escape");
      if (cancel === "capture")
        await stage.evaluate((el) =>
          el.releasePointerCapture(
            Number((el as HTMLElement).dataset.qaPointer),
          ),
        );
      if (cancel === "resize")
        await page.setViewportSize({ width: 390, height: 760 });
      if (cancel === "close") {
        await dialog(page)
          .getByRole("button", { name: "Back to game", exact: true })
          .focus();
        await page.keyboard.press("Enter");
      }
      if (cancel === "cancel") await g.cancel();
      else await g.up();
      if (cancel === "close")
        await panel(page)
          .getByRole("button", { name: /Continue Boiler Room/ })
          .click();
      await expect(stage).toHaveAttribute("data-phase", "idle");
      expect(await log(page), cancel).toEqual(before);
      await expect(
        stage.locator(".boiler-card-layer:not(.boiler-cover), .boiler-doctor"),
      ).toHaveCount(0);
    }
    await page.evaluate(() => {
      const original = Storage.prototype.setItem;
      Object.assign(window, {
        restoreDragStorage: () => {
          Storage.prototype.setItem = original;
        },
      });
      Storage.prototype.setItem = function (key, value) {
        if (key.startsWith("final-girl-active-game-v1:"))
          throw new Error("Full");
        return original.call(this, key, value);
      };
    });
    const failed = await gesture(page, info.project.name === "mobile");
    await failed.move(0, failed.b.height * 0.35);
    await failed.up();
    await expect(dialog(page).getByRole("alert")).toContainText(
      "could not be saved",
    );
    await expect(stage).toHaveAttribute("data-phase", "idle");
    expect(await log(page)).toEqual(before);
    await expect(stage.locator(".boiler-doctor")).toHaveCount(0);
    await page.evaluate(() =>
      (
        window as unknown as { restoreDragStorage: () => void }
      ).restoreDragStorage(),
    );
    await slide(page, "down");
    expect((await log(page)).length).toBe(before.length + 1);
  });

  test("reduced motion keeps direct dragging and keyboard reveal without pop animation", async ({
    page,
    archive,
  }, info) => {
    await page.setViewportSize(
      info.project.name === "mobile"
        ? { width: 320, height: 568 }
        : { width: 1280, height: 640 },
    );
    await page.emulateMedia({ reducedMotion: "reduce" });
    await archive.install(page, { draft });
    await resume(page);
    await enter(page);
    const before = await log(page);
    const g = await gesture(page, info.project.name === "mobile");
    await g.move(0, -g.b.height * 0.35);
    expect((await g.cover.boundingBox())!.y).toBeLessThan(g.b.y - 5);
    expect(await log(page)).toEqual(before);
    await g.up();
    await expect(g.stage).toHaveAttribute("data-phase", "idle");
    const target = dialog(page).locator(".boiler-stage");
    await target.focus();
    await page.keyboard.press("ArrowUp");
    await expect(g.stage).toHaveAttribute("data-phase", "idle");
    expect((await log(page)).length).toBe(before.length + 2);
    await expect(g.stage.locator(".boiler-doctor--entering")).toHaveCount(0);
  });
});

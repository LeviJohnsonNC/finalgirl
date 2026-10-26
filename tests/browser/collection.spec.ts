import { test, expect, activeGame } from "./fixtures";

test("collection Back returns through its real origin, including the theater", async ({
  page,
  archive,
}) => {
  await archive.install(page);
  await page.goto("/");
  await page.getByRole("button", { name: "Collection", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "MY COLLECTION" }),
  ).toBeVisible();
  await page
    .locator("footer")
    .getByRole("button", { name: "Back", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "START THE TAPE" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Stats", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "STATS", exact: true }),
  ).toBeVisible();
  await page
    .locator("footer")
    .getByRole("button", { name: "COLLECTION", exact: true })
    .click();
  // Selecting the current destination again must not create a self-return loop.
  await page
    .locator("footer")
    .getByRole("button", { name: "COLLECTION", exact: true })
    .click();
  await page
    .locator("footer")
    .getByRole("button", { name: "Back", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "STATS", exact: true }),
  ).toBeVisible();
  await page
    .locator("footer")
    .getByRole("button", { name: "Back", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "START THE TAPE" }),
  ).toBeVisible();
  expect(archive.calls).toEqual([]);
});

test("returning from collection preserves a live game and its recorded count", async ({
  page,
  archive,
}) => {
  await archive.install(page, {
    draft: {
      ...activeGame,
      playMode: true,
      playEvents: [
        {
          id: "33333333-3333-4333-8333-333333333333",
          at: 1,
          kind: "start",
          round: 3,
          saved: 2,
          killed: 1,
        },
      ],
    },
  });
  await page.goto("/");
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Save one victim" }),
  ).toBeVisible();
  await page
    .locator("footer")
    .getByRole("button", { name: "COLLECTION", exact: true })
    .click();
  await page
    .locator("footer")
    .getByRole("button", { name: "Back", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Save one victim" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Next round" }).locator("strong"),
  ).toHaveText("3");
  expect(archive.calls).toEqual([]);
});

test("module cards show the supplied Buddyland cover, blurb and complete cast on small screens", async ({
  page,
  archive,
}, testInfo) => {
  archive.films.push("s4-buddyland");
  await archive.install(page);
  await page.goto("/");
  await page.getByRole("button", { name: "Collection", exact: true }).click();
  const card = page.locator(".collection-film").filter({
    has: page.getByRole("heading", {
      name: "Bad Times at Buddyland",
      exact: true,
    }),
  });
  await card.scrollIntoViewIfNeeded();
  await expect(card.getByText(/The party is over/)).toBeVisible();
  for (const name of ["Billy the Bear", "Buddyland"])
    await expect(
      card.locator(".collection-cast").getByText(name, { exact: true }),
    ).toBeVisible();
  for (const name of ["Rena", "Gwynn"])
    await expect(
      card.getByRole("button", { name: `View ${name} info`, exact: true }),
    ).toBeVisible();
  const cover = card.getByRole("img", {
    name: "Bad Times at Buddyland box art",
    exact: true,
  });
  await expect
    .poll(() => cover.evaluate((image: HTMLImageElement) => image.naturalWidth))
    .toBeLessThanOrEqual(288);
  await expect(cover).toHaveAttribute("src", /\.webp$/);
  await expect
    .poll(() =>
      cover.evaluate(
        (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
      ),
    )
    .toBe(true);
  await expect(card.getByRole("switch")).toBeChecked();
  await page.screenshot({
    path: testInfo.outputPath("collection-buddyland.png"),
    fullPage: false,
  });
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
  expect(archive.calls).toEqual([]);
});

test("illustrated shelf covers the catalog and opens truthful character details", async ({
  page,
  archive,
}) => {
  await archive.install(page);
  await page.goto("/");
  await page.getByRole("button", { name: "Collection", exact: true }).click();
  await expect(page.locator(".collection-film")).toHaveCount(23);
  await expect(page.locator(".collection-girl-link")).toHaveCount(39);
  await expect(page.locator("[data-coming-soon=true]")).toHaveCount(2);
  for (const upcoming of await page.locator("[data-coming-soon=true]").all()) {
    await expect(upcoming.getByRole("switch")).toBeDisabled();
    await expect(upcoming.locator(".collection-girl-link")).toHaveCount(0);
    await expect(upcoming).toContainText("Cast and setting to be announced");
  }
  const vignette = page.locator('[data-film-id="s1-terror-from-above"]');
  await expect(vignette.locator(".collection-girl-link")).toHaveCount(1);
  await expect(vignette).toContainText("Your choice");
  for (const name of ["Kenzie", "Julie", "Meghan", "Ronda", "Melanie"]) {
    const trigger = page.getByRole("button", {
      name: `View ${name} info`,
      exact: true,
    });
    await trigger.click();
    const dialog = page.getByRole("dialog");
    await expect(
      dialog.getByRole("heading", { name, exact: true }),
    ).toBeVisible();
    if (name !== "Melanie")
      await expect(
        dialog.getByText("Details aren’t available yet.", { exact: true }),
      ).toBeVisible();
    else
      await expect(
        dialog.getByRole("region", { name: "Melanie backstory" }),
      ).toBeVisible();
    await expect(dialog.locator(".girl-reference")).toHaveCount(0);
    await dialog.getByRole("button", { name: "Close", exact: true }).click();
    await expect(trigger).toBeFocused();
  }
  expect(archive.itemReads).toEqual([]);
  expect(archive.calls).toEqual([]);
});

test("cover and portrait failures leave cards usable and reload restores artwork", async ({
  page,
  archive,
}) => {
  await archive.install(page);
  let fail = true;
  await page.route(/\/assets\/(happy-trails-.*|laurie-.*)\.webp$/, (route) =>
    fail ? route.abort() : route.continue(),
  );
  await page.goto("/");
  await page.getByRole("button", { name: "Collection", exact: true }).click();
  const card = page.locator('[data-film-id="s1-camp-happy-trails"]');
  await card.evaluate((el) => el.scrollIntoView({ block: "center" }));
  await expect(
    card.getByText("Cover unavailable", { exact: true }),
  ).toBeVisible();
  await expect(card.locator(".collection-scene")).toHaveCount(0);
  await expect(
    card.getByRole("heading", { name: "The Happy Trails Horror", exact: true }),
  ).toBeVisible();
  const trigger = card.getByRole("button", {
    name: "View Laurie info",
    exact: true,
  });
  await expect(card.locator(".collection-portrait-fallback")).toHaveText("L");
  await trigger.click();
  await expect(
    page
      .getByRole("dialog")
      .getByRole("heading", { name: "Laurie", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Close", exact: true })
    .click();
  const before = await card.getByRole("switch").isChecked();
  await card.locator(".collection-ownership > span").click();
  await expect(card.getByRole("switch")).toBeChecked({ checked: !before });
  await expect
    .poll(() => archive.films.includes("s1-camp-happy-trails"))
    .toBe(!before);
  fail = false;
  await page.reload();
  await page.getByRole("button", { name: "Collection", exact: true }).click();
  await card.evaluate((el) => el.scrollIntoView({ block: "center" }));
  const cover = card.getByRole("img", {
    name: "The Happy Trails Horror box art",
    exact: true,
  });
  await expect
    .poll(() => cover.evaluate((el: HTMLImageElement) => el.naturalWidth))
    .toBeGreaterThan(0);
  await expect(card.locator(".collection-scene")).toHaveCount(1);
  await expect(card.locator(".collection-portrait-fallback")).toHaveCount(0);
});

test("ownership survives a rejected write and collection load errors keep editing disabled", async ({
  page,
  archive,
}) => {
  await archive.install(page);
  await page.goto("/");
  await page.getByRole("button", { name: "Collection", exact: true }).click();
  const card = page.locator('[data-film-id="s1-creech-manor"]');
  const toggle = card.getByRole("switch");
  await expect(toggle).toBeEnabled();
  archive.failWrites = true;
  await toggle.click();
  await expect(toggle).toBeChecked();
  await expect
    .poll(() =>
      page.evaluate(() =>
        Object.keys(localStorage).some(
          (key) =>
            key.startsWith("final-girl-collection-outbox-v1:") &&
            localStorage.getItem(key)!.includes("s1-creech-manor"),
        ),
      ),
    )
    .toBe(true);
  expect(archive.films).not.toContain("s1-creech-manor");
  archive.failWrites = false;
  await page.evaluate(() => window.dispatchEvent(new Event("online")));
  await expect.poll(() => archive.films).toContain("s1-creech-manor");
  let failLoad = true;
  await page.route("**/rest/v1/user_settings**", (route) =>
    failLoad
      ? route.fulfill({
          status: 503,
          contentType: "application/json",
          headers: { "access-control-allow-origin": "*" },
          body: JSON.stringify({ message: "Unavailable" }),
        })
      : route.fallback(),
  );
  await page.reload();
  await page.getByRole("button", { name: "Collection", exact: true }).click();
  await expect(
    page.getByText("CLOUD ARCHIVE RECONNECTING", { exact: true }),
  ).toBeVisible();
  await expect(toggle).toBeDisabled();
  await expect(toggle).toBeChecked();
  await expect(
    card.getByRole("heading", {
      name: "The Haunting of Creech Manor",
      exact: true,
    }),
  ).toBeVisible();
  failLoad = false;
  await page
    .getByRole("button", { name: "RETRY COLLECTION LOAD", exact: true })
    .click();
  await expect(toggle).toBeEnabled();
  await expect(toggle).toBeChecked();
});

test("both image preferences retain small cover and portrait derivatives", async ({
  page,
  archive,
}) => {
  archive.films.push("s4-buddyland");
  await archive.install(page);
  let ai = false;
  await page.route("**/rest/v1/user_image_settings**", (route) =>
    route.fulfill({
      contentType: "application/json",
      headers: { "access-control-allow-origin": "*" },
      body: JSON.stringify(
        route.request().headers().accept?.includes("vnd.pgrst.object")
          ? { auto_generate_images: false, use_ai_casting_art: ai }
          : [{ auto_generate_images: false, use_ai_casting_art: ai }],
      ),
    }),
  );
  await page.goto("/");
  await page.getByRole("button", { name: "Collection", exact: true }).click();
  const card = page.locator('[data-film-id="s4-buddyland"]');
  await card.evaluate((el) => el.scrollIntoView({ block: "center" }));
  const cover = card.getByRole("img", {
    name: "Bad Times at Buddyland box art",
    exact: true,
  });
  await expect
    .poll(() => cover.evaluate((el: HTMLImageElement) => el.naturalWidth))
    .toBeGreaterThan(0);
  const official = await cover.getAttribute("src");
  ai = true;
  await page.reload();
  await page.getByRole("button", { name: "Collection", exact: true }).click();
  await card.evaluate((el) => el.scrollIntoView({ block: "center" }));
  // The supplied official and AI Buddyland files are byte-identical. Vite
  // correctly deduplicates their derivatives to one URL in a production build.
  await expect(cover).toHaveAttribute("src", official!);
  await expect(cover).toHaveAttribute("src", /\.webp$/);
  for (const image of await card
    .locator(".collection-girl-portrait img")
    .all()) {
    await expect(image).toHaveAttribute("src", /\.webp$/);
    await expect
      .poll(() => image.evaluate((el: HTMLImageElement) => el.naturalWidth))
      .toBeGreaterThan(0);
    expect(
      await image.evaluate((el: HTMLImageElement) => el.naturalWidth),
    ).toBeLessThanOrEqual(256);
  }
  await expect(card.getByRole("switch")).toBeChecked();
  expect(archive.itemReads).toEqual([]);
});

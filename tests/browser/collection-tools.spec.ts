import { test, expect, userId } from "./fixtures";
test("collection tools live after the films and reset requires a fresh exact DELETE", async ({
  page,
  archive,
}) => {
  await archive.install(page);
  let deletes = 0;
  await page.route("**/rest/v1/game_history*", async (route) => {
    if (route.request().method() !== "DELETE") return route.fallback();
    expect(new URL(route.request().url()).searchParams.get("user_id")).toBe(
      `eq.${userId}`,
    );
    deletes++;
    await route.fulfill({ status: 204 });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Collection", exact: true }).click();
  const tools = page.locator(".collection-utilities");
  await expect(tools).not.toHaveAttribute("open", "");
  await expect(
    page.getByRole("button", { name: "RESET MY PLAYS", exact: true }),
  ).toBeHidden();
  expect(
    await tools.evaluate((el) =>
      Boolean(
        el.compareDocumentPosition(
          document.querySelectorAll(".collection-grid")[3],
        ) & Node.DOCUMENT_POSITION_PRECEDING,
      ),
    ),
  ).toBe(true);
  await tools.locator(":scope > summary").click();
  const reset = tools.getByRole("button", {
    name: "RESET MY PLAYS",
    exact: true,
  });
  await reset.click();
  const dialog = page.getByRole("alertdialog");
  const action = dialog.getByRole("button", {
    name: "CONFIRM RESET",
    exact: true,
  });
  await expect(action).toBeDisabled();
  await dialog.getByLabel("Type DELETE to confirm").fill("delete");
  await expect(action).toBeDisabled();
  await dialog.getByLabel("Type DELETE to confirm").fill("DELETE");
  await dialog.getByRole("button", { name: "BACK OUT", exact: true }).click();
  expect(deletes).toBe(0);
  await reset.click();
  await expect(dialog.getByLabel("Type DELETE to confirm")).toHaveValue("");
  await expect(action).toBeDisabled();
  await dialog.getByLabel("Type DELETE to confirm").fill("DELETE");
  await action.click();
  await expect(dialog).toBeHidden();
  expect(deletes).toBe(1);
});

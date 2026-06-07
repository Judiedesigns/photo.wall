const { test, expect } = require("@playwright/test");

test.beforeEach(async ({ page }) => {
  await page.goto("/index.html");
  await page.evaluate(() => {
    localStorage.clear();
    document.body.classList.remove("is-loading");
    document.getElementById("loading")?.classList.add("hidden");
  });
});

test("main UI fits the viewport", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "hang your favorite photos" })).toBeVisible();
  await expect(page.getByPlaceholder("Your name")).toBeVisible();
  await expect(page.getByPlaceholder("Why is this special?")).toBeVisible();
  await expect(page.getByRole("button", { name: "+ Add Memory" })).toBeVisible();

  const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  expect(horizontalOverflow).toBe(false);
});

test("add flow is usable on the viewport", async ({ page }) => {
  await page.getByPlaceholder("Your name").fill("Ayo");
  await page.getByPlaceholder("Why is this special?").fill("A small favorite from today.");
  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "+ Add Memory" }).click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles("bg-2.jpg");

  await expect(page.getByText("A small favorite from today.")).toBeVisible();

  const cardBox = await page.locator(".polaroid-wrap").first().boundingBox();
  const viewport = page.viewportSize();
  expect(cardBox.x).toBeGreaterThanOrEqual(0);
  expect(cardBox.x + cardBox.width).toBeLessThanOrEqual(viewport.width + 1);
});

test("add flow uses defaults when text fields are empty", async ({ page }) => {
  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "+ Add Memory" }).click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles("bg-2.jpg");

  await expect(page.getByText("favorite moment")).toBeVisible();
  await expect(page.getByText("by guest")).toBeVisible();
});

test("card viewer works", async ({ page }) => {
  await page.evaluate(() => {
    localStorage.setItem("favorite_photo_memories_v1", JSON.stringify([
      {
        id: "one",
        name: "Ayo",
        caption: "First favorite",
        photo: null,
        ts: Date.now()
      },
      {
        id: "two",
        name: "Mina",
        caption: "Second favorite",
        photo: null,
        ts: Date.now()
      }
    ]));
  });
  await page.reload();
  await page.evaluate(() => {
    document.body.classList.remove("is-loading");
    document.getElementById("loading")?.classList.add("hidden");
  });

  await page.getByText("First favorite").click();
  const dialog = page.getByRole("dialog", { name: "A favorite photo" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("by Ayo")).toBeVisible();
});

test("delete asks for confirmation", async ({ page }) => {
  await page.evaluate(() => {
    localStorage.setItem("favorite_photo_memories_v1", JSON.stringify([
      {
        id: "one",
        name: "Ayo",
        caption: "First favorite",
        photo: null,
        ts: Date.now()
      },
      {
        id: "two",
        name: "guest",
        caption: "Guest favorite",
        photo: null,
        ts: Date.now()
      }
    ]));
  });
  await page.reload();
  await page.evaluate(() => {
    document.body.classList.remove("is-loading");
    document.getElementById("loading")?.classList.add("hidden");
  });

  page.once("dialog", async dialog => {
    expect(dialog.message()).toContain("Delete Ayo's memory?");
    await dialog.dismiss();
  });
  await page.locator(".polaroid-wrap").first().hover();
  await page.getByRole("button", { name: "Delete memory by Ayo" }).click();
  await expect(page.getByText("First favorite")).toBeVisible();
  await expect(page.locator("#toast")).toHaveText("Memory kept.");

  page.once("dialog", async dialog => {
    expect(dialog.message()).toContain("Delete Ayo's memory?");
    await dialog.accept();
  });
  await page.locator(".polaroid-wrap").first().hover();
  await page.getByRole("button", { name: "Delete memory by Ayo" }).click();
  await expect(page.getByText("First favorite")).toBeHidden();
  await expect(page.locator("#toast")).toHaveText("Memory deleted.");

  page.once("dialog", async dialog => {
    expect(dialog.message()).toContain("Delete this memory?");
    await dialog.dismiss();
  });
  await page.locator(".polaroid-wrap").first().hover();
  await page.getByRole("button", { name: "Delete memory by guest" }).click();
  await expect(page.getByText("Guest favorite")).toBeVisible();
});

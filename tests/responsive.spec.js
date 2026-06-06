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
  await expect(page.getByRole("button", { name: "Hang a photo" })).toBeVisible();

  const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  expect(horizontalOverflow).toBe(false);
});

test("add flow is usable on the viewport", async ({ page }) => {
  await page.getByRole("button", { name: "Hang a photo" }).click();
  await expect(page.getByRole("dialog", { name: "Who is this from?" })).toBeVisible();

  await page.getByPlaceholder("Your name").fill("Ayo");
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByRole("heading", { name: "Add a photo" })).toBeVisible();

  await page.getByRole("button", { name: "Next" }).click();
  await page.getByPlaceholder("Write a note...").fill("A small favorite from today.");
  await page.getByRole("button", { name: "Hang photo" }).click();

  await expect(page.getByText("A small favorite from today.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Shuffle" })).toBeVisible();

  const cardBox = await page.locator(".polaroid-wrap").first().boundingBox();
  const viewport = page.viewportSize();
  expect(cardBox.x).toBeGreaterThanOrEqual(0);
  expect(cardBox.x + cardBox.width).toBeLessThanOrEqual(viewport.width + 1);
});

test("shuffle and card viewer work", async ({ page }) => {
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

  await page.getByRole("button", { name: "Shuffle" }).click();
  await expect(page.getByText("Layout shuffled.")).toBeVisible();

  await page.getByText("First favorite").click();
  await expect(page.getByRole("dialog", { name: "A favorite photo" })).toBeVisible();
  await expect(page.getByText("by Ayo")).toBeVisible();
});

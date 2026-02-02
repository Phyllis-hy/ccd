import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/api/projects/**", async (route) => {
    const url = route.request().url();
    if (url.endsWith("/api/projects/")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: { projects: [] }, error: null }),
      });
    }
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: {}, error: null }),
    });
  });
});

test("home page", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /IdeaSense\.AI/i }).first()
  ).toBeVisible();
});

test("login page", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("button", { name: /log in/i })).toBeVisible();
});

test("register page", async ({ page }) => {
  await page.goto("/register");
  await expect(page.getByRole("button", { name: /sign up/i })).toBeVisible();
});

test("stage page", async ({ page }) => {
  await page.goto("/stage");
  await expect(page.getByText(/select a project/i)).toBeVisible();
});

test("profile page", async ({ page }) => {
  await page.goto("/profile");
  await expect(
    page.getByRole("heading", { name: "Projects" })
  ).toBeVisible();
});

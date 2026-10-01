import { expect, test, type Page } from "@playwright/test";
import { catalogStates } from "../../features/ui-catalog/catalog-states";

async function prepareCatalog(page: Page, state: string) {
  await page.goto(`/ui?state=${state}`);
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: ".tempo-shell__header { position: static !important; }" });
  await expect(page.locator(`[data-catalog-state="${state}"]`)).toBeVisible();
}

test("shared UI desktop baseline", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await prepareCatalog(page, "shared-ui");

  await expect(page.locator("[data-catalog-state=shared-ui]")).toHaveScreenshot("shared-ui-desktop.png");
});

test("Kingdoms map mobile baseline", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await prepareCatalog(page, "kids-map");

  await expect(page.locator("[data-catalog-state=kids-map]")).toHaveScreenshot("kids-map-mobile.png");
});

test("adult Practice mobile baseline", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await prepareCatalog(page, "adult-practice");

  await expect(page.locator("[data-catalog-state=adult-practice]")).toHaveScreenshot("adult-practice-mobile.png");
});

test("every catalog state fits the mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  for (const state of catalogStates) {
    await prepareCatalog(page, state.id);
    const dimensions = await page.evaluate(() => ({ viewport: window.innerWidth, document: document.documentElement.scrollWidth }));
    expect(dimensions.document, state.id).toBeLessThanOrEqual(dimensions.viewport);
  }
});

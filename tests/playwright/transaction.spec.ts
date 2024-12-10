import { expect, test } from "@playwright/test";
import { installHeadlessWallet } from "../../src/installHeadlessWallet";

test.beforeEach(async ({ page }) => {
  await installHeadlessWallet({ page });
});

test("Metamask Wallet Test Dapp", async ({ page }) => {
  const baseUrl = "https://metamask.github.io/test-dapp/";
  await page.goto(baseUrl);
  await page.getByRole("button", { name: "USE HEADLESS WALLET" }).click();

  await expect(page.getByRole("heading", { name: "Active Provider" })).toBeVisible();
  await expect(page.getByText("Name: Headless Wallet")).toBeVisible();

  await page.locator("#personalSign").click();
  await expect(
    page.getByText(
      "0xc15bfe971658b5bf67da31edc7fc4906755d49f4cf29b9a74d557f88ec73a395069b934d142f63a77a0773b329c32a473492cca79feb1256f11809943ec7ff261c"
    )
  ).toBeVisible();
});
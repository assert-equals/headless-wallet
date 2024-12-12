# Headless Wallet

Web3 dApp testing with a [MetaMask](https://metamask.io/) equivalent **headless wallet**, using [Playwright](https://playwright.dev/) or [Selenium WebDriver](https://www.selenium.dev/) —no extension popups

## Features

- Create comprehensive E2E tests for your dApps, including real blockchain transactions
- All wallet actions are pre-approved by default, eliminating the need for user interaction
- All wallet interactions are headless, meaning, no user interaction is required. You should be testing your dApp, not the wallet

## Quickstart

### Install

```shell
npm install -D @assert-equals/headless-wallet
```

### Playwright Example

```ts
import { test } from "@playwright/test";
import { HeadlessWalletServer, installHeadlessWallet } from "@assert-equals/headless-wallet";

let server: HeadlessWalletServer;

test.beforeEach(async ({ page }) => {
  // MetaMask test seed https://github.com/MetaMask/metamask-extension/blob/v12.8.1/test/e2e/seeder/ganache.ts
  const mnemonic: string = "phrase upgrade clock rough situate wedding elder clever doctor stamp excess tent";
  const port: number = 8001;
  server = new HeadlessWalletServer({ mnemonic, port });
  await server.start();
  await installHeadlessWallet({ page, port });
});

test.afterEach(async () => {
  await server.stop();
});

test("Metamask Wallet Test Dapp", async ({ page }) => {
  await page.goto("https://metamask.github.io/test-dapp/");
  await expect(page.getByText("Name: Headless Wallet")).toBeVisible();
});
```

### WebDriver Example

```ts
import { HeadlessWalletServer, installHeadlessWallet } from "@assert-equals/headless-wallet";
import { Builder, Browser, WebDriver, By, until } from "selenium-webdriver";
import { Options } from "selenium-webdriver/chrome";

(async function test() {
  const server: HeadlessWalletServer = new HeadlessWalletServer({ mnemonic: "" });
  await server.start();
  const options: Options = new Options();
  options.enableBidi();
  let driver: WebDriver = await new Builder().forBrowser(Browser.CHROME).setChromeOptions(options).build();
  try {
    await installHeadlessWallet({ driver });
    await driver.get("https://metamask.github.io/test-dapp/");
    const providerName = await driver.findElement(By.css("#activeProviderName"));
    await driver.wait(until.elementTextContains(providerName, "Headless Wallet"), 1000);
  } finally {
    await driver.quit();
    await server.stop();
  }
})();
```

> **Note:** This setup will execute actual transactions on the blockchain without user intervention using the provided Mnemonic Phrase.

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
### Example
```ts
import { test } from "@playwright/test";
import { installHeadlessWallet } from "@assert-equals/headless-wallet";
import { mnemonicToAccount } from "viem/accounts";
import { http } from "viem";
import { sepolia } from "viem/chains";

test.beforeEach(async ({ page }) => {
  await installHeadlessWallet({
    page,
    account: mnemonicToAccount(
      "phrase upgrade clock rough situate wedding elder clever doctor stamp excess tent", // MetaMask test seed https://github.com/MetaMask/metamask-extension/blob/v12.8.1/test/e2e/seeder/ganache.ts
    ),
    defaultChain: sepolia,
    transports: { [sepolia.id]: http() },
  });
});

test("Your Test", async ({ page }) => {
  await page.getByRole("button", { name: "Log In" }).click();
  await page.getByRole("button", { name: "Choose Wallet" }).click();
  await page.getByRole("menuitem", { name: "Headless Wallet" }).click();
});
```
> **Note:** This setup will execute actual transactions on the blockchain without user intervention using the provided Mnemonic Phrase.

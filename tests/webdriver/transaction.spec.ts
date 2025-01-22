import { HeadlessWalletServer, setupHeadlessWallet } from "../../src";
import { Builder, Browser, WebDriver, By, until } from "selenium-webdriver";
import { Options } from "selenium-webdriver/chrome";

(async function example() {
  const server: HeadlessWalletServer = new HeadlessWalletServer({ mnemonic: "" });
  await server.start();
  const options = new Options();
  options.enableBidi();
  let driver: WebDriver = await new Builder().forBrowser(Browser.CHROME).setChromeOptions(options).build();
  try {
    await setupHeadlessWallet({ driver });
    const baseUrl = "https://metamask.github.io/test-dapp/";
    await driver.get(baseUrl);

    const useHeadlessWallet = await driver.findElement(By.css("#provider button"));
    await useHeadlessWallet.click();

    const activeProviderName = await driver.findElement(By.css("#activeProviderName"));
    await driver.wait(until.elementTextContains(activeProviderName, "Headless Wallet"), 1000);

    // const personalSign = await driver.findElement(By.css("#personalSign"));
    // await personalSign.click();

    // const personalSignResult = await driver.findElement(By.css("#personalSignResult"));
    // await driver.wait(until.elementTextContains(personalSignResult, "0x"), 1000);
  } finally {
    await driver.quit();
    await server.stop();
  }
})();

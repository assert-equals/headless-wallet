import { installHeadlessWallet } from "../../src/installHeadlessWallet";
import { Builder, Browser, WebDriver, By, until } from "selenium-webdriver";
import { Options } from "selenium-webdriver/chrome";

(async function example() {
  const options = new Options();
  options.enableBidi();
  let driver: WebDriver = await new Builder().forBrowser(Browser.CHROME).setChromeOptions(options).build();
  try {
    await installHeadlessWallet({ driver });
    const baseUrl = "https://metamask.github.io/test-dapp/";
    await driver.get(baseUrl);

    const useHeadlessWallet = await driver.findElement(By.css("#provider button"));
    await useHeadlessWallet.click();

    const activeProviderName = await driver.findElement(By.css("#activeProviderName"));
    await driver.wait(until.elementTextContains(activeProviderName, "Headless Wallet"), 1000);

    const personalSign = await driver.findElement(By.css("#personalSign"));
    await personalSign.click();

    const personalSignResult = await driver.findElement(By.css("#personalSignResult"));
    await driver.wait(
      until.elementTextContains(
        personalSignResult,
        "0xc15bfe971658b5bf67da31edc7fc4906755d49f4cf29b9a74d557f88ec73a395069b934d142f63a77a0773b329c32a473492cca79feb1256f11809943ec7ff261c"
      ),
      1000
    );
  } finally {
    await driver.quit();
  }
})();

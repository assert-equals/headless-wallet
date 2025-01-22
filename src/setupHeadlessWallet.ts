import { BrowserContext, Page } from "@playwright/test";
import { WebDriver } from "selenium-webdriver";
import ScriptManager from "selenium-webdriver/bidi/scriptManager";

declare global {
  interface Window {
    wallet: any;
    eip1193Request: any;
    eip1193Port: any;
  }
}

export const setupHeadlessWallet = async ({
  page,
  browserContext,
  driver,
  port = 3000
}: {
  page?: Page;
  browserContext?: BrowserContext;
  driver?: WebDriver;
  port?: number;
}) => {
  if (browserContext) {
    browserContext.addInitScript((port: number) => {
      window.eip1193Port = port;
    }, port);
    browserContext.addInitScript(injectedWalletProvider);
  } else if (page) {
    page.addInitScript((port: number) => {
      window.eip1193Port = port;
    }, port);
    page.addInitScript(injectedWalletProvider);
  } else if (driver) {
    const handle: string = await driver.getWindowHandle();
    const manager = await ScriptManager(handle, driver as any);
    await manager.addPreloadScript(`window.eip1193Port = '${port}'` as any);
    const script: any = injectedWalletProvider.toString();
    await manager.addPreloadScript(script);
  }
};

const injectedWalletProvider = () => {
  window.wallet = {
    request: async ({ method, params }: { method: string; params?: Array<unknown> }) => {
      const response = await fetch(`http://localhost:${window.eip1193Port}/api`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method, params })
      });
      return await response.json();
    }
  };

  window.eip1193Request = async ({ method, params }: { method: string; params?: Array<unknown> }) => {
    return await window.wallet.request({
      method,
      params
    });
  };

  const announceHeadlessWallet = () => {
    const provider = {
      isMetaMask: true,
      request: async (request: { method: string; params?: Array<unknown> }) => {
        return await window.eip1193Request({
          ...request
        });
      },
      on: () => {},
      removeListener: () => {}
    };

    const info = {
      uuid: "c71651cf-45b8-4b6e-8b6f-e4d0e0b6609d",
      name: "Headless Wallet",
      icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><text x='50%' y='50%' font-size='72' text-anchor='middle' alignment-baseline='central' fill='black'>🕹️</text></svg>",
      rdns: "com.assertequals.headless-wallet"
    };

    const detail = { info, provider };
    const announceEvent = new CustomEvent("eip6963:announceProvider", {
      detail: Object.freeze(detail)
    });
    window.dispatchEvent(announceEvent);
  };

  announceHeadlessWallet();

  window.addEventListener("eip6963:requestProvider", () => {
    announceHeadlessWallet();
  });

  window.addEventListener("DOMContentLoaded", () => {
    announceHeadlessWallet();
  });
};

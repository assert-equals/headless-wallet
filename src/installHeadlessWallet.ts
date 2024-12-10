import ScriptManager from "selenium-webdriver/bidi/scriptManager";

declare global {
  interface Window {
    wallet: any;
    eip1193Request: any;
  }
}

export async function installHeadlessWallet({ ...params }) {
  let context: any;
  if ("browserContext" in params) {
    context = params.browserContext;
    context.addInitScript(injectedWalletProvider);
  } else if ("page" in params) {
    context = params.page;
    context.addInitScript(injectedWalletProvider);
  } else if ("driver" in params) {
    context = params.driver;
    const handle: string = await context.getWindowHandle();
    const manager = await ScriptManager(handle, context);
    const script: any = injectedWalletProvider.toString();
    await manager.addPreloadScript(script);
  }
}

function injectedWalletProvider() {
  window.wallet = {
    request: async ({ method, params }: { method: string; params?: Array<unknown> }) => {
      const response = await fetch(`http://localhost:3000/api`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method, params })
      });
      return await response.json();
    }
  };

  window.eip1193Request = async function eip1193Request({
    method,
    params
  }: {
    method: string;
    params?: Array<unknown>;
  }) {
    return await window.wallet.request({
      method,
      params
    });
  };

  function announceHeadlessWallet() {
    const provider = {
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
  }

  announceHeadlessWallet();

  window.addEventListener("eip6963:requestProvider", () => {
    announceHeadlessWallet();
  });

  window.addEventListener("DOMContentLoaded", () => {
    announceHeadlessWallet();
  });
}

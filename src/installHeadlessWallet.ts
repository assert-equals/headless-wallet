import type { BrowserContext, Page } from "@playwright/test";
import fs from "fs";

const wallet = {
  request: async ({ method, params }) => {
    const response = await fetch(`http://localhost:3000/api`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method, params })
    });
    return await response.json();
  }
};

export async function installHeadlessWallet({ ...params }: { page: Page } | { browserContext: BrowserContext }) {
  const browserOrPage = "browserContext" in params ? params.browserContext : params.page;

  // Connecting the browser context to the Node.js playwright context
  await browserOrPage.exposeFunction("eip1193Request", eip1193Request);

  const base64Icon = fs.readFileSync("src/assets/joystick.png", "base64");
  const icon = `data:image/png;base64,${base64Icon}`;

  await browserOrPage.addInitScript(
    ({ icon }) => {
      // This function needs to be declared in the browser context
      function announceHeadlessWallet() {
        const provider = {
          request: async (request) => {
            return await eip1193Request({
              ...request,
              icon
            });
          },
          on: () => {},
          removeListener: () => {}
        };

        const info = {
          uuid: "c71651cf-45b8-4b6e-8b6f-e4d0e0b6609d",
          name: "Headless Wallet",
          icon,
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
    },
    { icon }
  );
}

async function eip1193Request({ method, params }: { method: string; params?: Array<unknown> }) {
  return await wallet.request({
    method,
    params
  });
}

import type { BrowserContext, Page } from "@playwright/test";
import { Wallet, createWallet } from "./createWallet";
import { Chain, LocalAccount, Transport } from "viem";
import { randomUUID } from "crypto";
import fs from "fs";

let wallets: Map<string, Wallet> = new Map();

export async function installHeadlessWallet({
  ...params
}: ({ page: Page } | { browserContext: BrowserContext }) &
  (
    | {
        account: LocalAccount;
        transports?: Record<number, Transport>;
        defaultChain?: Chain;
      }
    | {
        wallet: Wallet;
      }
  )) {
  const browserOrPage = "browserContext" in params ? params.browserContext : params.page;

  const wallet: Wallet =
    "wallet" in params ? params.wallet : createWallet(params.account, params.transports, params.defaultChain);

  // Connecting the browser context to the Node.js playwright context
  await browserOrPage.exposeFunction("eip1193Request", eip1193Request);

  // Everytime we call installHeadlessWallet, we create a new uuid to identify the wallet.
  const uuid = randomUUID();
  wallets.set(uuid, wallet);
  const base64Icon = fs.readFileSync("src/assets/joystick.png", "base64");
  const icon = `data:image/png;base64,${base64Icon}`;

  await browserOrPage.addInitScript(
    ({ uuid, icon }) => {
      // This function needs to be declared in the browser context
      function announceHeadlessWallet() {
        const provider = {
          request: async (request) => {
            return await eip1193Request({
              ...request,
              uuid,
              icon
            });
          },
          on: () => {},
          removeListener: () => {}
        };

        const info = {
          uuid,
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
    { uuid, icon }
  );
}

async function eip1193Request({ method, params, uuid }: { method: string; params?: Array<unknown>; uuid: string }) {
  const wallet = wallets.get(uuid);
  if (wallet == null) throw new Error("Account or transport not found");
  return await wallet.request({
    method,
    params
  });
}

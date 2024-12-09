import type { BrowserContext, Page } from "@playwright/test";
import { Wallet, createWallet } from "./createWallet";
import { Chain, LocalAccount, Transport } from "viem";
import { randomUUID } from "crypto";
import fs from "fs";

let wallets: Map<string, Wallet> = new Map();

export async function installHeadlessWallet({
  debug,
  ...params
}: {
  debug?: boolean;
} & ({ page: Page } | { browserContext: BrowserContext }) &
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
  const browserOrPage =
    "browserContext" in params ? params.browserContext : params.page;

  const wallet: Wallet =
    "wallet" in params
      ? params.wallet
      : createWallet(params.account, params.transports, params.defaultChain);

  // Connecting the browser context to the Node.js playwright context
  await browserOrPage.exposeFunction("eip1193Request", eip1193Request);

  // Everytime we call installMockWallet, we create a new uuid to identify the wallet.
  const uuid = randomUUID();
  wallets.set(uuid, wallet);
  const base64Icon = fs.readFileSync('src/assets/joystick.png', 'base64')
  const icon = `data:image/png;base64,${base64Icon}`;

  await browserOrPage.addInitScript(
    ({ uuid, icon, debug }) => {
      // This function needs to be declared in the browser context
      function announceMockWallet() {
        const provider: EIP1193Provider = {
          request: async (request) => {
            return await eip1193Request({
              ...request,
              uuid,
              icon,
              debug,
            });
          },
          on: () => {},
          removeListener: () => {},
        };

        const info: EIP6963ProviderInfo = {
          uuid,
          name: "Headless Wallet",
          icon,
          rdns: "com.assertequals.headless-wallet",
        };

        const detail: EIP6963ProviderDetail = { info, provider };
        const announceEvent = new CustomEvent("eip6963:announceProvider", {
          detail: Object.freeze(detail),
        });
        window.dispatchEvent(announceEvent);
      }

      announceMockWallet();

      window.addEventListener("eip6963:requestProvider", () => {
        announceMockWallet();
      });

      window.addEventListener("DOMContentLoaded", () => {
        announceMockWallet();
      });
    },
    { uuid, icon, debug },
  );
}

interface EIP6963ProviderInfo {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
}

interface EIP1193Provider {
  request: (request: {
    method: string;
    params?: Array<unknown>;
  }) => Promise<unknown>; // Standard method for sending requests per EIP-1193
  on: () => void;
  removeListener: () => void;
}

export interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo;
  provider: EIP1193Provider;
}

async function eip1193Request({
  method,
  params,
  uuid,
  icon,
  debug,
}: {
  method: string;
  params?: Array<unknown>;
  uuid: string;
  icon: string;
  debug?: boolean;
}) {
  const wallet = wallets.get(uuid);
  if (wallet == null) throw new Error("Account or transport not found");

  try {
    const result = await wallet.request({
      method,
      params,
    });

    if (debug === true) {
      console.log(
        "WALLET",
        uuid.substring(0, 8),
        "REQUEST",
        method,
        params,
        "RESULT",
        result,
      );
    }
    return result;
  } catch (e) {
    if (debug === true) {
      console.log(
        "WALLET",
        uuid.substring(0, 8),
        "REQUEST",
        method,
        params,
        "ERROR",
        e,
      );
    }
    throw e;
  }
}

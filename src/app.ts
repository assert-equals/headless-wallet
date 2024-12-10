import express from "express";
import cors from "cors";
import { createWalletClient, http } from "viem";
import { mnemonicToAccount } from "viem/accounts";
import { getChainById } from "./utils";

async function walletActions(client: any, method: string, params?: Array<unknown>) {
  switch (method) {
    case "eth_accounts":
      return await client.getAddresses();
    case "eth_requestAccounts":
      return await client.requestAddresses();
    case "personal_sign":
      return await client.account.signMessage({
        message: {
          raw: params?.[0]
        }
      });
    default:
      return await client.request({
        method,
        params
      });
  }
}

const createApp = (mnemonic: string, chain: number) => {
  const app = express();

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(cors());

  app.post("/api", async (req, res) => {
    const { method, params } = req.body;
    console.log(`[JSON-RPC]: Request ${JSON.stringify(req.body)}`);
    let result: any;
    const account = mnemonicToAccount(mnemonic);
    const client = createWalletClient({ account, chain: getChainById(chain), transport: http() });
    try {
      result = await walletActions(client, method, params);
      console.log(`[JSON-RPC]: Result ${JSON.stringify(result)}`);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error });
    }
  });

  return app;
};
export default createApp;

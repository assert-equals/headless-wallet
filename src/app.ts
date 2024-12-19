import express from "express";
import cors from "cors";
import { createWalletClient, http } from "viem";
import { english, generateMnemonic, mnemonicToAccount } from "viem/accounts";
import { getChainById } from "./utils";

const walletActions = async (client: any, method: string, params?: Array<unknown>) => {
  switch (method) {
    case "eth_accounts":
      return await client.getAddresses();
    case "eth_requestAccounts":
      return await client.requestAddresses();
    case "eth_sendTransaction": {
      const { data, to, value } = params?.[0] as any;
      return await client.sendTransaction({
        data,
        to,
        value
      });
    }
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
};

const createApp = (mnemonic: string, chain: number) => {
  const app = express();
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(cors());

  mnemonic = mnemonic || generateMnemonic(english);
  const account = mnemonicToAccount(mnemonic);
  const client = createWalletClient({ account, chain: getChainById(chain), transport: http() });

  app.post("/api", async (req, res) => {
    const { method, params } = req.body;
    let result: any;
    try {
      result = await walletActions(client, method, params);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error });
    }
  });

  return app;
};
export default createApp;

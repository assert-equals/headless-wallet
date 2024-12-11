import createApp from "./app";
import http, { Server } from "http";

export class HeadlessWalletServer {
  private server: Server;
  private mnemonic: string;
  private chain: number;
  private port: number;

  constructor({ mnemonic, chain = 11_155_111, port = 3000 }: { mnemonic: string; chain?: number; port?: number }) {
    this.mnemonic = mnemonic;
    this.chain = chain;
    this.port = port;
    this.server = http.createServer(createApp(this.mnemonic, this.chain));
  }

  start(): Promise<void> {
    return new Promise((resolve) => {
      this.server.listen(this.port, () => {
        resolve();
      });
    });
  }

  stop(): Promise<void> {
    return new Promise((resolve) => {
      this.server.close(() => {
        resolve();
      });
    });
  }
}

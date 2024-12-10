import createApp from "./app";
import http from "http";

// MetaMask test seed https://github.com/MetaMask/metamask-extension/blob/v12.8.1/test/e2e/seeder/ganache.ts
const mnemonic = "phrase upgrade clock rough situate wedding elder clever doctor stamp excess tent";
const chain = 11_155_111;
const port = 3000;

const server = http.createServer(createApp(mnemonic, chain));

server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

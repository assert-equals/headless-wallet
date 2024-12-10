import { type Chain } from "viem";
import * as chains from "viem/chains";

export function getChainById(id: number): Chain {
  return Object.values(chains).find((chain) => chain.id === id) ?? chains.mainnet;
}

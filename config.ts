import { baseSepolia } from "viem/chains";
import {
  http,
  custom,
  createPublicClient,
  createWalletClient,
  Address,
} from "viem";
 
export const chain = baseSepolia;
export const chainId = baseSepolia.id;
 
export const publicClient = createPublicClient({
  // this will determine which chain to interact with
  chain: baseSepolia,
  transport: http(),
});
 
export const walletClient = createWalletClient({
  chain: baseSepolia,
  transport: custom(window.ethereum!),
});
 
const [minterAccount] = (await walletClient.getAddresses()) as [Address];
 
export { minterAccount };
// lib/wagmi.ts
import { http, createConfig } from "wagmi";
import { baseSepolia, base } from "wagmi/chains";

export const config = createConfig({
    chains: [baseSepolia, base],
    multiInjectedProviderDiscovery: false,
    ssr: true,
    transports: {
        [baseSepolia.id]: http(),
        [base.id]: http(),

    },
});

declare module "wagmi" {
    interface Register {
        config: typeof config;
    }
}

"use client";

import { getCsrfToken, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { DynamicContextProvider, DynamicWidget } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";
import { createConfig, WagmiProvider, useAccount } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http } from "viem";
import {  baseSepolia } from "viem/chains";

const config = createConfig({
  chains: [ baseSepolia ],
  multiInjectedProviderDiscovery: false,
  transports: {
    [baseSepolia.id]: http(),
  },
});

const queryClient = new QueryClient();

export default function ProviderWrapper({ 
  children 
}: React.PropsWithChildren) {
  const router = useRouter();
  return (
    <DynamicContextProvider
      settings={{
        environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID || '',
        walletConnectors: [EthereumWalletConnectors],
        eventsCallbacks: {
          onAuthSuccess: async (event) => {
            const { authToken } = event;

            const csrfToken = await getCsrfToken();

            fetch("/api/auth/callback/credentials", {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: `csrfToken=${encodeURIComponent(
                csrfToken
              )}&token=${encodeURIComponent(authToken)}`,
            })
              .then((res) => {
                if (res.ok) {
                  console.log('LOGGED IN', res);
                  // Redirect to Dashboard
                  router.push('/dashboard');
                } else {
                  // Handle any errors - maybe show an error message to the user
                  console.error("Failed to log in");
                  router.push('/');
                }
              })
              .catch((error) => {
                // Handle any exceptions
                console.error("Error logging in", error);
              });
          },
        },
      }}
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <DynamicWagmiConnector>
            {children}
          </DynamicWagmiConnector>
        </QueryClientProvider>
      </WagmiProvider>
    </DynamicContextProvider>
  );
}

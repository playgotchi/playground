"use client";

import { getCsrfToken, getSession } from "next-auth/react";

import { DynamicContextProvider } from "@/lib/dynamic";
import { EthereumWalletConnectors } from "@/lib/dynamic";
import { useRouter } from "next/navigation";
;

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
      {children}
    </DynamicContextProvider>
  );
}
import "./globals.css"
import type { Metadata } from "next"
import { Fragment_Mono } from "next/font/google"
import { DynamicContextProvider, DynamicWagmiConnector } from "../lib/dynamic";
import { Providers } from "./WagmiProvider";

const fragment = Fragment_Mono({
  subsets: ["latin"],
  weight: "400",
})

export const metadata: Metadata = {
  title: "Playground by Playgocthi",
  description:
    "Welcome to Playground by Playgotchi where communites play together",
}

export default function RootLayout({ children }: {
    children: React.ReactNode;
    }) {
    return (
        <html lang="en">
        <DynamicContextProvider
            settings={{
            environmentId: "XXXXX",
            }}
        >
            <Providers>
            <DynamicWagmiConnector>
                <body className={fragment.className}>{children}</body>
            </DynamicWagmiConnector>
            </Providers>
        </DynamicContextProvider>
        </html>
    );
}
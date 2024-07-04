import "./globals.css"
import type { Metadata } from "next"
import { Fragment_Mono } from "next/font/google"
import ProviderWrapper from "@/components/dynamic-wrapper"

const fragment = Fragment_Mono({
  subsets: ["latin"],
  weight: "400",
})

export const metadata: Metadata = {
  title: "Playground by Playgotchi",
  description: "Welcome to Playground—where onchain communities play together.",
  openGraph: {
    title: "Playground by Playgotchi",
    description: "Welcome to Playground—where onchain communities play together.",
    images: [
      {
        url: "https://playground.playgotchi.com/playgotchi-social.png",
        width: 1200,
        height: 630,
        alt: "Playground by Playgotchi",
      },
    ],
  },
};

export default function RootLayout({ children }: React.PropsWithChildren) {
  return (
    <html lang="en">
      <ProviderWrapper>
        <body className={fragment.className}>
          {children}
        </body>
      </ProviderWrapper>
    </html>
  )
}

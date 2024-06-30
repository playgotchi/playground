import "./globals.css"
import type { Metadata } from "next"
import { Fragment_Mono } from "next/font/google"
import ProviderWrapper from "@/components/dynamic-wrapper"

const fragment = Fragment_Mono({
  subsets: ["latin"],
  weight: "400",
})

export const metadata: Metadata = {
  title: "Playground by Playgocthi",
  description:
    "Welcome to Playground by Playgotchi where communites play together",
}

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

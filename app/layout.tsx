import "./globals.css"
import type { Metadata } from "next"
import { Fragment_Mono } from "next/font/google"
import ProviderWrapper from "@/components/dynamic-wrapper"
import { ThemeProvider } from "@/components/theme-provider"

const fragment = Fragment_Mono({
  subsets: ["latin"],
  weight: "400",
})

export const metadata: Metadata = {
  title: "Playground by Playgotchi",
  description:
    "Welcome to Playground by Playgotchi where communities play together",
}

export default function RootLayout({ children }: React.PropsWithChildren) {

  return (
    <html lang="en" suppressHydrationWarning>
      <ProviderWrapper>
        <body className={fragment.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </body>
      </ProviderWrapper>
    </html>
  )
}
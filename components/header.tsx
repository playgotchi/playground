"use client";
import { DynamicWidget, useIsLoggedIn } from "@/lib/dynamic";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { Info } from "lucide-react";
import { Hint } from "./hint";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";

export default function Header() {
  const isLoggedIn = useIsLoggedIn();
  const { theme } = useTheme();
  
  const pathname = usePathname();

  return (
    <header className="flex justify-center">
      <div className="flex items-center justify-between w-full max-w-7xl p-8 mx-auto sm:px-6">
        <Link href="/">
          <Image
          key={theme}
            src={theme === 'light' ? "/logo-black.png" : "/logo.png"}
            alt={"Playground logo"}
            width={220}
            height={40}
            className="animate-pulse transition-all hover:cursor-py-cursor-hover active:cursor-py-cursor-press"
          />
        </Link>
        <div className="flex items-center gap-4">
        {isLoggedIn && pathname !== '/dashboard' && (
            <Link href="/dashboard">
              <Button variant={'primary'}>Dashboard</Button>
            </Link>
          )}
          {!isLoggedIn && (
            <Hint side="left" label={"Login with email or Farcaster is enabled for allowlisted emails and FIDs"}>
              <Info size={24} />
          </Hint>
          )}
          <DynamicWidget />
      </div>
      </div>
    </header>
  );
}

"use client";
import { DynamicWidget, useIsLoggedIn } from "@/lib/dynamic";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";

export default function Header() {
  const isLoggedIn = useIsLoggedIn();

  return (
    <header className="sticky flex justify-center bg-background">
      <div className="flex items-center justify-between w-full max-w-7xl p-8 mx-auto sm:px-6">
        <Link href="/">
          <Image
            src="/logo.png"
            alt={"Playground logo"}
            width={240}
            height={40}
            className="animate-pulse transition-all hover:cursor-py-cursor-hover active:cursor-py-cursor-press"
          />
        </Link>
        <div className="flex items-center gap-4">
        {isLoggedIn && (
            <Link href="/dashboard">
              <Button variant={'primary'}>Dashboard</Button>
            </Link>
          )}
          <DynamicWidget />
      </div>
      </div>
    </header>
  );
}

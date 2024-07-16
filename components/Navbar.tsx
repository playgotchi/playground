"use client";

import Image from "next/image";
import { memo } from "react";

import { navElements } from "@/constants";
import { ActiveElement, NavbarProps } from "@/types/type";
import ActiveUsers from "@/components/users/ActiveUsers";

import { Button } from "./ui/button";
import ShapesMenu from "./ShapesMenu";
import Link from "next/link";
import { DynamicWidget } from "@/lib/dynamic";
import { NewThread } from "./comments/NewThread";
import { ModeToggle } from "./mode-toggle";
import { useTheme } from "next-themes";


const Navbar = ({ activeElement, imageInputRef, handleImageUpload, handleActiveElement }: NavbarProps) => {
  const isActive = (value: string | Array<ActiveElement>) =>
    (activeElement && activeElement.value === value) ||
    (Array.isArray(value) && value.some((val) => val?.value === activeElement?.value));

  const { theme } = useTheme(); 

  return (
    <nav className="flex select-none items-center justify-between gap-4 bg-background px-5 text-primary border-b border-dotted border-neutral-700">
      <Link href="/dashboard">
          <Image src={theme === 'light' ? "/logo-black.png" : "/logo.png"}
           alt="Playground" width={200} height={67} className="animate-pulse transition-transform"/>
      </Link>

      <ul className="flex flex-row">
        {navElements.map((item: ActiveElement | any) => (
          <li
            key={item.name}
            onClick={() => {
              if (Array.isArray(item.value)) return;
              handleActiveElement(item);
            }}
            className={`group px-2.5 py-5 flex justify-center items-center text-foreground
            ${isActive(item.value) ? "bg-accent/20" : "hover:bg-primary-grey-200"}
            `}
          >
            {Array.isArray(item.value) ? (
              <ShapesMenu
              item={item}
              activeElement={activeElement}
              imageInputRef={imageInputRef}
              handleActiveElement={handleActiveElement}
              handleImageUpload={handleImageUpload}
              />
            ) : item?.value === "comments" ? (
              // If value is comments, trigger the NewThread component
              <NewThread>
                <Button className="relative w-5 h-5 object-contain">
                  <Image
                    src={item.icon}
                    alt={item.name}
                    fill
                    className={isActive(item.value) ? "invert" : ""}
                  />
                </Button>
              </NewThread>
            ) : (
              <Button className="relative w-5 h-5 object-contain">
                <Image
                  src={item.icon}
                  alt={item.name}
                  fill
                  className={isActive(item.value) ? "invert" : ""}
                />
              </Button>
            )}
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-4">
        <ActiveUsers />
        <DynamicWidget />
        <ModeToggle />
      </div>
    </nav>
  );
};

export default memo(Navbar, (prevProps, nextProps) => prevProps.activeElement === nextProps.activeElement);

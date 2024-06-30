"use client";

import Image from "next/image";
import { useState } from "react";
import { fabric } from "fabric";
import { v4 as uuidv4 } from "uuid";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Button } from "./ui/button";

interface Sticker {
  name: string;
  value: string;
  icon: string;
}

interface StickerMenuProps {
  canvas: fabric.Canvas;
}

const StickerMenu = ({ canvas }: StickerMenuProps) => {
  const [activeSticker, setActiveSticker] = useState<Sticker | null>(null);
  const [stickers] = useState<Sticker[]>([
    { name: 'Sticker 1', value: 'sticker1', icon: '/stickers/base-logo-sticker-1.png' },
    { name: 'Sticker 2', value: 'sticker2', icon: '/stickers/base-logo-sticker-2.png' },
    // Add more stickers here
  ]);

  const handleAddImageToCanvas = (sticker: Sticker) => {
    fabric.Image.fromURL(sticker.icon, (img) => {
      if (img) {
        img.set({
          left: 100, // Set default position
          top: 100,
          fill: '#aabbcc',
          // Type assertion to include custom property
          objectId: uuidv4(),
        } as fabric.IObjectOptions & { objectId: string });

        canvas.add(img);
        canvas.renderAll();
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="no-ring">
        <Button className="relative h-5 w-5 object-contain">
          <Image
            src={activeSticker ? activeSticker.icon : "/icons/default-icon.png"}
            alt={activeSticker ? activeSticker.name : "Select Sticker"}
            fill
            className={activeSticker ? "invert" : ""}
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="mt-5 flex flex-col gap-y-1 border-none bg-primary-black py-4 text-white">
        {stickers.map((sticker) => (
          <Button
            key={sticker.name}
            onClick={() => {
              setActiveSticker(sticker);
              handleAddImageToCanvas(sticker);
            }}
            className={`flex h-fit justify-between gap-10 rounded-none px-5 py-3 focus:border-none ${
              activeSticker?.value === sticker.value ? "bg-primary-purple" : "hover:bg-primary-grey-200"
            }`}
          >
            <div className="group flex items-center gap-2">
              <Image
                src={sticker.icon}
                alt={sticker.name}
                width={20}
                height={20}
                className={activeSticker?.value === sticker.value ? "invert" : ""}
              />
              <p
                className={`text-sm ${
                  activeSticker?.value === sticker.value ? "text-primary-black" : "text-white"
                }`}
              >
                {sticker.name}
              </p>
            </div>
          </Button>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default StickerMenu;




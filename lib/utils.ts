
import { twMerge } from "tailwind-merge";
import { type ClassValue, clsx } from "clsx";

const adjectives = [
  "Happy",
  "Creative",
  "Energetic",
  "Lively",
  "Dynamic",
  "Radiant",
  "Joyful",
  "Vibrant",
  "Cheerful",
  "Sunny",
  "Sparkling",
  "Bright",
  "Shining",
];

const animals = [
  "Dolphin",
  "Tiger",
  "Elephant",
  "Penguin",
  "Kangaroo",
  "Panther",
  "Lion",
  "Cheetah",
  "Giraffe",
  "Hippopotamus",
  "Monkey",
  "Panda",
  "Crocodile",
];

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateRandomName(): string {
  const randomAdjective =
    adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomAnimal = animals[Math.floor(Math.random() * animals.length)];

  return `${randomAdjective} ${randomAnimal}`;
}

export const getShapeInfo = (shapeType: string) => {
  switch (shapeType) {
    case "rect":
      return {
        icon: "/assets/rectangle.svg",
        name: "Rectangle",
      };

    case "circle":
      return {
        icon: "/assets/circle.svg",
        name: "Circle",
      };

    case "triangle":
      return {
        icon: "/assets/triangle.svg",
        name: "Triangle",
      };

    case "line":
      return {
        icon: "/assets/line.svg",
        name: "Line",
      };

    case "i-text":
      return {
        icon: "/assets/text.svg",
        name: "Text",
      };

    case "image":
      return {
        icon: "/assets/image.svg",
        name: "Image",
      };

    case "freeform":
      return {
        icon: "/assets/freeform.svg",
        name: "Free Drawing",
      };

    default:
      return {
        icon: "/assets/rectangle.svg",
        name: shapeType,
      };
  }
};

// onchain summer

export const onChainStickerOptions = [
  { value: "image1", src: "/stickerpack/base-logo-sticker-1.png", width: 40, height: 40, alt: '' },
  { value: "image2", src: "/stickerpack/Based-sticker.png", width: 40, height: 40, alt: '' },
  { value: "image3", src: "public/stickers/Based-sticker-1.png", width: 40, height: 40, alt: '' },
  { value: "image4", src: "/stickerpack/base-logo-sticker-2.png", width: 40, height: 40, alt: '' },
  { value: "image5", src: "/images/image1.png", width: 40, height: 40, alt: '' },
  { value: "image6", src: "/images/image1.png", width: 40, height: 40, alt: '' },
  { value: "image7", src: "/images/image1.png", width: 40, height: 40, alt: '' },
  { value: "image8", src: "/images/image1.png", width: 40, height: 40, alt: '' },
  { value: "image9", src: "/images/image1.png", width: 40, height: 40, alt: '' },
  { value: "image10", src: "/images/image1.png", width: 40, height: 40, alt: '' },
  { value: "image11", src: "/images/image1.png", width: 40, height: 40, alt: '' },
  { value: "image12", src: "/images/image1.png", width: 40, height: 40, alt: '' },
  { value: "image12", src: "/images/image1.png", width: 40, height: 40, alt: '' },
  { value: "image9", src: "/images/image1.png", width: 40, height: 40, alt: '' },
  { value: "image10", src: "/images/image1.png", width: 40, height: 40, alt: '' },
  { value: "image11", src: "/images/image1.png", width: 40, height: 40, alt: '' },
  { value: "image12", src: "/images/image1.png", width: 40, height: 40, alt: '' },
  { value: "image12", src: "/images/image1.png", width: 40, height: 40, alt: '' },
];
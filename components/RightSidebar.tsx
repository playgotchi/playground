import React, { useMemo, useRef } from "react";

import { RightSidebarProps } from "@/types/type";
import { bringElement, modifyShape } from "@/lib/shapes";

import Text from "./settings/Text";
import Color from "./settings/Color";
import MintButton from "./settings/Export";
import Dimensions from "./settings/Dimensions";

const RightSidebar = ({
  elementAttributes,
  setElementAttributes,
  fabricRef,
  activeObjectRef,
  isEditingRef,
  syncShapeInStorage,
}: RightSidebarProps) => {
  const colorInputRef = useRef(null);
  const strokeInputRef = useRef(null);

  const handleInputChange = (property: string, value: string) => {
    if (!isEditingRef.current) isEditingRef.current = true;

    setElementAttributes((prev) => ({ ...prev, [property]: value }));

    modifyShape({
      canvas: fabricRef.current as fabric.Canvas,
      property,
      value,
      activeObjectRef,
      syncShapeInStorage,
    });
  };
  
  // memoize the content of the right sidebar to avoid re-rendering on every mouse actions
  const memoizedContent = useMemo(
    () => (
      <section className="flex flex-col border-primary-grey-200 border-l border-dotted border-slate-700 text-white max-w-72 min-w-[280px] sticky right-0 h-full max-sm:hidden select-none pb-[100px] overflow-y-auto">
        <h3 className=" px-5 pt-4 text-xs uppercase mt-3">Design</h3>
        {/* <Dimensions
          isEditingRef={isEditingRef}
          width={elementAttributes.width}
          height={elementAttributes.height}
          handleInputChange={handleInputChange}
        /> */}

        <Text
          fontFamily={elementAttributes.fontFamily}
          fontSize={elementAttributes.fontSize}
          fontWeight={elementAttributes.fontWeight}
          handleInputChange={handleInputChange}
        />

        <Color
          inputRef={colorInputRef}
          attribute={elementAttributes.fill}
          placeholder="color"
          attributeType="fill"
          handleInputChange={handleInputChange}
        />

        {/* <Color
          inputRef={strokeInputRef}
          attribute={elementAttributes.stroke}
          placeholder="stroke"
          attributeType="stroke"
          handleInputChange={handleInputChange}
        /> */}

        <MintButton />
        <div className="text-xs text-primary-purple mt-3 p-4 px-5 border-b border-t border-slate-700">
          <h3 className='text-[10px] uppercase'>Tips</h3>
          <span>Press / to chat with your cursor
          Press e to use emoji reactions
          Press escape to close chat</span>
        </div>
      </section>
    ),
    [elementAttributes]
  ); // only re-render when elementAttributes changes

  return memoizedContent;
};

export default RightSidebar;
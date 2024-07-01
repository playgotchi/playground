import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface HintProps {
  label: string;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  alignOffset?: number;
}

export const Hint = ({
  label,
  children,
  side,
  align,
  sideOffset,
  alignOffset,
}: HintProps) => {
  return (
      <TooltipProvider>
      <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
              {children}
          </TooltipTrigger>
          <TooltipContent className="text-black bg-teal-200 border-teal-300" 
              side={side} 
              align={align} 
              sideOffset={sideOffset} 
              alignOffset={alignOffset}
          >
              <p className=" capitalize">{label}</p>
          </TooltipContent>
      </Tooltip>
  </TooltipProvider>
  )
};
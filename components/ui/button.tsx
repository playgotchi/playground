import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-brand text-brand-foreground hover:bg-primary/90 hover:cursor-py-cursor-hover active:cursor-py-cursor-press",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:cursor-py-cursor-hover active:cursor-py-cursor-press",
        outline:
          "border border-input bg-background text-primary hover:bg-accent hover:text-accent-foreground hover:cursor-py-cursor-hover active:cursor-py-cursor-press",
        secondary:
          "border border-brand text-primary hover:bg-brand/20 hover:cursor-py-cursor-hover w-full hover:cursor-py-cursor-hover active:cursor-py-cursor-press",
        ghost: "hover:bg-accent hover:text-accent-foreground active:cursor-py-cursor-press",
        link: "text-primary underline-offset-4 underline hover:underline hover:cursor-py-cursor-hover active:cursor-py-cursor-press",
        primary: "bg-brand text-brand-foreground hover:bg-brand/60 w-full hover:cursor-py-cursor-hover active:cursor-py-cursor-press",
        social: "bg-black border border-border-color text-white  w-full hover:cursor-py-cursor-hover active:cursor-py-cursor-press",
        shapes: "text-primary hover:cursor-py-cursor-hover active:cursor-py-cursor-press",
      },
      size: {
        default: "h-10 px-4 py-2 rounded-none",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

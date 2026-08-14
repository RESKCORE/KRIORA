import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#FF5A36] text-white shadow-2xs hover:bg-[#FF5A36]/90",
        secondary:
          "border-transparent bg-slate-100 text-slate-700 hover:bg-slate-200",
        destructive:
          "border-rose-200/80 bg-rose-50 text-rose-700",
        outline: "text-slate-700 border-slate-200",
        success:
          "border-emerald-200/80 bg-emerald-50 text-emerald-700",
        warning:
          "border-amber-200/80 bg-amber-50 text-amber-700",
        info:
          "border-blue-200/80 bg-blue-50 text-blue-700",
        orange:
          "border-orange-200/80 bg-orange-50 text-[#FF5A36]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export type BadgeProps = React.ComponentProps<"div"> & VariantProps<typeof badgeVariants>

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

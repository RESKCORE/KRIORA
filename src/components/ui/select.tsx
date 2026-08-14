import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

export type NativeSelectProps = React.ComponentProps<"select"> & {
  label?: string
}

function Select({ className, children, ...props }: NativeSelectProps) {
  return (
    <div className="relative inline-block w-full">
      <select
        data-slot="select"
        className={cn(
          "h-8 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-1 pr-8 text-xs font-semibold text-slate-700 shadow-2xs outline-none transition-colors hover:border-slate-300 focus:border-slate-400 focus:ring-1 focus:ring-slate-300 disabled:pointer-events-none disabled:opacity-50",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
    </div>
  )
}

export { Select }

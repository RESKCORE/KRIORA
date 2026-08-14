import * as React from "react"
import { cn } from "@/lib/utils"

export type AvatarProps = React.ComponentProps<"div"> & {
  size?: "sm" | "default" | "lg"
}

function Avatar({ className, size = "default", ...props }: AvatarProps) {
  const sizeClasses = {
    sm: "h-7 w-7 text-[10px]",
    default: "h-9 w-9 text-xs",
    lg: "h-12 w-12 text-sm",
  }

  return (
    <div
      data-slot="avatar"
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100",
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
}

export type AvatarImageProps = React.ComponentProps<"img">

function AvatarImage({
  className,
  alt = "",
  ...props
}: AvatarImageProps) {
  return (
    <img
      data-slot="avatar-image"
      alt={alt}
      className={cn("aspect-square h-full w-full object-cover", className)}
      {...props}
    />
  )
}

export type AvatarFallbackProps = React.ComponentProps<"div">

function AvatarFallback({
  className,
  ...props
}: AvatarFallbackProps) {
  return (
    <div
      data-slot="avatar-fallback"
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-slate-100 font-bold text-slate-700",
        className
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }

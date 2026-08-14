import * as React from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// ── StatCard ────────────────────────────────────────────────────────
interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: string
  trendType?: "up" | "down" | "neutral"
  icon: React.ComponentType<{ className?: string }>
  iconColor?: "orange" | "amber" | "blue" | "emerald" | "indigo"
  className?: string
}

export function StatCard({
  title,
  value,
  subtitle,
  trend,
  trendType = "up",
  icon: Icon,
  iconColor = "orange",
  className,
}: StatCardProps) {
  const colorMap = {
    orange: "bg-orange-50 text-[#FF5A36]",
    amber: "bg-amber-50 text-amber-600",
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    indigo: "bg-indigo-50 text-indigo-600",
  }

  return (
    <Card className={cn("p-5 border-slate-200/80 bg-white rounded-2xl shadow-2xs hover:shadow-sm transition-all justify-between flex flex-col", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500">{title}</span>
        {trend && (
          <span
            className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded-full border",
              trendType === "up"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                : trendType === "down"
                ? "bg-rose-50 text-rose-700 border-rose-200/60"
                : "bg-slate-100 text-slate-600 border-slate-200"
            )}
          >
            {trend}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-3xl font-black text-slate-900 tracking-tight">{value}</span>
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", colorMap[iconColor])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {subtitle && <div className="text-[11px] text-slate-400 mt-2 font-medium">{subtitle}</div>}
    </Card>
  )
}

// ── StatusPill ───────────────────────────────────────────────────────
interface StatusPillProps {
  status: string
  className?: string
}

export function StatusPill({ status, className }: StatusPillProps) {
  const normalized = status.toLowerCase()

  if (normalized === "approved" || normalized === "active" || normalized === "released" || normalized === "graded" || normalized === "eligible") {
    return (
      <Badge variant="success" className={cn("font-bold uppercase tracking-wider text-[10px]", className)}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 shrink-0" />
        {status}
      </Badge>
    )
  }

  if (normalized === "pending" || normalized === "draft" || normalized === "upcoming" || normalized === "needs attention") {
    return (
      <Badge variant="warning" className={cn("font-bold uppercase tracking-wider text-[10px]", className)}>
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1 shrink-0" />
        {status}
      </Badge>
    )
  }

  if (normalized === "suspended" || normalized === "rejected" || normalized === "ineligible" || normalized === "cancelled") {
    return (
      <Badge variant="destructive" className={cn("font-bold uppercase tracking-wider text-[10px]", className)}>
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1 shrink-0" />
        {status}
      </Badge>
    )
  }

  return (
    <Badge variant="secondary" className={cn("font-bold uppercase tracking-wider text-[10px]", className)}>
      {status}
    </Badge>
  )
}

// ── PageHeader ───────────────────────────────────────────────────────
interface PageHeaderProps {
  title: string
  subtitle?: string
  badge?: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export function PageHeader({
  title,
  subtitle,
  badge,
  action,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-4", className)}>
      <div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <h3 className="font-black text-lg text-slate-900 tracking-tight">{title}</h3>
          {badge}
        </div>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

// ── EmptyState ───────────────────────────────────────────────────────
interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("p-8 sm:p-12 text-center rounded-2xl border border-slate-200/80 bg-white/60 space-y-3", className)}>
      {Icon && (
        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <h4 className="font-bold text-sm text-slate-800">{title}</h4>
      {description && <p className="text-xs text-slate-500 max-w-sm mx-auto">{description}</p>}
      {action && <div className="pt-2">{action}</div>}
    </div>
  )
}

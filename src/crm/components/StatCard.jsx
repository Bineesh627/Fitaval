import React from "react";
import { cn } from "@/lib/utils";

/**
 * @param {{ title: string, value: any, icon?: any, accent?: string, subtitle?: string, className?: string, onClick?: () => void }} props
 */
export default function StatCard({ title, value, icon: Icon, accent = "primary", subtitle = "", className = "", onClick }) {
  const accents = {
    primary: "bg-primary/10 text-primary dark:bg-primary/20 dark:text-emerald-400",
    dark: "bg-muted text-foreground dark:bg-slate-800 dark:text-slate-200",
    amber: "bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400",
    red: "bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400",
    green: "bg-green-100 text-green-600 dark:bg-emerald-950/60 dark:text-emerald-400",
  };
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-2xl bg-card border border-border p-4 sm:p-5 shadow-sm h-full",
        onClick && "cursor-pointer transition-all hover:border-primary/50 hover:shadow-md active:scale-[0.98]",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-muted-foreground truncate uppercase tracking-wide">{title}</p>
          <p className="text-xl sm:text-2xl font-bold text-foreground mt-1.5 truncate tabular tracking-tight">{value}</p>
          {subtitle && <p className="text-[11px] text-muted-foreground mt-1 truncate">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={cn("w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0", accents[accent])}>
            <Icon className="w-5 h-5" strokeWidth={2} />
          </div>
        )}
      </div>
    </div>
  );
}
import React from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, Eye, Edit2, Trash2, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Shared UI for list records (members, trainers, plans, transactions):
 *  - RecordCardActions : visible View / Edit / Delete row at the bottom of a card
 *  - ActionSheetItem   : row used inside the "⋮" bottom sheet
 *  - DetailPanel       : full-screen (mobile) / centered (desktop) "view" panel
 *  - DetailSection / DetailRow / InfoTile : building blocks for the view panel
 */

const iconBtn =
  "h-10 w-10 rounded-xl border flex items-center justify-center shrink-0 transition-colors touch-manipulation active:scale-95";

export function RecordCardActions({
  viewLabel = "View",
  onView,
  onEdit,
  onDelete,
  onMore,
  className,
}) {
  return (
    <div className={cn("flex items-center gap-2 pt-3 border-t border-border/60", className)}>
      {onView && (
        <button
          type="button"
          onClick={onView}
          className="flex-1 h-10 rounded-xl border border-border bg-card hover:bg-muted text-xs font-bold text-foreground flex items-center justify-center gap-1.5 transition-colors touch-manipulation active:scale-[0.98]"
        >
          <Eye className="w-4 h-4 text-primary" />
          {viewLabel}
        </button>
      )}
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          aria-label="Edit"
          title="Edit"
          className={cn(
            iconBtn,
            "border-primary/25 bg-primary/10 text-primary hover:bg-primary/20"
          )}
        >
          <Edit2 className="w-4 h-4" />
        </button>
      )}
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          aria-label="Delete"
          title="Delete"
          className={cn(
            iconBtn,
            "border-red-200 bg-red-50 text-red-600 hover:bg-red-100 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-950/70"
          )}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
      {onMore && (
        <button
          type="button"
          onClick={onMore}
          aria-label="More actions"
          title="More actions"
          className={cn(iconBtn, "border-border bg-card text-foreground hover:bg-muted")}
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

/** The ⋮ button shown in a card's header. Doesn't trigger the card's own click. */
export function RecordMoreButton({ onClick, className }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
      aria-label="More actions"
      title="More actions"
      className={cn(iconBtn, "border-border bg-card text-foreground hover:bg-muted", className)}
    >
      <MoreVertical className="w-4 h-4" />
    </button>
  );
}

/** Props that make a whole card open its view panel on click / Enter. */
export const clickableCardProps = (onOpen) => ({
  role: "button",
  tabIndex: 0,
  onClick: onOpen,
  onKeyDown: (e) => {
    if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onOpen();
    }
  },
});

export function ActionSheetItem({ icon: Icon, label, hint, onClick, tone = "default" }) {
  const danger = tone === "danger";
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-colors touch-manipulation active:scale-[0.99]",
        danger ? "hover:bg-red-50 dark:hover:bg-red-950/40" : "hover:bg-muted"
      )}
    >
      <span
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
          danger
            ? "bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400"
            : "bg-primary/10 text-primary"
        )}
      >
        {Icon && <Icon className="w-[18px] h-[18px]" />}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block text-sm font-semibold",
            danger ? "text-red-600 dark:text-red-400" : "text-foreground"
          )}
        >
          {label}
        </span>
        {hint && <span className="block text-[11px] text-muted-foreground mt-0.5">{hint}</span>}
      </span>
    </button>
  );
}

/**
 * Full-screen detail panel. Sits above the page (z-50) but below
 * bottom sheets (z-[60]) and alert dialogs (z-[70]).
 */
export function DetailPanel({
  open,
  onClose,
  title,
  eyebrow,
  onEdit,
  onDelete,
  onMore,
  children,
  footer,
}) {
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col bg-background sm:items-center sm:justify-center animate-in fade-in duration-200">
      <div className="hidden sm:block fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />
      <div className="relative w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-xl bg-background sm:rounded-3xl shadow-2xl z-10 flex flex-col overflow-hidden sm:border sm:border-border">
        <div className="sticky top-0 bg-card/95 backdrop-blur-md px-3 py-2.5 border-b border-border flex items-center gap-2 z-20">
          <button
            type="button"
            onClick={onClose}
            aria-label="Back"
            className="w-10 h-10 rounded-xl hover:bg-muted flex items-center justify-center text-foreground touch-manipulation"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
          </button>
          <div className="min-w-0 flex-1">
            {eyebrow && (
              <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                {eyebrow}
              </p>
            )}
            <p className="font-bold text-sm sm:text-base text-foreground truncate">{title}</p>
          </div>
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              aria-label="Edit"
              className={cn(iconBtn, "border-transparent text-primary hover:bg-primary/10")}
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              aria-label="Delete"
              className={cn(
                iconBtn,
                "border-transparent text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
              )}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          {onMore && (
            <button
              type="button"
              onClick={onMore}
              aria-label="More actions"
              className={cn(iconBtn, "border-transparent text-foreground hover:bg-muted")}
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3.5 pb-6">{children}</div>

        {footer && (
          <div className="p-3 border-t border-border bg-card flex gap-2 safe-bottom">{footer}</div>
        )}
      </div>
    </div>,
    document.body
  );
}

export function DetailSection({ title, icon: Icon, children, className }) {
  return (
    <section className={cn("rounded-2xl border border-border bg-card p-4", className)}>
      <h4 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2.5">
        {Icon && <Icon className="w-3.5 h-3.5 text-primary" />}
        {title}
      </h4>
      <div className="divide-y divide-border/60">{children}</div>
    </section>
  );
}

/** Label on the left, value on the right; long values wrap instead of overflowing. */
export function DetailRow({ label, value, children, emptyLabel = "—" }) {
  const content = children ?? value;
  const isEmpty = content === undefined || content === null || content === "";
  return (
    <div className="flex items-start justify-between gap-4 py-2 first:pt-0 last:pb-0 text-xs">
      <span className="text-muted-foreground shrink-0 pt-px">{label}</span>
      <span
        className={cn(
          "font-semibold text-right min-w-0 break-words",
          isEmpty ? "text-muted-foreground/60 font-normal" : "text-foreground"
        )}
      >
        {isEmpty ? emptyLabel : content}
      </span>
    </div>
  );
}

/** Full-width block for long free text (notes, goals, bio...). */
export function DetailText({ label, value, emptyLabel = "Not provided" }) {
  return (
    <div className="py-2 first:pt-0 last:pb-0">
      <p className="text-[11px] text-muted-foreground mb-0.5">{label}</p>
      <p
        className={cn(
          "text-xs leading-relaxed whitespace-pre-line break-words",
          value ? "text-foreground font-medium" : "text-muted-foreground/60 italic"
        )}
      >
        {value || emptyLabel}
      </p>
    </div>
  );
}

export function InfoTile({ label, value, tone = "default" }) {
  const tones = {
    default: "text-foreground",
    green: "text-emerald-600 dark:text-emerald-400",
    amber: "text-amber-600 dark:text-amber-400",
    red: "text-red-600 dark:text-red-400",
  };
  return (
    <div className="rounded-2xl border border-border bg-card px-3 py-2.5 text-center min-w-0">
      <p className={cn("font-extrabold text-sm truncate", tones[tone])}>{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mt-0.5">
        {label}
      </p>
    </div>
  );
}

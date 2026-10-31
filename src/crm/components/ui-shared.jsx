import React from "react";
import { cn } from "@/lib/utils";
import { ArrowLeft, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";

/**
 * Mobile-First Compact Page Header
 * Renders consistent:
 * [ ← Back / Page Title | Subtitle ] [ Action Button (e.g. + / Edit) ]
 */
export function PageHeader({
  title = "",
  subtitle = null,
  action = null,
  backTo = null,
  onBack = null,
}) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  const showBackButton = Boolean(backTo || onBack);

  return (
    <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6">
      <div className="flex items-center gap-2.5 min-w-0">
        {showBackButton && (
          <button
            type="button"
            onClick={handleBack}
            className="w-10 h-10 -ml-1.5 rounded-xl hover:bg-muted flex items-center justify-center text-foreground shrink-0 transition-colors touch-manipulation"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
          </button>
        )}
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl lg:text-[1.65rem] font-bold tracking-tight text-foreground truncate">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate font-medium">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/**
 * EmptyState component with mobile-friendly spacing
 */
export function EmptyState({ icon: Icon = null, title = "", description = "", action = null }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4 rounded-3xl bg-card border border-border">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mb-3">
          <Icon className="w-7 h-7 text-accent-foreground" strokeWidth={1.8} />
        </div>
      )}
      <p className="font-bold text-base text-foreground">{title}</p>
      {description && (
        <p className="text-xs text-muted-foreground mt-1.5 max-w-xs leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/**
 * Badge component
 */
export function Badge({ children, variant = "default", className = "" }) {
  const variants = {
    default: "bg-secondary text-secondary-foreground dark:bg-muted dark:text-foreground",
    primary: "bg-primary/10 text-primary dark:bg-primary/20 dark:text-emerald-400",
    dark: "bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-100 dark:border dark:border-border",
    amber: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 dark:border dark:border-amber-800/40",
    red: "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 dark:border dark:border-red-800/40",
    green: "bg-green-100 text-green-700 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border dark:border-emerald-800/40",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

/**
 * Mobile Bottom Sheet Dialog wrapper
 */
export function MobileBottomSheet({ open, onClose, title, children }) {
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center animate-in fade-in duration-200">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        onClick={onClose}
      />
      <div className="relative w-full sm:max-w-md bg-card rounded-t-3xl sm:rounded-3xl shadow-2xl z-10 overflow-hidden flex flex-col max-h-[88vh] border border-border animate-in slide-in-from-bottom-5 duration-200 safe-bottom">
        <div className="w-12 h-1.5 bg-muted-foreground/20 rounded-full mx-auto mt-3 mb-1 sm:hidden" />
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-base text-foreground">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-full hover:bg-accent flex items-center justify-center text-muted-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto no-scrollbar">{children}</div>
      </div>
    </div>,
    document.body
  );
}

// Backward compatibility alias
export const Sheet = MobileBottomSheet;

/**
 * Fullscreen Mobile Panel Form Layout
 * Replaces miniature desktop popups with a native-feeling mobile SaaS experience
 */
export function MobileFullFormPanel({
  open,
  onClose,
  title,
  subtitle,
  children,
  submitLabel = "Save Changes",
  onSubmit,
  isSubmitting = false,
  cancelLabel = "Cancel",
}) {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[55] flex flex-col bg-background sm:items-center sm:justify-center animate-in fade-in duration-200">
      {/* Desktop Backdrop */}
      <div
        className="hidden sm:block fixed inset-0 bg-black/60 backdrop-blur-xs"
        onClick={onClose}
      />

      {/* Main Fullscreen / Centered Container */}
      <div className="relative w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-2xl bg-card sm:rounded-3xl shadow-2xl z-10 flex flex-col overflow-hidden border-border sm:border">
        {/* Compact SaaS Header */}
        <div className="sticky top-0 bg-card/95 backdrop-blur-md z-20 px-4 sm:px-6 py-3.5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 -ml-1 rounded-xl hover:bg-muted flex items-center justify-center text-foreground shrink-0 touch-manipulation"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
            </button>
            <div className="min-w-0">
              <h3 className="font-bold text-base sm:text-lg text-foreground truncate">
                {title}
              </h3>
              {subtitle && (
                <p className="text-[11px] text-muted-foreground truncate font-medium">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="hidden sm:flex w-9 h-9 rounded-full hover:bg-accent items-center justify-center text-muted-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 sm:p-6 pb-28 sm:pb-6">
          {children}
        </div>

        {/* Sticky Action Footer */}
        <div className="fixed sm:sticky bottom-0 inset-x-0 bg-card/95 backdrop-blur-md px-4 sm:px-6 py-3 border-t border-border flex items-center gap-2.5 z-30 safe-bottom">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 rounded-xl h-12 border border-border text-foreground font-semibold text-xs sm:text-sm hover:bg-muted disabled:opacity-60 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="flex-1 rounded-xl h-12 bg-primary text-primary-foreground font-bold text-xs sm:text-sm shadow-sm hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1.5"
          >
            {isSubmitting ? "Saving..." : submitLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  Trash2,
  Users,
  CreditCard,
  Dumbbell,
  Clock,
  ArrowRight,
  X,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { INITIAL_NOTIFICATIONS } from "@/data";

const NOTIFICATIONS_STORAGE_KEY = "fitaval_notifications";

export { INITIAL_NOTIFICATIONS };

export function useNotifications() {
  const [notifications, setNotifications] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_NOTIFICATIONS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
    } catch (e) {
      console.error(e);
    }
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const resetSample = () => {
    setNotifications(INITIAL_NOTIFICATIONS);
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
    resetSample,
  };
}

export function NotificationsDrawer({ open, onClose, notificationState }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState("all"); // 'all' | 'unread'

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
    resetSample,
  } = notificationState;

  if (!open) return null;

  const filtered = notifications.filter((n) => (tab === "unread" ? !n.read : true));

  const handleNotificationClick = (n) => {
    markAsRead(n.id);
    if (n.linkTo) {
      onClose();
      navigate(n.linkTo);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "billing":
        return <CreditCard className="w-4 h-4 text-emerald-600" />;
      case "trainer":
        return <Dumbbell className="w-4 h-4 text-blue-600" />;
      case "system":
        return <AlertCircle className="w-4 h-4 text-amber-600" />;
      case "member":
      default:
        return <Users className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        onClick={onClose}
      />

      {/* Drawer Container (Slide-up on mobile, slide-right flyout on desktop) */}
      <div className="relative w-full sm:w-96 sm:h-full sm:max-h-screen bg-card rounded-t-3xl sm:rounded-none sm:rounded-l-3xl shadow-2xl z-10 flex flex-col border-l border-border animate-in slide-in-from-bottom-5 sm:slide-in-from-right duration-200 max-h-[88vh] sm:max-h-screen safe-bottom">
        {/* Mobile handle indicator */}
        <div className="w-12 h-1.5 bg-muted-foreground/20 rounded-full mx-auto mt-3 mb-1 sm:hidden" />

        {/* Top Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-foreground">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-primary text-white">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">Gym operational updates</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground"
            aria-label="Close notifications"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls: Filter Pills & Mark All Actions */}
        <div className="px-4 py-2.5 bg-muted/30 border-b border-border flex items-center justify-between gap-2">
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setTab("all")}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                tab === "all"
                  ? "bg-primary text-primary-foreground font-bold shadow-xs"
                  : "bg-card text-muted-foreground hover:bg-muted border border-border"
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setTab("unread")}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                tab === "unread"
                  ? "bg-primary text-primary-foreground font-bold shadow-xs"
                  : "bg-card text-muted-foreground hover:bg-muted border border-border"
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-2 text-muted-foreground">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              </div>
              <p className="font-bold text-sm text-foreground">You're all caught up!</p>
              <p className="text-xs text-muted-foreground mt-1">
                {tab === "unread"
                  ? "No unread alerts at this time."
                  : "No notifications found."}
              </p>
              {notifications.length === 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetSample}
                  className="mt-3 rounded-xl text-xs"
                >
                  Load Sample Alerts
                </Button>
              )}
            </div>
          ) : (
            filtered.map((n) => (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative group ${
                  n.read
                    ? "bg-card border-border/80 hover:border-border hover:bg-muted/30"
                    : "bg-emerald-50/40 dark:bg-emerald-950/20 border-primary/30 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40 shadow-xs"
                }`}
              >
                {!n.read && (
                  <span className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-primary" />
                )}

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-card border border-border flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    {getIcon(n.type)}
                  </div>

                  <div className="flex-1 min-w-0 pr-3">
                    <p
                      className={`text-xs font-bold leading-tight truncate ${
                        n.read ? "text-foreground" : "text-foreground font-extrabold"
                      }`}
                    >
                      {n.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-snug line-clamp-2">
                      {n.message}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3" />
                        {n.time}
                      </span>
                      {n.linkTo && (
                        <span className="text-[10px] text-primary font-bold flex items-center gap-0.5 group-hover:underline">
                          View details
                          <ArrowRight className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        {notifications.length > 0 && (
          <div className="p-3 border-t border-border bg-card flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={clearAll}
              className="text-xs text-muted-foreground hover:text-red-600 flex items-center gap-1.5 font-medium transition-colors p-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>

            <span className="text-[10px] text-muted-foreground font-medium">
              Updates saved locally
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationsDrawer;

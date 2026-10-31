import React, { useState } from "react";
import { Outlet, NavLink, Link, useLocation } from "react-router-dom";
import {
  Dumbbell,
  Bell,
  LogOut,
  ChevronLeft,
  HelpCircle,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { client } from "@/api/client";
import { NAV_ITEMS } from "@/data";
import NotificationsDrawer, { useNotifications } from "./NotificationsDrawer";

const desktopNavItems = NAV_ITEMS;
const mobileBottomNavItems = NAV_ITEMS;

export default function Layout() {
  const location = useLocation();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationState = useNotifications();

  // Sidebar collapse state with persistent storage
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem("fitaval_sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("fitaval_sidebar_collapsed", String(next));
      } catch (e) {}
      return next;
    });
  };

  // Derive current screen title for mobile top bar
  const currentTitle = (() => {
    const p = location.pathname;
    if (p === "/") return "Gym Dashboard";
    if (p.startsWith("/members")) return "Members";
    if (p.startsWith("/finance")) return "Finance";
    if (p.startsWith("/staff") || p.startsWith("/trainers")) return "Staff";
    if (p.startsWith("/plans")) return "Membership Plans";
    if (p.startsWith("/gym-profile")) return "Gym Profile";
    if (p.startsWith("/wallet")) return "Wallet";
    if (p.startsWith("/subscription")) return "Subscription";
    if (p.startsWith("/settings") || p.startsWith("/more")) return "Settings";
    return "Fitaval CRM";
  })();

  return (
    <div className="min-h-screen bg-muted/30 overflow-x-hidden">
      {/* Desktop sidebar with sleek border-line collapse interaction & rail mode */}
      <aside
        style={{ transitionTimingFunction: "cubic-bezier(0.2, 0, 0, 1)" }}
        className={cn(
          "hidden lg:flex fixed inset-y-0 left-0 flex-col border-r border-border bg-card z-30 transition-[width] duration-300 select-none",
          sidebarCollapsed ? "w-[72px]" : "w-64"
        )}
      >
        {/* Sleek Floating Dynamic Chevron Button sitting on the border line */}
        <button
          type="button"
          onClick={toggleSidebar}
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute -right-3 top-6 z-40 w-6 h-6 rounded-full bg-card border border-border shadow-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          <ChevronLeft
            className={cn(
              "w-3.5 h-3.5 transition-transform duration-300 ease-out",
              sidebarCollapsed && "rotate-180 text-primary"
            )}
            strokeWidth={2.5}
          />
        </button>

        {/* Brand Header */}
        <div
          className={cn(
            "flex items-center h-16 border-b border-border transition-all duration-300",
            sidebarCollapsed ? "justify-center px-2" : "gap-2.5 px-5"
          )}
        >
          <Link
            to="/"
            className="flex items-center gap-2.5 min-w-0"
            title="Fitaval Gym CRM"
          >
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm shrink-0">
              <Dumbbell className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0 animate-in fade-in duration-200">
                <p className="font-bold text-foreground leading-tight truncate">Fitaval</p>
                <p className="text-[11px] text-muted-foreground leading-tight truncate">Gym Manager</p>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-2.5 py-4 space-y-1.5 overflow-y-auto no-scrollbar">
          {desktopNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              title={sidebarCollapsed ? item.label : undefined}
              className={({ isActive }) =>
                cn(
                  "flex items-center rounded-xl text-sm font-medium transition-all duration-200 group relative",
                  sidebarCollapsed
                    ? "justify-center w-11 h-11 mx-auto"
                    : "gap-3 px-3 py-2.5 w-full",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20 font-semibold"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )
              }
            >
              <item.icon className="w-5 h-5 shrink-0" strokeWidth={2} />
              {!sidebarCollapsed && (
                <span className="truncate animate-in fade-in duration-150">
                  {item.label}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Actions: Logout & Help */}
        <div className="p-3 border-t border-border space-y-2">
          <button
            type="button"
            onClick={() => setLogoutDialogOpen(true)}
            title={sidebarCollapsed ? "Log Out" : undefined}
            className={cn(
              "flex items-center rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors",
              sidebarCollapsed
                ? "justify-center w-11 h-11 mx-auto"
                : "w-full gap-2.5 px-3 py-2.5"
            )}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span className="truncate">Log Out</span>}
          </button>

          {!sidebarCollapsed ? (
            <div className="rounded-xl bg-accent p-3 animate-in fade-in duration-200">
              <p className="text-xs font-semibold text-accent-foreground">Need help?</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 truncate">support@fitaval.com</p>
            </div>
          ) : (
            <a
              href="mailto:support@fitaval.com"
              title="Need help? support@fitaval.com"
              className="w-11 h-11 mx-auto rounded-xl bg-accent hover:bg-accent/80 flex items-center justify-center text-muted-foreground hover:text-accent-foreground transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
            </a>
          )}
        </div>
      </aside>

      {/* Main Content Area with fluid synchronized margin/padding shift */}
      <div
        style={{ transitionTimingFunction: "cubic-bezier(0.2, 0, 0, 1)" }}
        className={cn(
          "flex flex-col min-h-screen transition-[padding] duration-300",
          sidebarCollapsed ? "lg:pl-[72px]" : "lg:pl-64"
        )}
      >
        {/* Compact Mobile & Tablet Top SaaS Header */}
        <header className="sticky top-0 z-20 bg-card/95 backdrop-blur-md border-b border-border">
          <div className="flex items-center justify-between px-3.5 sm:px-6 lg:px-8 h-14 sm:h-16">
            {/* Left: Brand & Page Title */}
            <div className="flex items-center gap-2.5">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shrink-0 lg:hidden">
                  <Dumbbell className="w-4 h-4 text-white" strokeWidth={2.5} />
                </div>
                <div className="min-w-0">
                  <h1 className="font-bold text-sm sm:text-base lg:text-lg text-foreground leading-tight truncate">
                    {currentTitle}
                  </h1>
                  <p className="text-[10px] text-muted-foreground leading-tight hidden xs:block lg:hidden truncate">
                    Fitaval Gym Management
                  </p>
                </div>
              </Link>
            </div>

            {/* Right: Notification & Profile */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setNotificationsOpen(true)}
                className="relative w-10 h-10 rounded-xl hover:bg-muted flex items-center justify-center text-foreground transition-colors touch-manipulation"
                aria-label="Notifications"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {notificationState.unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-600 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center px-1 shadow-xs ring-2 ring-card animate-in zoom-in">
                    {notificationState.unreadCount}
                  </span>
                )}
              </button>
              <Link
                to="/settings"
                title="Settings & Profile"
                className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity shadow-sm"
              >
                GY
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content: full responsive padding and safe bottom for navigation */}
        <main className="flex-1 px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 pb-28 lg:pb-10 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation (Always accessible with one-hand) */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-card/95 backdrop-blur-md border-t border-border safe-bottom shadow-lg">
        <div className="flex items-stretch justify-around px-1 h-15">
          {mobileBottomNavItems.map((item) => {
            const active =
              item.to === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.to) ||
                  (item.to === "/settings" && location.pathname.startsWith("/more"));
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className="flex flex-col items-center justify-center gap-1 flex-1 py-1.5 touch-manipulation min-w-[56px] active:opacity-70 transition-opacity"
              >
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-7 rounded-full transition-all duration-200",
                    active
                      ? "bg-primary text-primary-foreground scale-105 shadow-xs"
                      : "text-muted-foreground"
                  )}
                >
                  <item.icon className="w-4 h-4" strokeWidth={active ? 2.5 : 2} />
                </div>
                <span
                  className={cn(
                    "text-[10px] font-semibold transition-colors leading-none tracking-tight",
                    active ? "text-primary font-bold" : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Notifications Drawer */}
      <NotificationsDrawer
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notificationState={notificationState}
      />

      {/* Desktop Sidebar Logout Confirmation Dialog */}
      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent className="rounded-3xl bg-card border border-border max-w-sm">
          <AlertDialogHeader>
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center mb-1">
              <LogOut className="w-6 h-6" />
            </div>
            <AlertDialogTitle className="text-base font-bold text-foreground">
              Log out of Fitaval CRM?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              You will need to enter your credentials to access gym records again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2 mt-2">
            <AlertDialogCancel className="flex-1 rounded-xl h-11 text-xs font-semibold m-0 border-border text-foreground hover:bg-muted">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => client.auth.logout("/login")}
              className="flex-1 rounded-xl h-11 text-xs font-bold bg-red-600 text-white hover:bg-red-700 m-0"
            >
              Log Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  UserCog,
  Megaphone,
  ClipboardList,
  LogOut,
  Globe,
  ChevronLeft,
  ChevronRight,
  Church,
  LayoutDashboard,
  MoreHorizontal,
  X,
} from "lucide-react";
import { useAuthPriest } from "@/hooks/useAuthPriest";
import { toast } from "sonner";
import { apiPost } from "@/services/axios";

// ── Nav items ─────────────────────────────────────────────────────
const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/priest_dashboard",
    icon: LayoutDashboard,
    implemented: true,
  },
  {
    label: "Availability",
    href: "/priest_dashboard#priest-availability",
    icon: CalendarDays,
    implemented: true,
  },
  {
    label: "Profile",
    href: "/priest_dashboard/profile",
    icon: UserCog,
    implemented: true,
  },
  {
    label: "Requests",
    href: "/priest_dashboard/requests",
    icon: ClipboardList,
    implemented: true,
  },
  {
    label: "Activities",
    href: "/priest_dashboard/activities",
    icon: ClipboardList,
    implemented: false,
  },
  {
    label: "Announcements",
    href: "/priest_dashboard/announcements",
    icon: Megaphone,
    implemented: true,
  },
].filter(item => item.implemented);

// Bottom tab bar shows first 4 items + "More" overflow
const BOTTOM_TAB_PRIMARY = NAV_ITEMS.slice(0, 4);
const BOTTOM_TAB_OVERFLOW = NAV_ITEMS.slice(4);

// ── Desktop NavItem ───────────────────────────────────────────────
const NavItem = ({ item, isActive, collapsed }) => {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${isActive
          ? "bg-accent/15 text-accent border-l-2 border-accent"
          : "text-soft/70 hover:bg-white/5 hover:text-soft border-l-2 border-transparent"
        }`}
    >
      <Icon
        size={17}
        className={`flex-shrink-0 transition-colors ${isActive
          ? "text-accent"
          : "text-soft group-hover:text-soft"
          }`}
      />
      {!collapsed && (
        <span className="font-sans text-xs font-medium tracking-wide truncate">
          {item.label}
        </span>
      )}
      {!item.implemented && !collapsed && (
        <span className="ml-auto text-[9px] font-sans font-semibold uppercase tracking-widest text-accent/50 bg-accent/10 px-1.5 py-0.5 rounded-xl">
          Soon
        </span>
      )}
      {collapsed && (
        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 hidden group-hover:flex items-center gap-2 bg-ink border border-accent/20 text-white text-xs font-sans px-3 py-1.5 rounded-xl shadow-xl whitespace-nowrap pointer-events-none">
          {item.label}
          {!item.implemented && (
            <span className="text-accent/60 text-[9px] uppercase tracking-widest">
              Soon
            </span>
          )}
        </div>
      )}
    </Link>
  );
};

// ── Mobile bottom tab item ────────────────────────────────────────
const BottomTabItem = ({ item, isActive, onClick }) => {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-1 flex-1 py-2 relative"
    >
      <div
        className={`relative flex items-center justify-center w-10 h-7 rounded-xl transition-all duration-200 ${isActive ? "bg-accent/15" : ""
          }`}
      >
        <Icon
          size={18}
          className={`transition-colors duration-200 ${isActive ? "text-accent-ink" : "text-muted"
            }`}
        />
        {!item.implemented && (
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-accent/60 rounded-full" />
        )}
      </div>
      <span
        className={`font-sans text-[9px] font-semibold uppercase tracking-widest transition-colors duration-200 ${isActive ? "text-accent-ink" : "text-muted"
          }`}
      >
        {item.label}
      </span>
    </Link>
  );
};

// ── Mobile overflow drawer ────────────────────────────────────────
const MobileOverflowDrawer = ({ open, onClose, pathname, onLogout }) => {
  if (!open) return null;
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Drawer */}
      <div className="fixed bottom-16 left-0 right-0 z-50 bg-white border-t border-ink/10 rounded-t-xl shadow-2xl px-4 pt-4 pb-6 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <p className="font-sans text-[11px] text-muted uppercase tracking-widest font-medium">
            More
          </p>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-ink/5 text-muted"
          >
            <X size={14} />
          </button>
        </div>
        <div className="space-y-1">
          {BOTTOM_TAB_OVERFLOW.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 ${isActive
                  ? "bg-accent/10 text-accent-ink"
                  : "text-muted hover:bg-ink/5"
                  }`}
              >
                <Icon size={16} />
                <span className="font-sans text-sm font-medium">
                  {item.label}
                </span>
                {!item.implemented && (
                  <span className="ml-auto text-[9px] font-sans font-semibold uppercase tracking-widest text-muted bg-accent/10 px-1.5 py-0.5 rounded-xl">
                    Soon
                  </span>
                )}
              </Link>
            );
          })}
          <div className="h-px bg-ink/6 my-2" />
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted hover:bg-ink/5 transition-all duration-150"
          >
            <Globe size={16} />
            <span className="font-sans text-sm font-medium">Public Website</span>
          </Link>
          <button
            onClick={() => { onLogout(); onClose(); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-ink hover:bg-soft transition-all duration-150"
          >
            <LogOut size={16} />
            <span className="font-sans text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
};

// ── Main ──────────────────────────────────────────────────────────
const DashboardSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { loggedInPriest, setLoggedInPriest } = useAuthPriest();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const res = await apiPost("/auth/priest/logout");
      if (res?.status === "success") {
        setLoggedInPriest(null);
        toast.success("Signed out successfully.");
        router.push("/");
      }
    } catch (err) {
      toast.error(err.message ?? "Unable to sign out. Please try again.");
    }

  };

  return (
    <>
      {/* ── DESKTOP SIDEBAR (md+) ────────────────────────────────── */}
      <aside
        className={`sticky top-0 [&_nav_a]:min-h-12 hidden md:flex flex-col h-screen bg-ink border-r border-white/5 transition-all duration-300 flex-shrink-0 ${collapsed ? "w-16" : "w-60"}`}
      >
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="absolute -right-3 top-20 z-10 w-6 h-6 flex items-center justify-center bg-ink border border-white/10 rounded-full text-soft hover:text-accent hover:border-accent/30 transition-all duration-200 shadow-md"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>

        {/* Logo */}
        <div
          className={`flex items-center gap-3 px-4 py-5 border-b border-white/5 ${collapsed ? "justify-center px-2" : ""
            }`}
        >
          <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-accent/15 rounded-xl border border-accent/25">
            <Church size={16} className="text-accent" />
          </div>
          {!collapsed && (
            <div>
              <p className="font-serif text-white text-sm font-semibold leading-tight tracking-wide">
                Priest Portal
              </p>
              <p className="font-sans text-[11px] text-soft tracking-widest uppercase">
                Administration
              </p>
            </div>
          )}
        </div>

        {/* Priest info */}
        {!collapsed && loggedInPriest && (
          <div className="mx-3 mt-4 mb-2 flex items-center gap-2.5 bg-white/3 rounded-xl px-3 py-2.5 border border-white/5">
            <div className="w-7 h-7 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center flex-shrink-0">
              <span className="text-accent font-serif text-xs font-bold">
                {loggedInPriest.priest_name?.charAt(0) ?? "P"}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-white font-sans text-xs font-medium truncate">
                {loggedInPriest.priest_name ?? "Father"}
              </p>
              <p className="text-soft font-sans text-[11px] truncate">
                {loggedInPriest.priest_email ?? ""}
              </p>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-2 pt-3 pb-2 flex flex-col gap-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.href}
              item={item}
              isActive={pathname === item.href || (item.href !== "/priest_dashboard" && pathname.startsWith(item.href + "/"))}
              collapsed={collapsed}
            />
          ))}
        </nav>

        <div className="mx-3 h-px bg-white/5" />

        {/* Bottom actions */}
        <div className="px-2 py-3 flex flex-col gap-0.5">
          <Link
            href="/"
            className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-soft hover:bg-white/5 hover:text-soft transition-all duration-200 relative ${collapsed ? "justify-center" : ""
              }`}
          >
            <Globe size={17} className="flex-shrink-0" />
            {!collapsed && (
              <span className="font-sans text-xs font-medium tracking-wide">
                Public Website
              </span>
            )}
            {collapsed && (
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 hidden group-hover:flex bg-ink border border-accent/20 text-white text-xs font-sans px-3 py-1.5 rounded-xl shadow-xl whitespace-nowrap pointer-events-none">
                Public Website
              </div>
            )}
          </Link>
          <button
            onClick={handleLogout}
            className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-soft hover:bg-white/10 hover:text-white transition-all duration-200 w-full relative ${collapsed ? "justify-center" : ""
              }`}
          >
            <LogOut size={17} className="flex-shrink-0" />
            {!collapsed && (
              <span className="font-sans text-xs font-medium tracking-wide">
                Sign Out
              </span>
            )}
            {collapsed && (
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 hidden group-hover:flex bg-ink border border-accent/20 text-white text-xs font-sans px-3 py-1.5 rounded-xl shadow-xl whitespace-nowrap pointer-events-none">
                Sign Out
              </div>
            )}
          </button>
        </div>

        <div className="h-0.5 bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
      </aside>

      {/* ── MOBILE BOTTOM TAB BAR (< md) ────────────────────────── */}
      <nav className="pb-[env(safe-area-inset-bottom)] [&>a]:min-h-16 [&>button]:min-h-16 [&>a>span]:text-[10px] [&>button>span]:text-[10px] md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-ink/8 flex items-stretch shadow-lg shadow-ink/10">
        {BOTTOM_TAB_PRIMARY.map((item) => (
          <BottomTabItem
            key={item.href}
            item={item}
            isActive={pathname === item.href || (item.href !== "/priest_dashboard" && pathname.startsWith(item.href + "/"))}
          />
        ))}
        {/* More button */}
        <button
          onClick={() => setMobileDrawerOpen(true)}
          className="flex flex-col items-center justify-center gap-1 flex-1 py-2"
        >
          <div className="flex items-center justify-center w-10 h-7 rounded-xl">
            <MoreHorizontal size={18} className="text-muted" />
          </div>
          <span className="font-sans text-[9px] font-semibold uppercase tracking-widest text-muted">
            More
          </span>
        </button>
      </nav>

      {/* Mobile overflow drawer */}
      <MobileOverflowDrawer
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        pathname={pathname}
        onLogout={handleLogout}
      />
    </>
  );
};

export default DashboardSidebar;

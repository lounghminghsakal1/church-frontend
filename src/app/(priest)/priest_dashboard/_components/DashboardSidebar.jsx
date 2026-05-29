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
} from "lucide-react";
import { useAuthPriest } from "@/hooks/useAuthPriest";
import { toast } from "sonner";

// ── Nav items ────────────────────────────────────────────────────
const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/priest_dashboard",
    icon: LayoutDashboard,
    implemented: true,
  },
  {
    label: "Edit Availability",
    href: "/priest_dashboard/availability",
    icon: CalendarDays,
    implemented: true,
  },
  {
    label: "Edit Profile",
    href: "/priest_dashboard/profile",
    icon: UserCog,
    implemented: false,
  },
  {
    label: "Upcoming Activities",
    href: "/priest_dashboard/activities",
    icon: ClipboardList,
    implemented: false,
  },
  {
    label: "Announcements",
    href: "/priest_dashboard/announcements",
    icon: Megaphone,
    implemented: false,
  },
  {
    label: "Requests",
    href: "/priest_dashboard/requests",
    icon: ClipboardList,
    implemented: false,
  },
];

// ── NavItem ──────────────────────────────────────────────────────
const NavItem = ({ item, isActive, collapsed }) => {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-sm transition-all duration-200
        ${isActive
          ? "bg-[#C9A84C]/15 text-[#C9A84C] border-l-2 border-[#C9A84C]"
          : "text-slate-300/70 hover:bg-white/5 hover:text-slate-100 border-l-2 border-transparent"
        }`}
    >
      <Icon
        size={17}
        className={`flex-shrink-0 transition-colors ${
          isActive ? "text-[#C9A84C]" : "text-slate-400 group-hover:text-slate-200"
        }`}
      />
      {!collapsed && (
        <span className="font-sans text-xs font-medium tracking-wide truncate">
          {item.label}
        </span>
      )}
      {!item.implemented && !collapsed && (
        <span className="ml-auto text-[9px] font-sans font-semibold uppercase tracking-widest text-[#C9A84C]/50 bg-[#C9A84C]/10 px-1.5 py-0.5 rounded-sm">
          Soon
        </span>
      )}
      {/* Tooltip for collapsed state */}
      {collapsed && (
        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 hidden group-hover:flex items-center gap-2 bg-[#0F2A4A] border border-[#C9A84C]/20 text-white text-xs font-sans px-3 py-1.5 rounded-sm shadow-xl whitespace-nowrap pointer-events-none">
          {item.label}
          {!item.implemented && (
            <span className="text-[#C9A84C]/60 text-[9px] uppercase tracking-widest">Soon</span>
          )}
        </div>
      )}
    </Link>
  );
};

// ── Main ─────────────────────────────────────────────────────────
const DashboardSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { loggedInPriest, setLoggedInPriest } = useAuthPriest();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    setLoggedInPriest(null);
    toast.success("Signed out successfully.");
    router.push("/");
  };

  return (
    <aside
      className={`relative flex flex-col h-screen bg-[#0A1F3A] border-r border-white/5 transition-all duration-300 flex-shrink-0
        ${collapsed ? "w-16" : "w-60"}`}
    >
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="absolute -right-3 top-20 z-10 w-6 h-6 flex items-center justify-center bg-[#0A1F3A] border border-white/10 rounded-full text-slate-400 hover:text-[#C9A84C] hover:border-[#C9A84C]/30 transition-all duration-200 shadow-md"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Logo / Brand */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/5 ${collapsed ? "justify-center px-2" : ""}`}>
        <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-[#C9A84C]/15 rounded-sm border border-[#C9A84C]/25">
          <Church size={16} className="text-[#C9A84C]" />
        </div>
        {!collapsed && (
          <div>
            <p className="font-serif text-white text-sm font-semibold leading-tight tracking-wide">
              Priest Portal
            </p>
            <p className="font-sans text-[10px] text-slate-400 tracking-widest uppercase">
              Administration
            </p>
          </div>
        )}
      </div>

      {/* Priest info */}
      {!collapsed && loggedInPriest && (
        <div className="mx-3 mt-4 mb-2 flex items-center gap-2.5 bg-white/3 rounded-sm px-3 py-2.5 border border-white/5">
          <div className="w-7 h-7 rounded-full bg-[#C9A84C]/20 border border-[#C9A84C]/30 flex items-center justify-center flex-shrink-0">
            <span className="text-[#C9A84C] font-serif text-xs font-bold">
              {loggedInPriest.priest_name?.charAt(0) ?? "P"}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-white font-sans text-xs font-medium truncate">
              {loggedInPriest.priest_name ?? "Father"}
            </p>
            <p className="text-slate-400 font-sans text-[10px] truncate">
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
            isActive={pathname === item.href}
            collapsed={collapsed}
          />
        ))}
      </nav>

      {/* Divider */}
      <div className="mx-3 h-px bg-white/5" />

      {/* Bottom actions */}
      <div className={`px-2 py-3 flex flex-col gap-0.5`}>
        {/* Public site */}
        <Link
          href="/"
          className={`group flex items-center gap-3 px-3 py-2.5 rounded-sm text-slate-400 hover:bg-white/5 hover:text-slate-100 transition-all duration-200 relative ${collapsed ? "justify-center" : ""}`}
        >
          <Globe size={17} className="flex-shrink-0" />
          {!collapsed && (
            <span className="font-sans text-xs font-medium tracking-wide">
              Public Website
            </span>
          )}
          {collapsed && (
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 hidden group-hover:flex bg-[#0F2A4A] border border-[#C9A84C]/20 text-white text-xs font-sans px-3 py-1.5 rounded-sm shadow-xl whitespace-nowrap pointer-events-none">
              Public Website
            </div>
          )}
        </Link>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={`group flex items-center gap-3 px-3 py-2.5 rounded-sm text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all duration-200 w-full relative ${collapsed ? "justify-center" : ""}`}
        >
          <LogOut size={17} className="flex-shrink-0" />
          {!collapsed && (
            <span className="font-sans text-xs font-medium tracking-wide">
              Sign Out
            </span>
          )}
          {collapsed && (
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 hidden group-hover:flex bg-[#0F2A4A] border border-[#C9A84C]/20 text-white text-xs font-sans px-3 py-1.5 rounded-sm shadow-xl whitespace-nowrap pointer-events-none">
              Sign Out
            </div>
          )}
        </button>
      </div>

      {/* Gold accent line */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-[#C9A84C]/30 to-transparent" />
    </aside>
  );
};

export default DashboardSidebar;
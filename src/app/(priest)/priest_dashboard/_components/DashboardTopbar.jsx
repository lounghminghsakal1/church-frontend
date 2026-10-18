"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  Church,
  CalendarDays,
  UserCog,
  Megaphone,
  ClipboardList,
  LayoutDashboard,
  Globe,
  LogOut,
  ChevronRight,
  X,
} from "lucide-react";
import { useAuthPriest } from "@/hooks/useAuthPriest";
import { toast } from "sonner";
import { apiPost } from "@/services/axios";

// ── Page title map ────────────────────────────────────────────────
const PAGE_TITLES = {
  "/priest_dashboard": {
    title: "Dashboard",
    subtitle: "Overview of your parish portal",
  },
  "/priest_dashboard/availability": {
    title: "Edit Availability",
    subtitle: "Manage your schedule & time slots",
  },
  "/priest_dashboard/profile": {
    title: "Edit Profile",
    subtitle: "Update your personal information",
  },
  "/priest_dashboard/activities": {
    title: "Upcoming Activities",
    subtitle: "Manage parish events & activities",
  },
  "/priest_dashboard/announcements": {
    title: "Announcements",
    subtitle: "Post & manage parish announcements",
  },
  "/priest_dashboard/requests": {
    title: "Requests",
    subtitle: "View & respond to parishioner requests",
  },
};

// ── All nav items (mirrors sidebar) ──────────────────────────────
const NAV_ITEMS = [
  { label: "Dashboard", href: "/priest_dashboard", icon: LayoutDashboard, implemented: true },
  { label: "Availability", href: "/priest_dashboard#priest-availability", icon: CalendarDays, implemented: true },
  { label: "Profile", href: "/priest_dashboard/profile", icon: UserCog, implemented: true },
  { label: "Requests", href: "/priest_dashboard/requests", icon: ClipboardList, implemented: true },
  { label: "Activities", href: "/priest_dashboard/activities", icon: ClipboardList, implemented: false },
  { label: "Announcements", href: "/priest_dashboard/announcements", icon: Megaphone, implemented: false },
].filter(item => item.implemented);

// ── Profile dropdown ──────────────────────────────────────────────
const ProfileDropdown = ({ priest, onClose, onLogout, pathname }) => (
  <>
    {/* Backdrop — closes on tap outside */}
    <div
      className="fixed inset-0 z-30"
      onClick={onClose}
      aria-hidden="true"
    />

    {/* Panel */}
    <div className="absolute right-0 top-full mt-2 z-40 w-72 bg-white rounded-xl border border-ink/10 shadow-2xl shadow-ink/10 overflow-hidden">

      {/* Priest identity header */}
      <div className="px-4 py-4 bg-ink flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center flex-shrink-0">
          <span className="text-accent font-serif text-base font-bold">
            {priest?.priest_name?.charAt(0) ?? "P"}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-serif text-white text-sm font-semibold truncate">
            {priest?.priest_name ? `Father ${priest.priest_name}` : "Father"}
          </p>
          <p className="font-sans text-muted text-[11px] truncate mt-0.5">
            {priest?.priest_email ?? "Parish Priest"}
          </p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-white/10 text-white/80 hover:text-white hover:bg-white/20 transition-colors"
        >
          <X size={12} />
        </button>
      </div>

      {/* Nav links */}
      <div className="py-1.5">
        <p className="px-4 pt-2 pb-1 font-sans text-[9px] uppercase tracking-widest text-muted font-semibold">
          Navigation
        </p>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-2.5 transition-colors duration-150 group ${isActive
                  ? "bg-accent/8 text-accent-ink"
                  : "text-muted hover:bg-ink/4 hover:text-ink"
                }`}
            >
              <Icon size={15} className="flex-shrink-0" />
              <span className="font-sans text-sm font-medium flex-1">{item.label}</span>
              {!item.implemented && (
                <span className="text-[9px] font-sans font-semibold uppercase tracking-widest text-muted bg-accent/10 px-1.5 py-0.5 rounded-xl">
                  Soon
                </span>
              )}
              {isActive && <ChevronRight size={12} className="text-muted" />}
            </Link>
          );
        })}
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-ink/6" />

      {/* Bottom actions */}
      <div className="py-1.5">
        <p className="px-4 pt-2 pb-1 font-sans text-[9px] uppercase tracking-widest text-muted font-semibold">
          Quick Links
        </p>
        <Link
          href="/"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-2.5 text-muted hover:bg-ink/4 hover:text-ink transition-colors duration-150"
        >
          <Globe size={15} className="flex-shrink-0" />
          <span className="font-sans text-sm font-medium">Public Website</span>
        </Link>
        <button
          onClick={() => { onLogout(); onClose(); }}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-ink hover:bg-soft transition-colors duration-150"
        >
          <LogOut size={15} className="flex-shrink-0" />
          <span className="font-sans text-sm font-medium">Sign Out</span>
        </button>
      </div>

      {/* Gold accent */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
    </div>
  </>
);

// ── Main ──────────────────────────────────────────────────────────
const DashboardTopbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { loggedInPriest, setLoggedInPriest } = useAuthPriest();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const page = PAGE_TITLES[pathname] ?? (pathname.startsWith("/priest_dashboard/requests/") ? { title: "Parish requests", subtitle: "Review and respond to your parish community" } : { title: "Priest Portal", subtitle: "" });

  const handleLogout = async () => {
    try {
      const response = await apiPost('/auth/priest/logout');
      if (response?.status !== 'success') throw new Error(response?.message || 'Unable to sign out.');
      setLoggedInPriest(null);
      toast.success('Signed out successfully.');
      router.push('/');
    } catch (error) { toast.error(error.message || 'Unable to sign out. Please try again.'); }
  };

  return (
    <header className="h-14 md:h-16 flex-shrink-0 flex items-center justify-between px-4 md:px-6 bg-white border-b border-ink/8 sticky top-0 z-20">

      {/* Left — brand + page title */}
      <div className="flex items-center gap-3">
        <div className="flex md:hidden items-center justify-center w-7 h-7 bg-accent/15 rounded-xl border border-accent/25 flex-shrink-0">
          <Church size={14} className="text-accent-ink" />
        </div>
        <div>
          <h1 className="font-serif text-ink text-base md:text-lg font-semibold leading-tight tracking-wide">
            {page.title}
          </h1>
          {page.subtitle && (
            <p className="hidden sm:block font-sans text-muted text-xs tracking-wide mt-0.5">
              {page.subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right — bell + avatar */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Notification bell */}
        <Link href="/" className="inline-flex min-h-11 items-center gap-2 text-xs text-muted md:text-sm" aria-label="View parish website"><Globe size={18} /><span className="hidden sm:inline">View parish</span></Link>

        {/* Avatar — tappable, opens dropdown */}
        <div className="relative flex items-center gap-2.5 pl-2 md:pl-3 border-l border-ink/8">
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className={`flex min-h-11 min-w-11 items-center gap-2.5 rounded-xl transition-all duration-150 ${dropdownOpen ? "opacity-80" : "hover:opacity-80"
              }`}
            aria-label="Open profile menu"
            aria-expanded={dropdownOpen}
          >
            <div
              className={`w-7 h-7 md:w-8 md:h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-150 ${dropdownOpen
                  ? "bg-accent ring-2 ring-accent/30"
                  : "bg-ink"
                }`}
            >
              <span
                className={`font-serif text-xs font-bold ${dropdownOpen ? "text-ink" : "text-accent"
                  }`}
              >
                {loggedInPriest?.priest_name?.charAt(0) ?? "P"}
              </span>
            </div>
            <div className="hidden sm:block text-left">
              <p className="font-sans text-ink text-xs font-semibold leading-tight">
                {loggedInPriest?.priest_name ?? "Father"}
              </p>
              <p className="font-sans text-muted text-[11px] leading-tight flex items-center gap-1">
                <Church size={9} />
                Priest
              </p>
            </div>
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <ProfileDropdown
              priest={loggedInPriest}
              onClose={() => setDropdownOpen(false)}
              onLogout={handleLogout}
              pathname={pathname}
            />
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardTopbar;
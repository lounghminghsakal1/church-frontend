"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Bell, Church } from "lucide-react";
import { useAuthPriest } from "@/hooks/useAuthPriest";

// ── Page title map ────────────────────────────────────────────────
const PAGE_TITLES = {
  "/priest_dashboard": { title: "Dashboard", subtitle: "Overview of your parish portal" },
  "/priest_dashboard/availability": { title: "Edit Availability", subtitle: "Manage your schedule & time slots" },
  "/priest_dashboard/profile": { title: "Edit Profile", subtitle: "Update your personal information" },
  "/priest_dashboard/activities": { title: "Upcoming Activities", subtitle: "Manage parish events & activities" },
  "/priest_dashboard/announcements": { title: "Announcements", subtitle: "Post & manage parish announcements" },
  "/priest_dashboard/requests": { title: "Requests", subtitle: "View & respond to parishioner requests" },
};

const DashboardTopbar = () => {
  const pathname = usePathname();
  const { loggedInPriest } = useAuthPriest();
  const page = PAGE_TITLES[pathname] ?? { title: "Priest Portal", subtitle: "" };

  return (
    <header className="h-16 flex-shrink-0 flex items-center justify-between px-6 bg-white border-b border-[#0F2A4A]/8">
      {/* Page title */}
      <div>
        <h1 className="font-serif text-[#0F2A4A] text-lg font-semibold leading-tight tracking-wide">
          {page.title}
        </h1>
        {page.subtitle && (
          <p className="font-sans text-[#0F2A4A]/45 text-xs tracking-wide mt-0.5">
            {page.subtitle}
          </p>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {/* Notification bell — placeholder */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-sm border border-[#0F2A4A]/10 text-[#0F2A4A]/40 hover:border-[#C9A84C]/40 hover:text-[#C9A84C] hover:bg-[#C9A84C]/5 transition-all duration-200">
          <Bell size={16} />
          {/* Unread dot */}
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#C9A84C] rounded-full" />
        </button>

        {/* Priest avatar chip */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-[#0F2A4A]/8">
          <div className="w-8 h-8 rounded-sm bg-[#0F2A4A] flex items-center justify-center flex-shrink-0">
            <span className="text-[#C9A84C] font-serif text-xs font-bold">
              {loggedInPriest?.priest_name?.charAt(0) ?? "P"}
            </span>
          </div>
          <div className="hidden sm:block">
            <p className="font-sans text-[#0F2A4A] text-xs font-semibold leading-tight">
              {loggedInPriest?.priest_name ?? "Father"}
            </p>
            <p className="font-sans text-[#0F2A4A]/40 text-[10px] leading-tight flex items-center gap-1">
              <Church size={9} />
              Priest
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardTopbar;
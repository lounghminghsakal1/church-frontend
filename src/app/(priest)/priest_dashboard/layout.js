"use client";

import React from "react";
import DashboardSidebar from "./_components/DashboardSidebar";
import DashboardTopbar from "./_components/DashboardTopbar";

const PriestDashboardLayout = ({ children }) => {
  return (
    <div className="font-sans flex min-h-screen bg-background">
      <a href="#priest-content" className="fixed -top-24 left-5 z-[10000] rounded-xl bg-ink px-5 py-3 text-white focus:top-3">Skip to dashboard content</a>
      {/* Sidebar — renders itself only on md+ via hidden md:flex */}
      <DashboardSidebar />

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Topbar */}
        <DashboardTopbar />

        {/* Page content — extra bottom padding on mobile for the tab bar */}
        <main id="priest-content" tabIndex={-1} className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          {children}
        </main>

        {/* Footer — desktop only */}
        <footer className="hidden md:flex flex-shrink-0 items-center justify-between px-6 py-3 bg-white border-t border-ink/6">
          <p className="font-sans text-[11px] text-muted tracking-wide uppercase">
            Priest Administration Portal
          </p>
          <div className="h-0.5 w-16 bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
          <p className="font-sans text-[11px] text-muted tracking-wide">
            © {new Date().getFullYear()} Parish Management
          </p>
        </footer>
      </div>
    </div>
  );
};

export default PriestDashboardLayout;

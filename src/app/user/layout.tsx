"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Filter from "@/components/sales-crm/FilterSidebar";
import SubNav from "@/components/sales-crm/SubNavbar";
import { TrialCountdownBanner } from "@/components/sales-crm/TrialCountdownBanner";
import { useAuthStore } from "@/stores/salesCrmStore/useAuthStore";

import { Menu ,X} from "lucide-react";
import Navbar from "@/components/sales-crm/Navbar";
import MobileSidebar from "@/components/Common/MobileSidebar";
import MainSidebar from "@/components/Common/MainSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();

  const [isFilterActive, setIsFilterActive] = useState(false);
  const [activeTab, setActiveTab] = useState("Home");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Define allowed pages for SubNav and Filter
  const allowedPages = [
    "/user/leads",
    "/user/deals",
    "/user/tasks",
    "/user/calls",
    "/user/meetings",
    "/user/contacts",
  ];

  // Check if current pathname matches any allowed page (exact or startsWith for subroutes)
  const isAllowedPage = allowedPages.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // SubNav and Filter visibility only on allowed pages (not on detail subpages)
  const showSubNav = isAllowedPage && pathname.split("/").length === 3;
  const showSidebarLarge = isAllowedPage && isFilterActive && pathname.split("/").length === 3;
  const showSidebarMobile = isAllowedPage && isFilterActive && pathname.split("/").length === 3;

  // Auto-close filter if not on allowed page
  useEffect(() => {
    if (!isAllowedPage || pathname.split("/").length !== 2) {
      setIsFilterActive(false);
    }
  }, [pathname]);

  let daysLeft: number | null = null;
  let showTrialBanner = false;

  if (
    user?.subscription &&
    user.subscription.status === "trial" &&
    user.subscription.trialEndDate
  ) {
    const trialEnd = new Date(user.subscription.trialEndDate);
    const now = new Date();
    // Only calculate if trialEnd is a valid date
    if (!isNaN(trialEnd.getTime())) {
      daysLeft = Math.ceil(
        (trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      showTrialBanner = trialEnd > now && daysLeft <= 7;
    }
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Mobile Navbar */}
      <nav className="md:hidden flex items-center justify-between h-14 px-4 bg-white border-b border-gray-200 shadow-sm z-40">
        <button
          className="p-2 rounded-md hover:bg-gray-100 focus:outline-none"
          onClick={() => setMobileSidebarOpen(true)}
          aria-label="Open menu"
        >
         <Menu/>
        </button>
        <span className="text-lg font-bold text-blue-600">CRM Pro</span>
        <div className="w-6 h-6" /> {/* Spacer for symmetry */}
      </nav>
      {/* Mobile Sidebar Drawer */}
      <MobileSidebar
        open={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      {/* MainSidebar replaces Navbar, always visible on large screens */}
      {/* <Navbar/> */}
      <div className="flex flex-row flex-1 min-h-0 overflow-hidden">
        <div className="hidden md:block">
          <MainSidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            collapsed={sidebarCollapsed}
            setCollapsed={setSidebarCollapsed}
          />
        </div>
        <div
          className={`flex-1 flex flex-col min-h-0 overflow-hidden transition-all duration-300 ${ sidebarCollapsed ? "md:ml-20" : "md:ml-64"
          }`}
        >
          <Navbar/>
          {showSubNav && (
            <SubNav
              activeTab={activeTab}
              isFilterActive={isFilterActive}
              setIsFilterActive={setIsFilterActive}
            />
          )}
          <div className="flex flex-1 overflow-hidden relative">
            {/* Sidebar for large screens (filter) */}
            {showSidebarLarge && (
              <div className="hidden md:block w-56">
                <Filter />
              </div>
            )}
            {/* Sidebar for mobile (filter) */}
            {showSidebarMobile && (
              <div className="fixed inset-0 z-50 bg-black/30 md:hidden">
                <div
                  ref={sidebarRef}
                  className="absolute left-0 top-0 w-56 h-full bg-white shadow-lg p-4 transition-transform duration-300"
                >
                  <div className="flex justify-end mb-4">
                    <button
                      onClick={() => setIsFilterActive(false)}
                      className="cursor-pointer"
                      aria-label="Close filter"
                    >
                      <X />
                    </button>
                  </div>
                  <Filter />
                </div>
              </div>
            )}
            {/* Main content */}
            <main className="flex-1 overflow-auto">{children}</main>
          </div>
        </div>
      </div>
      {/* Show trial countdown banner only if user is in trial and trial not expired */}
      {showTrialBanner && user?.subscription?.trialEndDate && (
        <TrialCountdownBanner trialEndsAt={user.subscription.trialEndDate} />
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import CallsSidebar from "@/components/sales-crm/CallsSidebar";
import CallsNavbar from "@/components/sales-crm/CallsNavbar";
import CallsRightPanel from "@/components/sales-crm/CallsRightPanel";
import { useMediaQuery, useTheme, Avatar, IconButton } from "@mui/material";
import { AccountCircle, Close } from "@mui/icons-material";
import { usePathname } from "next/navigation";

export default function CallsDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isEditPage = pathname?.includes("/edit");
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isMobileRightSide = useMediaQuery(theme.breakpoints.down("lg"));
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(isMobile);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(!isMobileRightSide);

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  const toggleRightPanel = () => {
    setIsRightPanelOpen(!isRightPanelOpen);
  };

  useEffect(() => {
    setIsRightPanelOpen(!isMobileRightSide);
  }, [isMobileRightSide]);

  return (
    <div className="h-full w-full flex flex-col md:flex-row overflow-hidden bg-gray-50">
        {/* Mobile Sidebar Overlay - Hidden on edit page */}
        {!isEditPage && isMobile && sidebarOpen && (
          <div className="fixed inset-0 z-[9999]">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="absolute left-0 top-0 h-full w-72 z-30 bg-white">
              <CallsSidebar collapsed={false} />
            </div>
          </div>
        )}

        {/* Desktop Sidebar - Hidden on edit page */}
        {!isEditPage && !isMobile && (
          <div
            className={`h-full transition-all duration-300  ${
              isSidebarCollapsed ? "w-16" : "w-72"
            }`}
          >
            <CallsSidebar collapsed={isSidebarCollapsed} />
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Navbar - Hidden on edit page */}
          {!isEditPage && (
            <div className="h-16 shadow-sm bg-white flex-shrink-0">
              <CallsNavbar 
                toggleSidebar={toggleSidebar} 
              />
            </div>
          )}

          {/* Content + Right Panel Container */}
          <div className="flex flex-1 overflow-hidden">
            {/* Main Content (70% on desktop, 100% on mobile, always 100% on edit page) */}
            <main className={`h-full ${!isEditPage && isRightPanelOpen ? "w-full md:w-[70%]" : "w-full"}`}>
              <div className="h-full overflow-auto p-4 bg-gray-50">
                {children}
              </div>
            </main>

            {/* Right Panel (30% on desktop, sliding panel on mobile) - Hidden on edit page */}
            {!isEditPage && isRightPanelOpen && (
              <>
                {/* Mobile Overlay */}
                {isMobileRightSide && (
                  <div
                    className="fixed inset-0 bg-black/50 z-30"
                    onClick={toggleRightPanel}
                  />
                )}

                {/* Right Panel */}
                <aside
                  className={`bg-white h-full border-l border-gray-200 ${
                    isMobileRightSide
                      ? "fixed top-0 right-0 w-4/5 max-w-md shadow-xl z-[9999] "
                      : "w-[30%]"
                  }`}
                >
                  {isMobileRightSide && (
                    <div className="flex justify-end p-2 ">
                      <IconButton onClick={toggleRightPanel}>
                        <Close />
                      </IconButton>
                    </div>
                  )}
                  <CallsRightPanel />
                </aside>
              </>
            )}
          </div>

          {/* Mobile Toggle Button for Right Panel - Hidden on edit page */}
          {!isEditPage && isMobileRightSide && (
            <button
              onClick={toggleRightPanel}
              className="fixed bottom-6 right-6 z-10 w-12 h-12 rounded-full bg-purple-600 shadow-lg flex items-center justify-center text-white cursor-pointer"
            >
              <AccountCircle fontSize="medium" />
            </button>
          )}
        </div>
      </div>
  );
}
"use client";

import React, { useState } from "react";
import NewSubNavbar from "@/components/sales-crm/DeatilsSubNavbar";
import DetailsSidebar from "@/components/sales-crm/DetailsSidebar";
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import IconButton from "@mui/material/IconButton";

export default function LeadDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        {/* <DetailsSidebar
          collapsed={isSidebarCollapsed}
          toggleCollapse={toggleSidebar}
          onItemClick={(sectionId: string) => {
            console.log(`Section clicked: ${sectionId}`);
          }}
        /> */}

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          {/* Mobile menu button (appears on the side of main content) */}
          <div className="md:hidden absolute top-1 left-1 bg-white rounded-full">
            {/* <IconButton
              onClick={toggleSidebar}
            >
              <ChevronRightIcon />
            </IconButton> */}
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}

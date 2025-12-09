"use client";

import React, { useState } from "react";
import ReportsNavbarDetails from "@/components/sales-crm/ReportsNavbarDetails";

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
      <ReportsNavbarDetails />
      <div className="flex flex-1 overflow-hidden relative">
        {/* Main content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

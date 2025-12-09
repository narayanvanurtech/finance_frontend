// components/DetailsSidebar.tsx
"use client";

import React, { useState, useEffect } from "react";

interface SidebarItem {
  label: string;
  icon: React.ReactNode;
  sectionId: string;
}

const sidebarItems: SidebarItem[] = [
  {
    label: "Lead Summary",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    ),
    sectionId: "lead-summary",
  },
  {
    label: "Lead Information",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    sectionId: "lead-information",
  },
  {
    label: "Notes",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
    sectionId: "notes-section",
  },
  {
    label: "Attachments",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
      </svg>
    ),
    sectionId: "attachments-section",
  },
  {
    label: "Open Activities",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    sectionId: "open-activities-section",
  },
  {
    label: "Closed Activities",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    sectionId: "closed-activities-section",
  },
  {
    label: "Invited Meetings",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    sectionId: "invited-meetings-section",
  },
];

interface SidebarProps {
  collapsed: boolean;
  toggleCollapse: () => void;
  onItemClick: (sectionId: string) => void;
  activeSection?: string | null;
}

const DetailsSidebar: React.FC<SidebarProps> = ({
  collapsed,
  toggleCollapse,
  onItemClick,
  activeSection,
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [currentActiveSection, setCurrentActiveSection] = useState<string | null | undefined>(activeSection || "lead-summary");

  // Update current active section when prop changes
  useEffect(() => {
    if (activeSection !== undefined) {
      setCurrentActiveSection(activeSection);
    }
  }, [activeSection]);

  // Notify parent component of default active section on first render
  useEffect(() => {
    if (!activeSection) {
      onItemClick("lead-summary");
    }
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleItemClick = (sectionId: string) => {
    setCurrentActiveSection(sectionId);
    onItemClick(sectionId);
    if (isMobile) {
      toggleCollapse();
    }
  };

  const CollapseButton = () => (
    <button
      onClick={toggleCollapse}
      className="group relative p-2 rounded-xl bg-gradient-to-r from-indigo-50 to-indigo-50 hover:from-indigo-100 hover:to-indigo-100 border border-indigo-200 hover:border-indigo-300 transition-all duration-200 hover:shadow-md"
      title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      <svg 
        className={`w-5 h-5 text-indigo-600 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
      </svg>
    </button>
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        {!collapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Details
            </h2>
          </div>
        )}
        <CollapseButton />
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-2">
        {sidebarItems.map((item, index) => {
          const isActive = currentActiveSection === item.sectionId;
          const isHovered = hoveredItem === item.sectionId;
          
          return (
            <div
              key={item.sectionId}
              className="relative"
              onMouseEnter={() => setHoveredItem(item.sectionId)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <button
                onClick={() => handleItemClick(item.sectionId)}
                className={`
                  relative w-full group flex items-center space-x-4 p-3 rounded-xl transition-all duration-200 cursor-pointer
                  ${isActive 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' 
                    : 'hover:bg-gradient-to-r hover:from-indigo-50 hover:to-indigo-50 text-gray-700 hover:text-gray-900'
                  }
                  ${collapsed ? 'justify-center' : ''}
                `}
                title={collapsed ? item.label : undefined}
              >
                {/* Icon */}
                <div className={`
                  relative flex items-center justify-center w-6 h-6 transition-all duration-200
                  ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-indigo-600'}
                  ${isHovered && !collapsed ? 'scale-110' : ''}
                `}>
                  {item.icon}
                </div>

                {/* Label */}
                {!collapsed && (
                  <span className={`
                    font-medium transition-all duration-200 flex-1 text-left
                    ${isActive ? 'text-white' : 'text-gray-700 group-hover:text-indigo-600'}
                  `}>
                    {item.label}
                  </span>
                )}

                {/* Active indicator */}
                {isActive && !collapsed && (
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                )}
              </button>

              {/* Tooltip for collapsed state */}
              {collapsed && isHovered && (
                <div className="absolute left-full ml-3 top-1/2 transform -translate-y-1/2 z-50">
                  <div className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg">
                    {item.label}
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-0 h-0 border-r-4 border-r-gray-900 border-y-4 border-y-transparent" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100">
        <div className={`
          flex items-center space-x-3 p-3 rounded-xl bg-gray-50 text-gray-600 text-sm
          ${collapsed ? 'justify-center' : ''}
        `}>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {!collapsed && <span>Tip: Click items to navigate</span>}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`
        hidden md:flex flex-col h-full bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ease-in-out
        ${collapsed ? 'w-20' : 'w-80'}
      `}>
        <SidebarContent />
      </aside>

      {/* Mobile Toggle Button - Shows when sidebar is hidden */}
      {/* {isMobile && collapsed && (
        <button
          onClick={toggleCollapse}
          className="fixed top-4 left-4 z-50 md:hidden group bg-white shadow-lg hover:shadow-xl border border-gray-200 rounded-xl p-3 transition-all duration-200 hover:scale-105"
          aria-label="Open sidebar menu"
        >
          <div className="relative">
            <svg 
              className="w-6 h-6 text-gray-700 group-hover:text-indigo-600 transition-colors duration-200" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full animate-pulse opacity-75" />
          </div>
        </button>
      )} */}

      {/* Alternative: Floating Action Button Style */}
      {/* Uncomment this and comment the above button for a different style */}
      {isMobile && collapsed && (
        <button
          onClick={toggleCollapse}
          className="fixed bottom-6 right-6 z-30 md:hidden w-14 h-14 bg-accentindigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 flex items-center justify-center"
          aria-label="Open sidebar menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {/* Mobile Overlay */}
      {isMobile && !collapsed && (
        <div 
          className="fixed inset-0 bg-black/20 bg-opacity-50 z-40 md:hidden"
          onClick={toggleCollapse}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`
        fixed left-0 top-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden
        ${collapsed ? '-translate-x-full' : 'translate-x-0'}
      `}>
        <SidebarContent />
      </aside>
    </>
  );
};

export default DetailsSidebar;
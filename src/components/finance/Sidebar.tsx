"use client";
import React, { Dispatch, SetStateAction, useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  FiMenu,
  FiX,
  FiHome,
  FiFileText,
  FiDollarSign,
  FiClipboard,
  FiCreditCard,
  FiShoppingCart,
  FiArrowDownCircle,
  FiSettings,
  FiHelpCircle,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiUsers,
  FiBox,
  FiChevronDown,
} from "react-icons/fi";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import clsx from "clsx";
import Link from "next/link";

// Centralized sidebar config
type SidebarChild = {
  label: string;
  href: string;
};
type SidebarSectionType = {
  label: string;
  icon?: React.ComponentType<any>;
  href?: string;
  basePath?: string;
  children?: SidebarChild[];
  variant?: string;
};

type SidebarNavItemProps = {
  item: SidebarChild | SidebarSectionType;
  collapsed: boolean;
  pathname: string;
  onClick: () => void;
};

type SidebarSectionProps = {
  section: SidebarSectionType;
  collapsed: boolean;
  expanded: Record<string, boolean>;
  setExpanded: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  pathname: string;
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

type SidebarProps = {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  mobileOpen: boolean;
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const sidebarRoutes: SidebarSectionType[] = [
  {
    label: "Dashboard",
    icon: FiHome,
    href: "/dashboard",
  },
  {
    label: "Sales",
    icon: FiShoppingCart,
    basePath: "/dashboard",
    children: [
      { label: "Clients", href: "/dashboard/clients" },
      { label: "Quotations", href: "/dashboard/quotations" },
  { label: "Proforma Invoices", href: "/dashboard/proforma-invoices" },
      { label: "Invoices", href: "/dashboard/invoices" },
      { label: "Sales Orders", href: "/dashboard/sales-orders" },
      { label: "Payment Received", href: "/dashboard/payment-received" },
      { label: "Delivery Challans", href: "/dashboard/delivery-challans" },
      { label: "Credit Notes", href: "/dashboard/credit-notes" },
    ],
  },
  {
    label: "Purchases",
    icon: FiArrowDownCircle,
    basePath: "/dashboard",
    children: [
      { label: "Purchases & Expenses", href: "/dashboard/expenses" },
      { label: "Purchase Orders", href: "/dashboard/purchase-orders" },
      { label: "Payments Made", href: "/dashboard/payments-made" },
      { label: "Vendors", href: "/dashboard/vendors" },
      { label: "Debit Notes", href: "/dashboard/debit-notes" },
    ],
  },
  {
    label: "Inventory",
    icon: FiBox,
    basePath: "/dashboard/inventory",
    children: [
      { label: "Category", href: "/dashboard/inventory/category" },
      { label: "Items", href: "/dashboard/inventory/items" },
    ],
  },
  {
    label: "Reports",
    icon: FiFileText,
    basePath: "/dashboard",
    children: [
      { label: "All Reports", href: "/dashboard/reports" },
      { label: "GSTR1", href: "/dashboard/reports/gstr1summary" },
      { label: "GSTR2", href: "/dashboard/reports/gstr2summary" },
    ],
  },
];

const sidebarFooter: SidebarSectionType[] = [
  { label: "Settings", href: "#settings", icon: FiSettings },
  { label: "Help", href: "#help", icon: FiHelpCircle },
  { label: "Logout", href: "#logout", icon: FiLogOut, variant: "destructive" },
];

function isSectionActive(section: SidebarSectionType, pathname: string): boolean {
  if (section.children) {
    return section.children.some((child: SidebarChild) => pathname.startsWith(child.href));
  }
  if (section.href) {
    return pathname === section.href;
  }
  return false;
}

const SidebarNavItem: React.FC<SidebarNavItemProps> = ({ item, collapsed, pathname, onClick }) => {
  const Icon = (item as SidebarSectionType).icon;
  const isActive = pathname === item.href;
  return (
    <a
      href={item.href}
      onClick={onClick}
      className={clsx(
        "group flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out",
        collapsed ? "justify-center" : "gap-3",
        isActive
          ? "bg-[var(--color-sidebar-primary)] text-[var(--color-sidebar-primary-foreground)] shadow-sm"
          : (item as SidebarSectionType).variant === "destructive"
          ? "text-[var(--color-sidebar-destructive)] hover:bg-[var(--color-sidebar-destructive-hover)] hover:text-[var(--color-sidebar-destructive-foreground)]"
          : "text-[var(--color-sidebar-foreground)] hover:bg-[var(--color-sidebar-accent)] hover:text-[var(--color-sidebar-accent-foreground)]"
      )}
      title={collapsed ? item.label : undefined}
    >
      {Icon && <Icon className={clsx(collapsed ? "text-lg" : "text-base", "flex-shrink-0")} />}
      {!collapsed && <span className="truncate">{item.label}</span>}
    </a>
  );
};

const SidebarSection: React.FC<SidebarSectionProps> = ({ section, collapsed, expanded, setExpanded, pathname, setMobileOpen }) => {
  const Icon = section.icon;
  const isActive = isSectionActive(section, pathname);
  const isExpanded = expanded[section.label] === true;
  // Always allow toggling, even if a child is active
  const toggleExpand = () => setExpanded(prev => ({ ...prev, [section.label]: !prev[section.label] }));

  const [contentHeight, setContentHeight] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isExpanded && contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    } else {
      setContentHeight(0);
    }
  }, [isExpanded, section.children?.length]);

  if (!section.children) {
    // Single nav item
    return (
      <SidebarNavItem
        item={section}
        collapsed={collapsed}
        pathname={pathname}
        onClick={() => setMobileOpen(false)}
      />
    );
  }

  return (
    <div className="pt-2">
      {!collapsed ? (
        <div>
          <button
            onClick={toggleExpand}
            className={clsx(
              "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out",
              isActive ? "text-[var(--color-sidebar-primary)] " : "text-[var(--color-sidebar-foreground)] hover:bg-[var(--color-sidebar-accent)] hover:text-[var(--color-sidebar-accent-foreground)]"
            )}
          >
            <div className="flex items-center gap-3">
              {Icon && <Icon className="text-base flex-shrink-0" />}
              <span>{section.label}</span>
            </div>
            <FiChevronDown className={clsx("transition-transform duration-200", isExpanded && "rotate-180")} size={14} />
          </button>
          <div
            ref={contentRef}
            style={{
              maxHeight: isExpanded ? `${contentHeight}px` : '0px',
              opacity: isExpanded ? 1 : 0,
              transition: 'max-height 0.3s ease, opacity 0.3s ease',
              overflow: 'hidden',
            }}
          >
            <div className="pl-6 pt-1 space-y-1">
              {section.children.map((child: SidebarChild) => (
                <SidebarNavItem
                  key={child.label}
                  item={child}
                  collapsed={collapsed}
                  pathname={pathname}
                  onClick={() => setMobileOpen(false)}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={toggleExpand}
          className={clsx(
            "w-full flex items-center justify-center px-3 py-2.5 rounded-lg",
            isActive ? "bg-[var(--color-sidebar-primary)] text-[var(--color-sidebar-primary-foreground)]" : "text-[var(--color-sidebar-foreground)] hover:bg-[var(--color-sidebar-accent)] hover:text-[var(--color-sidebar-accent-foreground)]"
          )}
          title={section.label}
        >
          {Icon && <Icon className="text-lg flex-shrink-0" />}
        </button>
      )}
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) => {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState({});

  // Restore expanded state from sessionStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("sidebarExpanded");
      if (stored) setExpanded(JSON.parse(stored));
    }
  }, []);
  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("sidebarExpanded", JSON.stringify(expanded));
    }
  }, [expanded]);

  // Auto-close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, setMobileOpen]);

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed top-0 left-0 z-50 h-full bg-[var(--color-sidebar)] text-[var(--color-sidebar-foreground)] border-r border-[var(--color-sidebar-border)] transition-all duration-300 ease-in-out shadow-lg",
          "flex flex-col justify-between",
          collapsed ? "w-16" : "w-56",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0"
        )}
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--color-sidebar-border)]">
            {!collapsed && (
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-[var(--color-sidebar-foreground)]">CRM</h1>
                <span className="text-sm font-medium text-[var(--color-muted-foreground)]">Accounts</span>
              </div>
            )}
            {/* Desktop collapse toggle */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-[var(--color-sidebar-accent)] text-[var(--color-muted-foreground)] transition-colors duration-200"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <FiChevronRight size={16} /> : <FiChevronLeft size={16} />}
            </button>
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg hover:bg-[var(--color-sidebar-accent)] text-[var(--color-muted-foreground)] transition-colors duration-200"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            <div>
              {sidebarRoutes.map((section: SidebarSectionType, idx) => {
                // Add extra margin above 'Reports' and after each main section
                const isReports = section.label === "Reports";
                return (
                  <div
                    key={section.label}
                    className="mt-2 mb-1"
                  >
                    <SidebarSection
                      section={section}
                      collapsed={collapsed}
                      expanded={expanded}
                      setExpanded={setExpanded}
                      pathname={pathname}
                      setMobileOpen={setMobileOpen}
                    />
                  </div>
                );
              })}
            </div>
          </nav>

          {/* Footer */}
          <div className="px-3 py-4 border-t border-[var(--color-sidebar-border)]">
            <div className="space-y-1">
              {sidebarFooter.map((item: SidebarSectionType) => (
                <SidebarNavItem
                  key={item.label}
                  item={item}
                  collapsed={collapsed}
                  pathname={pathname}
                  onClick={() => setMobileOpen(false)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Profile Section at the bottom of sidebar content */}
        <div className={`px-3 py-3 border-t border-[var(--color-sidebar-border)] flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <img
            src="/avatar.png"
            alt="Avatar"
            className="w-9 h-9 rounded-full object-cover border border-[var(--color-sidebar-border)] flex-shrink-0"
            title={collapsed ? 'Santosh Kumar' : undefined}
          />
          {!collapsed && (
            <div className="hidden md:block flex-1 min-w-0">
              <div className="font-medium text-[var(--color-sidebar-foreground)] truncate">Santosh Kumar</div>
              <Link href="/dashboard/bussiness" className="text-xs text-[var(--color-muted-foreground)] hover:underline block w-full text-left mt-1">Business Details</Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
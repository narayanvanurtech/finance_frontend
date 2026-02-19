"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { Avatar, Tooltip } from "@mui/material";
import { useRouter, usePathname, redirect } from "next/navigation";
import { useAuthStore } from "@/stores/salesCrmStore/useAuthStore";
import usePushNotifications from "@/hooks/usePushNotifications";
import Link from "next/link";
import {
  Phone,
  UserCircle,
  Settings as LucideSettings,
  Recycle,
  Users,
  BarChart3,
  Target,
  Calendar,
  FileText,
  Headphones,
  LogOut,
  LayoutDashboard,
  ClipboardList,
  Store,
  ChevronDown,
  ChevronUp,
  Mail,
  ShoppingCart,
  ArrowDownCircle,
  Package,
} from "lucide-react";
import Profilesheet from "@/components/sales-crm/Profilesheet";
import ConfirmationDialog from "@/components/sales-crm/ConfirmationDialog";

interface MainSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

interface NavigationItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

interface SettingsItem {
  href: string;
  icon: React.ReactNode;
  label: string;
}

export default function MainSidebar({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
}: MainSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logoutUser } = useAuthStore();
  const { fcmToken } = usePushNotifications();

  const [profileSheetOpen, setProfileSheetOpen] = useState(false);
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  const [salesCrmExpanded, setSalesCrmExpanded] = useState(true);
  const [salesExpanded, setSalesExpanded] = useState(false);
  const [purchasesExpanded, setPurchasesExpanded] = useState(false);
  const [inventoryExpanded, setInventoryExpanded] = useState(false);
  const [reportsExpanded, setReportsExpanded] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const [isClient,setIsClinet]=useState(false)

  useEffect(()=>{
    setIsClinet(true)
  },[])

  const basePath = user?.role === "admin" ? "/sales-crm" : "/user/sales-crm";

  // Navigation items with consistent icon styling
  const navigationItems = useMemo<NavigationItem[]>(
    () => [
      {
        label: "Dashboard",
        path: `${basePath}/home`,
        icon: <LayoutDashboard className="w-5 h-5 stroke-[1.5]" />,
      },
      {
        label: "Leads",
        path: `${basePath}/leads`,
        icon: <Target className="w-5 h-5 stroke-[1.5]" />,
      },
      // {
      //   label: "Deals",
      //   path: `${basePath}/deals`,
      //   icon: <Store className="w-5 h-5 stroke-[1.5]" />,
      // },
      {
        label: "Tasks",
        path: `${basePath}/tasks`,
        icon: <ClipboardList className="w-5 h-5 stroke-[1.5]" />,
      },
      {
        label: "Calls",
        path: `${basePath}/calls`,
        icon: <Phone className="w-5 h-5 stroke-[1.5]" />,
      },
      {
        label: "Meetings",
        path: `${basePath}/meetings`,
        icon: <Calendar className="w-5 h-5 stroke-[1.5]" />,
      },
      {
        label: "Reports",
        path: `${basePath}/reports`,
        icon: <FileText className="w-5 h-5 stroke-[1.5]" />,
      },
      {
        label: "Analytics",
        path: `${basePath}/analytics`,
        icon: <BarChart3 className="w-5 h-5 stroke-[1.5]" />,
      },
      {
        label: "Support",
        path: "/sales-crm/support",
        icon: <Headphones className="w-5 h-5 stroke-[1.5]" />,
      },
    ],
    [basePath]
  );

  // Finance base path for finance modules
  const financeBasePath = user?.role==="admin"? "/finance":"/user/finance";

  // Sales module items
  const salesItems = useMemo<NavigationItem[]>(
    () => [
      {
        label: "Clients",
        path: `${financeBasePath}/clients`,
        icon: <Users className="w-4 h-4 stroke-[1.5]" />, 
      },
      {
        label: "Quotations",
        path: `${financeBasePath}/quotations`,
        icon: <FileText className="w-4 h-4 stroke-[1.5]" />, 
      },
      {
        label: "Proforma Invoices",
        path: `${financeBasePath}/performa-invoices`,
        icon: <FileText className="w-4 h-4 stroke-[1.5]" />, 
      },
      {
        label: "Invoices",
        path: `${financeBasePath}/invoices`,
        icon: <FileText className="w-4 h-4 stroke-[1.5]" />, 
      },
      {
        label: "Sales Orders",
        path: `${financeBasePath}/sales-orders`,
        icon: <ShoppingCart className="w-4 h-4 stroke-[1.5]" />, 
      },
      {
        label: "Payment Received",
        path: `${financeBasePath}/payment-received`,
        icon: <ClipboardList className="w-4 h-4 stroke-[1.5]" />, 
      },
      {
        label: "Delivery Challans",
        path: `${financeBasePath}/delivery-challans`,
        icon: <Package className="w-4 h-4 stroke-[1.5]" />, 
      },
      {
        label: "Credit Notes",
        path: `${financeBasePath}/credit-notes`,
        icon: <FileText className="w-4 h-4 stroke-[1.5]" />, 
      },
    ],
    []
  );

  // Purchases module items
  const purchasesItems = useMemo<NavigationItem[]>(
    () => [
      {
        label: "Purchases & Expenses",
        path: `${financeBasePath}/expenses`,
        icon: <ArrowDownCircle className="w-4 h-4 stroke-[1.5]" />, 
      },
      {
        label: "Purchase Orders",
        path: `${financeBasePath}/purchase-orders`,
        icon: <ShoppingCart className="w-4 h-4 stroke-[1.5]" />, 
      },
      {
        label: "Payments Made",
        path: `${financeBasePath}/payments-made`,
        icon: <ClipboardList className="w-4 h-4 stroke-[1.5]" />, 
      },
      {
        label: "Vendors",
        path: `${financeBasePath}/vendors`,
        icon: <Users className="w-4 h-4 stroke-[1.5]" />, 
      },
      {
        label: "Debit Notes",
        path: `${financeBasePath}/debit-notes`,
        icon: <FileText className="w-4 h-4 stroke-[1.5]" />, 
      },
    ],
    []
  );

  // Inventory module items
  const inventoryItems = useMemo<NavigationItem[]>(
    () => [
      {
        label: "Category",
        path: `${financeBasePath}/inventory/category`,
        icon: <LayoutDashboard className="w-4 h-4 stroke-[1.5]" />, 
      },
      {
        label: "Items",
        path: `${financeBasePath}/inventory/items`,
        icon: <Package className="w-4 h-4 stroke-[1.5]" />, 
      },
    ],
    []
  );

  // Reports module items
  const reportsItems = useMemo<NavigationItem[]>(
    () => [
      {
        label: "All Reports",
        path: `${financeBasePath}/reports`,
        icon: <FileText className="w-4 h-4 stroke-[1.5]" />, 
      },
      {
        label: "GSTR1",
        path: `${financeBasePath}/reports/gstr1summary`,
        icon: <BarChart3 className="w-4 h-4 stroke-[1.5]" />, 
      },
      {
        label: "GSTR2",
        path: `${financeBasePath}/reports/gstr2summary`,
        icon: <BarChart3 className="w-4 h-4 stroke-[1.5]" />, 
      },
    ],
    []
  );


  // Settings items with consistent icon styling
  const settingsMenuItems = useMemo<SettingsItem[]>(
    () => [
      {
        href:
          user?.role === "admin"
            ? `/settings/user/${user?._id}`
            : `/user/settings/user/${user?._id}`,
        icon: <UserCircle className="w-4 h-4 stroke-[1.5]" />,
        label: "Personal Settings",
      },
      {
        href:
          user?.role === "admin" 
            ? "/finance/bussiness"
            : "/user/settings/business",
        icon: <Store className="w-4 h-4 stroke-[1.5]" />,
        label: "Business Details",
      },
      {
        href:
          user?.role === "admin"
            ? "/sales-crm/settings/email"
            : "/sales-crm/user/settings/email",
        icon: <Mail className="w-4 h-4 stroke-[1.5]" />,
        label: "Email",
      },
      ...(user?.role === "admin"
        ? [
            {
              href: "/settings/users",
              icon: <LucideSettings className="w-4 h-4 stroke-[1.5]" />,
              label: "User Management",
            },
            {
              href: "/settings/recyclebin",
              icon: <Recycle className="w-4 h-4 stroke-[1.5]" />,
              label: "Recycle Bin",
            },
          ]
        : []),
    ],
    [user?.role, user?._id]
  );

  // Active state detection
  useEffect(() => {
    const matchedTab = navigationItems.find(
      (tab) => pathname === tab.path || pathname.startsWith(tab.path + "/")
    );

    const matchedSetting = settingsMenuItems.find(
      (item) => pathname === item.href || pathname.startsWith(item.href + "/")
    );

    // Check if current path is in finance module (both admin and user routes)
    const isFinanceRoute = pathname.startsWith("/finance/") || pathname.startsWith("/user/finance/");

    if (matchedSetting) {
      setActiveTab("");
      setSettingsExpanded(true);
      setSalesCrmExpanded(false);
      setSalesExpanded(false);
      setPurchasesExpanded(false);
      setInventoryExpanded(false);
      setReportsExpanded(false);
    } else if (isFinanceRoute) {
      // Clear Sales CRM active state when in finance routes
      setActiveTab("");
      setSettingsExpanded(false);
      setSalesCrmExpanded(false);
      
      // Determine which finance module to expand based on the route
      if (pathname.includes("/clients") || 
          pathname.includes("/quotations") || 
          pathname.includes("/performa-invoices") || 
          pathname.includes("/invoices") || 
          pathname.includes("/sales-orders") || 
          pathname.includes("/payment-received") || 
          pathname.includes("/delivery-challans") || 
          pathname.includes("/credit-notes")) {
        setSalesExpanded(true);
        setPurchasesExpanded(false);
        setInventoryExpanded(false);
        setReportsExpanded(false);
      } else if (pathname.includes("/expenses") || 
                 pathname.includes("/purchase-orders") || 
                 pathname.includes("/payments-made") || 
                 pathname.includes("/vendors") || 
                 pathname.includes("/debit-notes")) {
        setSalesExpanded(false);
        setPurchasesExpanded(true);
        setInventoryExpanded(false);
        setReportsExpanded(false);
      } else if (pathname.includes("/inventory/")) {
        setSalesExpanded(false);
        setPurchasesExpanded(false);
        setInventoryExpanded(true);
        setReportsExpanded(false);
      } else if (pathname.includes("/reports")) {
        setSalesExpanded(false);
        setPurchasesExpanded(false);
        setInventoryExpanded(false);
        setReportsExpanded(true);
      }
    } else if (matchedTab) {
      setActiveTab(matchedTab.label);
      setSettingsExpanded(false);
      setSalesCrmExpanded(true);
      setSalesExpanded(false);
      setPurchasesExpanded(false);
      setInventoryExpanded(false);
      setReportsExpanded(false);
    } else {
      setActiveTab("Dashboard");
      setSettingsExpanded(false);
      setSalesCrmExpanded(true);
      setSalesExpanded(false);
      setPurchasesExpanded(false);
      setInventoryExpanded(false);
      setReportsExpanded(false);
    }
  }, [pathname, navigationItems, settingsMenuItems, setActiveTab]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault();
        setCollapsed(!collapsed);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [collapsed, setCollapsed]);

  // Handlers
  const navigateTo = useCallback(
    (label: string) => {
      const item = navigationItems.find((t) => t.label === label);
      if (item) {
        setActiveTab(item.label);
        setSettingsExpanded(false);
        setSalesCrmExpanded(true);
        // Close all finance module expansions when navigating to Sales CRM
        setSalesExpanded(false);
        setPurchasesExpanded(false);
        setInventoryExpanded(false);
        setReportsExpanded(false);
        router.push(item.path);
      }
    },
    [navigationItems, setActiveTab, router]
  );

  const toggleSettings = useCallback(() => {
    setSettingsExpanded((prev) => !prev);
  }, []);

  const toggleSalesCrm = useCallback(() => {
    setSalesCrmExpanded((prev) => !prev);
  }, []);

  const toggleSales = useCallback(() => {
    setSalesExpanded((prev) => !prev);
  }, []);

  const togglePurchases = useCallback(() => {
    setPurchasesExpanded((prev) => !prev);
  }, []);

  const toggleInventory = useCallback(() => {
    setInventoryExpanded((prev) => !prev);
  }, []);

  const toggleReports = useCallback(() => {
    setReportsExpanded((prev) => !prev);
  }, []);

  const handleFinanceNavigation = useCallback((path: string) => {
    // Clear Sales CRM active state when navigating to finance routes
    setActiveTab("");
    setSalesCrmExpanded(false);
    setSettingsExpanded(false);
    router.push(path);
  }, [router]);

  const handleLogout = useCallback(async () => {
    try {
      await logoutUser(fcmToken);
      router.push("/auth/login");
    } catch (error) {
      router.push("/auth/login")
      console.error("Logout failed:", error);
    }
  }, [logoutUser, fcmToken, router]);

  const isCurrentPath = useCallback(
    (path: string) => pathname === path,
    [pathname]
  );

  return (
    <aside
      className={`
        fixed top-0 left-0 h-full bg-white shadow-lg z-50 
        transition-all duration-300 ease-in-out flex flex-col 
        border-r border-gray-200 ${collapsed ? "w-20" : "w-64"}
      `}
    >
      {/* Header */}
      <header className="flex items-center justify-between h-16 px-4 border-b border-gray-200 shrink-0">
        <Link
          href="/"
          className="text-2xl font-bold text-indigo-600 cursor-pointer select-none transition-colors hover:text-indigo-700"
        >
          {!collapsed && "Caishen"}
        </Link>
        <Tooltip title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
          <button
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </Tooltip>
      </header>

      {/* Navigation */}
      <nav
        className="flex-1 py-6 overflow-y-auto
  [&::-webkit-scrollbar]:w-[2px]
  [&::-webkit-scrollbar-track]:bg-gray-100
  [&::-webkit-scrollbar-thumb]:bg-gray-300
  [&::-webkit-scrollbar-thumb]:rounded-full"
      >
        <div className="px-3 space-y-1">
          {/* Sales CRM Section */}
          <div className="mt-2">
            <Tooltip title={collapsed ? "Sales CRM" : ""} placement="right">
              <button
                onClick={toggleSalesCrm}
                className={`
                  flex items-center gap-3 px-3 py-3 w-full rounded-lg text-sm font-medium
                  text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200
                  ${collapsed ? "justify-center" : "justify-between"}
                  ${salesCrmExpanded ? "bg-gray-50 text-gray-900" : ""}
                `}
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard
                    className={`
                      w-5 h-5 stroke-[1.5] transition-colors duration-200
                      ${salesCrmExpanded ? "text-gray-700" : "text-gray-500"}
                    `}
                  />
                  {!collapsed && <span className="font-medium">Sales CRM</span>}
                </div>
                {!collapsed && (
                  <span className="text-gray-400 transition-transform duration-200">
                    {salesCrmExpanded ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </span>
                )}
              </button>
            </Tooltip>

            {/* Sales CRM Items - Expanded */}
            {!collapsed && (
              <div
                className={`
                  mt-2 ml-6 space-y-1
                  transition-all duration-300 ease-in-out
                  ${
                    salesCrmExpanded
                      ? "opacity-100 translate-y-0 scale-100"
                      : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
                  }
                `}
              >
                {salesCrmExpanded &&
                  navigationItems.map((item) => (
                    <Tooltip
                      key={item.label}
                      title={item.label}
                      placement="right"
                    >
                      <button
                        onClick={() => navigateTo(item.label)}
                        className={`
                          flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm
                          transition-all duration-200 font-medium
                          ${
                            activeTab === item.label
                              ? "bg-indigo-50 text-indigo-700"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                          }
                        `}
                      >
                        <span
                          className={`${
                            activeTab === item.label
                              ? "text-indigo-600"
                              : "text-gray-500"
                          }`}
                        >
                          {item.icon}
                        </span>
                        <span className="truncate">{item.label}</span>
                      </button>
                    </Tooltip>
                  ))}
              </div>
            )}

            {/* Sales CRM Items - Collapsed */}
            {collapsed && (
              <div
                className={`
                  flex flex-col items-center space-y-1 mt-2
                  transition-all duration-300 ease-in-out
                  ${
                    salesCrmExpanded
                      ? "opacity-100 translate-y-0 scale-100"
                      : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
                  }
                `}
              >
                {salesCrmExpanded &&
                  navigationItems.map((item) => (
                    <Tooltip
                      key={item.label}
                      title={item.label}
                      placement="right"
                    >
                      <button
                        onClick={() => navigateTo(item.label)}
                        className={`
                          flex items-center justify-center w-12 h-12 rounded-lg
                          transition-all duration-200
                          ${
                            activeTab === item.label
                              ? "bg-indigo-50 text-indigo-600 shadow-sm"
                              : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                          }
                        `}
                      >
                        {item.icon}
                      </button>
                    </Tooltip>
                  ))}
              </div>
            )}
          </div>

          {/* Sales Module */}
          <div className="mt-5 pt-6 border-t border-gray-200">
            <Tooltip title={collapsed ? "Sales" : ""} placement="right">
              <button
                onClick={toggleSales}
                className={`
                  flex items-center gap-3 px-3 py-3 w-full rounded-lg text-sm font-medium
                  text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200
                  ${collapsed ? "justify-center" : "justify-between"}
                  ${salesExpanded ? "bg-gray-50 text-gray-900" : ""}
                `}
              >
                <div className="flex items-center gap-3">
                  <ShoppingCart
                    className={`
                      w-5 h-5 stroke-[1.5] transition-colors duration-200
                      ${salesExpanded ? "text-gray-700" : "text-gray-500"}
                    `}
                  />
                  {!collapsed && <span className="font-medium">Sales</span>}
                </div>
                {!collapsed && (
                  <span className="text-gray-400 transition-transform duration-200">
                    {salesExpanded ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </span>
                )}
              </button>
            </Tooltip>

            {/* Sales Items - Expanded */}
            {!collapsed && (
              <div
                className={`
                  mt-2 ml-6 space-y-1
                  transition-all duration-300 ease-in-out
                  ${
                    salesExpanded
                      ? "opacity-100 translate-y-0 scale-100"
                      : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
                  }
                `}
              >
                {salesExpanded &&
                  salesItems.map((item) => (
                    <Tooltip
                      key={item.label}
                      title={item.label}
                      placement="right"
                    >
                      <button
                        onClick={() => handleFinanceNavigation(item.path)}
                        className={`
                          flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm
                          transition-all duration-200 font-medium
                          ${
                            pathname === item.path
                              ? "bg-indigo-50 text-indigo-700"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                          }
                        `}
                      >
                        <span
                          className={`${
                            pathname === item.path
                              ? "text-indigo-600"
                              : "text-gray-500"
                          }`}
                        >
                          {item.icon}
                        </span>
                        <span className="truncate">{item.label}</span>
                      </button>
                    </Tooltip>
                  ))}
              </div>
            )}

            {/* Sales Items - Collapsed */}
            {collapsed && (
              <div
                className={`
                  flex flex-col items-center space-y-1 mt-2
                  transition-all duration-300 ease-in-out
                  ${
                    salesExpanded
                      ? "opacity-100 translate-y-0 scale-100"
                      : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
                  }
                `}
              >
                {salesExpanded &&
                  salesItems.map((item) => (
                    <Tooltip
                      key={item.label}
                      title={item.label}
                      placement="right"
                    >
                      <button
                        onClick={() => handleFinanceNavigation(item.path)}
                        className={`
                          flex items-center justify-center w-12 h-12 rounded-lg
                          transition-all duration-200
                          ${
                            pathname === item.path
                              ? "bg-indigo-50 text-indigo-600 shadow-sm"
                              : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                          }
                        `}
                      >
                        {item.icon}
                      </button>
                    </Tooltip>
                  ))}
              </div>
            )}
          </div>

          {/* Purchases Module */}
          <div className="mt-2">
            <Tooltip title={collapsed ? "Purchases" : ""} placement="right">
              <button
                onClick={togglePurchases}
                className={`
                  flex items-center gap-3 px-3 py-3 w-full rounded-lg text-sm font-medium
                  text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200
                  ${collapsed ? "justify-center" : "justify-between"}
                  ${purchasesExpanded ? "bg-gray-50 text-gray-900" : ""}
                `}
              >
                <div className="flex items-center gap-3">
                  <ArrowDownCircle
                    className={`
                      w-5 h-5 stroke-[1.5] transition-colors duration-200
                      ${purchasesExpanded ? "text-gray-700" : "text-gray-500"}
                    `}
                  />
                  {!collapsed && <span className="font-medium">Purchases</span>}
                </div>
                {!collapsed && (
                  <span className="text-gray-400 transition-transform duration-200">
                    {purchasesExpanded ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </span>
                )}
              </button>
            </Tooltip>

            {/* Purchases Items - Expanded */}
            {!collapsed && (
              <div
                className={`
                  mt-2 ml-6 space-y-1
                  transition-all duration-300 ease-in-out
                  ${
                    purchasesExpanded
                      ? "opacity-100 translate-y-0 scale-100"
                      : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
                  }
                `}
              >
                {purchasesExpanded &&
                  purchasesItems.map((item) => (
                    <Tooltip
                      key={item.label}
                      title={item.label}
                      placement="right"
                    >
                      <button
                        onClick={() => handleFinanceNavigation(item.path)}
                        className={`
                          flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm
                          transition-all duration-200 font-medium
                          ${
                            pathname === item.path
                              ? "bg-indigo-50 text-indigo-700"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                          }
                        `}
                      >
                        <span
                          className={`${
                            pathname === item.path
                              ? "text-indigo-600"
                              : "text-gray-500"
                          }`}
                        >
                          {item.icon}
                        </span>
                        <span className="truncate">{item.label}</span>
                      </button>
                    </Tooltip>
                  ))}
              </div>
            )}

            {/* Purchases Items - Collapsed */}
            {collapsed && (
              <div
                className={`
                  flex flex-col items-center space-y-1 mt-2
                  transition-all duration-300 ease-in-out
                  ${
                    purchasesExpanded
                      ? "opacity-100 translate-y-0 scale-100"
                      : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
                  }
                `}
              >
                {purchasesExpanded &&
                  purchasesItems.map((item) => (
                    <Tooltip
                      key={item.label}
                      title={item.label}
                      placement="right"
                    >
                      <button
                        onClick={() => handleFinanceNavigation(item.path)}
                        className={`
                          flex items-center justify-center w-12 h-12 rounded-lg
                          transition-all duration-200
                          ${
                            pathname === item.path
                              ? "bg-indigo-50 text-indigo-600 shadow-sm"
                              : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                          }
                        `}
                      >
                        {item.icon}
                      </button>
                    </Tooltip>
                  ))}
              </div>
            )}
          </div>

          {/* Inventory Module */}
          <div className="mt-2">
            <Tooltip title={collapsed ? "Inventory" : ""} placement="right">
              <button
                onClick={toggleInventory}
                className={`
                  flex items-center gap-3 px-3 py-3 w-full rounded-lg text-sm font-medium
                  text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200
                  ${collapsed ? "justify-center" : "justify-between"}
                  ${inventoryExpanded ? "bg-gray-50 text-gray-900" : ""}
                `}
              >
                <div className="flex items-center gap-3">
                  <Package
                    className={`
                      w-5 h-5 stroke-[1.5] transition-colors duration-200
                      ${inventoryExpanded ? "text-gray-700" : "text-gray-500"}
                    `}
                  />
                  {!collapsed && <span className="font-medium">Inventory</span>}
                </div>
                {!collapsed && (
                  <span className="text-gray-400 transition-transform duration-200">
                    {inventoryExpanded ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </span>
                )}
              </button>
            </Tooltip>

            {/* Inventory Items - Expanded */}
            {!collapsed && (
              <div
                className={`
                  mt-2 ml-6 space-y-1
                  transition-all duration-300 ease-in-out
                  ${
                    inventoryExpanded
                      ? "opacity-100 translate-y-0 scale-100"
                      : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
                  }
                `}
              >
                {inventoryExpanded &&
                  inventoryItems.map((item) => (
                    <Tooltip
                      key={item.label}
                      title={item.label}
                      placement="right"
                    >
                      <button
                        onClick={() => handleFinanceNavigation(item.path)}
                        className={`
                          flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm
                          transition-all duration-200 font-medium
                          ${
                            pathname === item.path
                              ? "bg-indigo-50 text-indigo-700"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                          }
                        `}
                      >
                        <span
                          className={`${
                            pathname === item.path
                              ? "text-indigo-600"
                              : "text-gray-500"
                          }`}
                        >
                          {item.icon}
                        </span>
                        <span className="truncate">{item.label}</span>
                      </button>
                    </Tooltip>
                  ))}
              </div>
            )}

            {/* Inventory Items - Collapsed */}
            {collapsed && (
              <div
                className={`
                  flex flex-col items-center space-y-1 mt-2
                  transition-all duration-300 ease-in-out
                  ${
                    inventoryExpanded
                      ? "opacity-100 translate-y-0 scale-100"
                      : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
                  }
                `}
              >
                {inventoryExpanded &&
                  inventoryItems.map((item) => (
                    <Tooltip
                      key={item.label}
                      title={item.label}
                      placement="right"
                    >
                      <button
                        onClick={() => handleFinanceNavigation(item.path)}
                        className={`
                          flex items-center justify-center w-12 h-12 rounded-lg
                          transition-all duration-200
                          ${
                            pathname === item.path
                              ? "bg-indigo-50 text-indigo-600 shadow-sm"
                              : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                          }
                        `}
                      >
                        {item.icon}
                      </button>
                    </Tooltip>
                  ))}
              </div>
            )}
          </div>

          {/* Reports Module */}
          <div className="mt-2">
            <Tooltip title={collapsed ? "Reports" : ""} placement="right">
              <button
                onClick={toggleReports}
                className={`
                  flex items-center gap-3 px-3 py-3 w-full rounded-lg text-sm font-medium
                  text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200
                  ${collapsed ? "justify-center" : "justify-between"}
                  ${reportsExpanded ? "bg-gray-50 text-gray-900" : ""}
                `}
              >
                <div className="flex items-center gap-3">
                  <BarChart3
                    className={`
                      w-5 h-5 stroke-[1.5] transition-colors duration-200
                      ${reportsExpanded ? "text-gray-700" : "text-gray-500"}
                    `}
                  />
                  {!collapsed && <span className="font-medium">Reports</span>}
                </div>
                {!collapsed && (
                  <span className="text-gray-400 transition-transform duration-200">
                    {reportsExpanded ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </span>
                )}
              </button>
            </Tooltip>

            {/* Reports Items - Expanded */}
            {!collapsed && (
              <div
                className={`
                  mt-2 ml-6 space-y-1
                  transition-all duration-300 ease-in-out
                  ${
                    reportsExpanded
                      ? "opacity-100 translate-y-0 scale-100"
                      : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
                  }
                `}
              >
                {reportsExpanded &&
                  reportsItems.map((item) => (
                    <Tooltip
                      key={item.label}
                      title={item.label}
                      placement="right"
                    >
                      <button
                        onClick={() => handleFinanceNavigation(item.path)}
                        className={`
                          flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm
                          transition-all duration-200 font-medium
                          ${
                            pathname === item.path
                              ? "bg-indigo-50 text-indigo-700"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                          }
                        `}
                      >
                        <span
                          className={`${
                            pathname === item.path
                              ? "text-indigo-600"
                              : "text-gray-500"
                          }`}
                        >
                          {item.icon}
                        </span>
                        <span className="truncate">{item.label}</span>
                      </button>
                    </Tooltip>
                  ))}
              </div>
            )}

            {/* Reports Items - Collapsed */}
            {collapsed && (
              <div
                className={`
                  flex flex-col items-center space-y-1 mt-2
                  transition-all duration-300 ease-in-out
                  ${
                    reportsExpanded
                      ? "opacity-100 translate-y-0 scale-100"
                      : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
                  }
                `}
              >
                {reportsExpanded &&
                  reportsItems.map((item) => (
                    <Tooltip
                      key={item.label}
                      title={item.label}
                      placement="right"
                    >
                      <button
                        onClick={() => handleFinanceNavigation(item.path)}
                        className={`
                          flex items-center justify-center w-12 h-12 rounded-lg
                          transition-all duration-200
                          ${
                            pathname === item.path
                              ? "bg-indigo-50 text-indigo-600 shadow-sm"
                              : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                          }
                        `}
                      >
                        {item.icon}
                      </button>
                    </Tooltip>
                  ))}
              </div>
            )}
          </div>

          {/* Settings Section */}
          <div className="mt-5 pt-6 border-t border-gray-200">
            <Tooltip title={collapsed ? "Settings" : ""} placement="right">
              <button
                onClick={toggleSettings}
                className={`
                  flex items-center gap-3 px-3 py-3 w-full rounded-lg text-sm font-medium
                  text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200
                  ${collapsed ? "justify-center" : "justify-between"}
                  ${settingsExpanded ? "bg-gray-50 text-gray-900" : ""}
                `}
              >
                <div className="flex items-center gap-3">
                  <LucideSettings
                    className={`
                      w-5 h-5 stroke-[1.5] transition-colors duration-200
                      ${settingsExpanded ? "text-gray-700" : "text-gray-500"}
                    `}
                  />
                  {!collapsed && <span className="font-medium">Settings</span>}
                </div>
                {!collapsed && (
                  <span className="text-gray-400 transition-transform duration-200">
                    {settingsExpanded ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </span>
                )}
              </button>
            </Tooltip>

            {/* Settings Items - Expanded */}
            {!collapsed && (
              <div
                className={`
                  mt-2 ml-6 space-y-1
                  transition-all duration-300 ease-in-out
                  ${
                    settingsExpanded
                      ? "opacity-100 translate-y-0 scale-100"
                      : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
                  }
                `}
              >
                {settingsExpanded &&
                  settingsMenuItems.map((item) => (
                    <Tooltip
                      key={item.href}
                      title={item.label}
                      placement="right"
                    >
                      <Link href={item.href}>
                        <button
                          className={`
                          flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm
                          transition-all duration-200 font-medium
                          ${
                            isCurrentPath(item.href)
                              ? "bg-indigo-50 text-indigo-700"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                          }
                        `}
                        >
                          <span
                            className={`${
                              isCurrentPath(item.href)
                                ? "text-indigo-600"
                                : "text-gray-500"
                            }`}
                          >
                            {item.icon}
                          </span>
                          <span className="truncate">{item.label}</span>
                        </button>
                      </Link>
                    </Tooltip>
                  ))}
              </div>
            )}

            {/* Settings Items - Collapsed */}
            {collapsed && (
              <div
                className={`
                  flex flex-col items-center
                  transition-all duration-300 ease-in-out
                  ${
                    settingsExpanded
                      ? "opacity-100 translate-y-0 scale-100"
                      : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
                  }
                `}
              >
                {settingsExpanded &&
                  settingsMenuItems.map((item) => (
                    <Tooltip
                      key={item.href}
                      title={item.label}
                      placement="right"
                    >
                      <Link href={item.href}>
                        <button
                          className={`
                          flex items-center justify-center w-12 h-12 rounded-lg
                          transition-all duration-200
                          ${
                            isCurrentPath(item.href)
                              ? "bg-indigo-50 text-indigo-600 shadow-sm"
                              : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                          }
                        `}
                        >
                          {item.icon}
                        </button>
                      </Link>
                    </Tooltip>
                  ))}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <footer className="border-t border-gray-200 shrink-0">
        {/* User Profile */}
        <div className="p-4">
          <Tooltip
            title={collapsed ? `${user?.name} - View Profile` : ""}
            placement="right"
          >
            <button
              onClick={() => setProfileSheetOpen(true)}
              className={`
                flex items-center gap-3 w-full p-3 rounded-lg hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100
                transition-all duration-200 border border-transparent hover:border-gray-200 hover:shadow-sm
                ${collapsed ? "justify-center" : "justify-start"}
              `}
            >
              <div className="relative">
                <Avatar
                  src="/user.jpg"
                  sx={{
                    width: 32,
                    height: 32,
                    background: "oklch(58.5% 0.233 277.117)",
                  }}
                  className="ring-2 ring-gray-200 shadow-sm"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm" />
              </div>
              {!collapsed && (
                <div className="text-left min-w-0 flex-1">
                  <div className="font-semibold text-sm text-gray-900 truncate">
                    {(user?.name && isClient) ? user?.name : "User"}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {user?.email || "user@crm.com"}
                  </div>
                </div>
              )}
            </button>
          </Tooltip>
        </div>

        {/* Logout */}
        <div className="px-4 pb-4">
          <Tooltip title={collapsed ? "Logout" : ""} placement="right">
            <button
              onClick={() => setShowLogoutDialog(true)}
              className={`
                flex items-center gap-3 w-full p-3 rounded-lg text-sm font-medium
                hover:bg-red-50 text-red-600 transition-all duration-200 
                border border-transparent hover:border-red-200 hover:shadow-sm
                ${collapsed ? "justify-center" : "justify-start"}
              `}
            >
              <LogOut className="w-5 h-5 stroke-[1.5]" />
              {!collapsed && <span>Logout</span>}
            </button>
          </Tooltip>
        </div>
      </footer>

      {/* Profile Sheet */}
      <Profilesheet
        open={profileSheetOpen}
        onClose={() => setProfileSheetOpen(false)}
        onLogout={handleLogout}
        onProfile={() => {
          router.push("/profile");
          setProfileSheetOpen(false);
        }}
      />

      {/* Logout Confirmation Dialog */}
      <ConfirmationDialog
        show={showLogoutDialog}
        title="Logout"
        message="Are you sure you want to logout? You will be logged out of your account."
        onConfirm={() => {
          setShowLogoutDialog(false);
          handleLogout();
        }}
        onCancel={() => setShowLogoutDialog(false)}
        confirmText="Logout"
        cancelText="Cancel"
        type="warning"
      />
    </aside>
  );
}

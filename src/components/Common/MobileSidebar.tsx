"use client";

import React, { useMemo, useCallback, useEffect, useState } from "react";
import { Avatar, Drawer, Tooltip } from "@mui/material";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/salesCrmStore/useAuthStore";
import usePushNotifications from "@/hooks/usePushNotifications";
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Profilesheet from "@/components/sales-crm/Profilesheet";
import ConfirmationDialog from "@/components/sales-crm/ConfirmationDialog";

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
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

export default function MobileSidebar(props: MobileSidebarProps) {
  const { open, onClose, activeTab, setActiveTab } = props;
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

  const basePath = user?.role === "admin" ? "/sales-crm" : "/user/sales-crm";
  //console.log("Base Path:", basePath);
  //console.log("User Role:", user?.role);

  // here i want to print all the user data
  //console.log("User Data:", user?.companyId);
  
  // Store the company ID in localStorage for use throughout the app
  useEffect(() => {
    if (user?.companyId) {
      localStorage.setItem('currentCompanyId', user.companyId);
      //console.log("Company ID stored in localStorage:", user.companyId);
    }
  }, [user?.companyId]);

  const financeBasePath = user?.role === "admin" ? "/finance" : "/user/finance";

  // Navigation items (Sales CRM)
  const navigationItems = useMemo<NavigationItem[]>(
    () => [
      { label: "Dashboard", path: `${basePath}/home`, icon: <LayoutDashboard className="w-5 h-5" /> },
      { label: "Leads", path: `${basePath}/leads`, icon: <Target className="w-5 h-5" /> },
      // { label: "Deals", path: `${basePath}/deals`, icon: <Store className="w-5 h-5" /> },
      { label: "Tasks", path: `${basePath}/tasks`, icon: <ClipboardList className="w-5 h-5" /> },
      { label: "Calls", path: `${basePath}/calls`, icon: <Phone className="w-5 h-5" /> },
      { label: "Meetings", path: `${basePath}/meetings`, icon: <Calendar className="w-5 h-5" /> },
      { label: "Reports", path: `${basePath}/reports`, icon: <FileText className="w-5 h-5" /> },
      { label: "Analytics", path: `${basePath}/analytics`, icon: <BarChart3 className="w-5 h-5" /> },
      { label: "Support", path: `/sales-crm/support`, icon: <Headphones className="w-5 h-5" /> },
    ],
    [basePath]
  );

  // Sales module items
  const salesItems = useMemo<NavigationItem[]>(
    () => [
      { label: "Clients", path: `${financeBasePath}/clients`, icon: <Users className="w-4 h-4" /> },
      { label: "Quotations", path: `${financeBasePath}/quotations`, icon: <FileText className="w-4 h-4" /> },
      { label: "Performa Invoices", path: `${financeBasePath}/performa-invoices`, icon: <FileText className="w-4 h-4" /> },
      { label: "Invoices", path: `${financeBasePath}/invoices`, icon: <FileText className="w-4 h-4" /> },
      { label: "Sales Orders", path: `${financeBasePath}/sales-orders`, icon: <ShoppingCart className="w-4 h-4" /> },
      { label: "Payment Received", path: `${financeBasePath}/payment-received`, icon: <ClipboardList className="w-4 h-4" /> },
      { label: "Delivery Challans", path: `${financeBasePath}/delivery-challans`, icon: <Package className="w-4 h-4" /> },
      { label: "Credit Notes", path: `${financeBasePath}/credit-notes`, icon: <FileText className="w-4 h-4" /> },
    ],
    [financeBasePath]
  );

  // Purchases module items
  const purchasesItems = useMemo<NavigationItem[]>(
    () => [
      { label: "Purchases & Expenses", path: `${financeBasePath}/expenses`, icon: <ArrowDownCircle className="w-4 h-4" /> },
      { label: "Purchase Orders", path: `${financeBasePath}/purchase-orders`, icon: <ShoppingCart className="w-4 h-4" /> },
      { label: "Payments Made", path: `${financeBasePath}/payments-made`, icon: <ClipboardList className="w-4 h-4" /> },
      { label: "Vendors", path: `${financeBasePath}/vendors`, icon: <Users className="w-4 h-4" /> },
      { label: "Debit Notes", path: `${financeBasePath}/debit-notes`, icon: <FileText className="w-4 h-4" /> },
    ],
    [financeBasePath]
  );

  // Inventory module items
  const inventoryItems = useMemo<NavigationItem[]>(
    () => [
      { label: "Category", path: `${financeBasePath}/inventory/category`, icon: <LayoutDashboard className="w-4 h-4" /> },
      { label: "Items", path: `${financeBasePath}/inventory/items`, icon: <Package className="w-4 h-4" /> },
    ],
    [financeBasePath]
  );

  // Reports module items
  const reportsItems = useMemo<NavigationItem[]>(
    () => [
      { label: "All Reports", path: `${financeBasePath}/reports`, icon: <FileText className="w-4 h-4" /> },
      { label: "GSTR1", path: `${financeBasePath}/reports/gstr1summary`, icon: <BarChart3 className="w-4 h-4" /> },
      { label: "GSTR2", path: `${financeBasePath}/reports/gstr2summary`, icon: <BarChart3 className="w-4 h-4" /> },
    ],
    [financeBasePath]
  );

  // Settings items
  const settingsMenuItems = useMemo<SettingsItem[]>(
    () => [
      {
        href: user?.role === "admin" ? `/settings/user/${user?._id}` : `/user/settings/user/${user?._id}`,
        icon: <UserCircle className="w-4 h-4" />,
        label: "Personal Settings",
      },
      {
        href: user?.role === "admin" ? "/settings/email" : "/user/settings/email",
        icon: <Mail className="w-4 h-4" />,
        label: "Email",
      },
      ...(user?.role === "admin"
        ? [
            { href: "/settings/users", icon: <LucideSettings className="w-4 h-4" />, label: "User Management" },
            { href: "/settings/recyclebin", icon: <Recycle className="w-4 h-4" />, label: "Recycle Bin" },
          ]
        : []),
    ],
    [user?.role, user?._id]
  );

  // Active state detection
  useEffect(() => {
    const matchedTab = navigationItems.find(tab => pathname === tab.path || pathname.startsWith(tab.path + "/"));
    const matchedSetting = settingsMenuItems.find(item => pathname === item.href || pathname.startsWith(item.href + "/"));
    const isFinanceRoute = pathname.startsWith("/finance/") || pathname.startsWith("/user/finance/");

    if (matchedSetting) {
      setActiveTab && setActiveTab("");
      setSettingsExpanded(true);
      setSalesCrmExpanded(false);
      setSalesExpanded(false);
      setPurchasesExpanded(false);
      setInventoryExpanded(false);
      setReportsExpanded(false);
    } else if (isFinanceRoute) {
      setActiveTab && setActiveTab("");
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
      setActiveTab && setActiveTab(matchedTab.label);
      setSettingsExpanded(false);
      setSalesCrmExpanded(true);
      setSalesExpanded(false);
      setPurchasesExpanded(false);
      setInventoryExpanded(false);
      setReportsExpanded(false);
    } else {
      setActiveTab && setActiveTab("Dashboard");
      setSettingsExpanded(false);
      setSalesCrmExpanded(true);
      setSalesExpanded(false);
      setPurchasesExpanded(false);
      setInventoryExpanded(false);
      setReportsExpanded(false);
    }
  }, [pathname, navigationItems, settingsMenuItems, setActiveTab]);

  // Handlers
  const navigateTo = useCallback((label: string) => {
    const item = navigationItems.find(t => t.label === label);
    if (item) {
      setActiveTab && setActiveTab(item.label);
      setSettingsExpanded(false);
      setSalesCrmExpanded(true);
      setSalesExpanded(false);
      setPurchasesExpanded(false);
      setInventoryExpanded(false);
      setReportsExpanded(false);
      router.push(item.path);
      onClose && onClose();
    }
  }, [navigationItems, setActiveTab, router, onClose]);

  const handleFinanceNavigation = useCallback((path: string) => {
    setActiveTab && setActiveTab("");
    setSalesCrmExpanded(false);
    setSettingsExpanded(false);
    router.push(path);
    onClose && onClose();
  }, [router, onClose, setActiveTab]);

  const toggleSettings = useCallback(() => {
    setSettingsExpanded(prev => !prev);
  }, []);
  const toggleSalesCrm = useCallback(() => {
    setSalesCrmExpanded(prev => !prev);
  }, []);
  const toggleSales = useCallback(() => {
    setSalesExpanded(prev => !prev);
  }, []);
  const togglePurchases = useCallback(() => {
    setPurchasesExpanded(prev => !prev);
  }, []);
  const toggleInventory = useCallback(() => {
    setInventoryExpanded(prev => !prev);
  }, []);
  const toggleReports = useCallback(() => {
    setReportsExpanded(prev => !prev);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await logoutUser(fcmToken);
      router.push("/auth/login");
      onClose && onClose();
    } catch (error) {
      router.push("/auth/login");
      console.error("Logout failed:", error);
    }
  }, [logoutUser, fcmToken, router, onClose]);

  const isCurrentPath = useCallback((path: string) => pathname === path, [pathname]);

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      PaperProps={{
        className: "w-72 max-w-full bg-white flex flex-col h-full shadow-lg border-r border-gray-200",
      }}
    >
      {/* Header */}
      <header className="flex items-center justify-between h-16 px-4 border-b border-gray-200 shrink-0">
        <Link href={'/'}
          className="text-2xl font-bold text-blue-600 cursor-pointer select-none"
        >
          Caishen
        </Link>
        <button
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <span className="text-xl">×</span>
        </button>
      </header>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
        <div className="px-3 space-y-1">
          {/* Sales CRM Section */}
          <div className="mt-2">
            <button
              onClick={toggleSalesCrm}
              className={`
                flex items-center gap-3 px-3 py-3 w-full rounded-lg text-sm font-medium
                text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200
                ${salesCrmExpanded ? "bg-gray-50 text-gray-900" : ""}
              `}
            >
              <LayoutDashboard className={`w-5 h-5 stroke-[1.5] ${salesCrmExpanded ? "text-gray-700" : "text-gray-500"}`} />
              <span>Sales CRM</span>
              <span className="ml-auto text-gray-400">
                {salesCrmExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </span>
            </button>
            {salesCrmExpanded && (
              <div className="mt-2 ml-4 space-y-1">
                {navigationItems.map(item => (
                  <button
                    key={item.label}
                    onClick={() => navigateTo(item.label)}
                    className={`
                      flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm
                      transition-all duration-200
                      ${activeTab === item.label
                        ? "bg-indigo-50 text-indigo-700 font-medium"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                      }
                    `}
                  >
                    {item.icon}
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sales Module */}
          <div className="mt-5 pt-6 border-t border-gray-200">
            <button
              onClick={toggleSales}
              className={`
                flex items-center gap-3 px-3 py-3 w-full rounded-lg text-sm font-medium
                text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200
                ${salesExpanded ? "bg-gray-50 text-gray-900" : ""}
              `}
            >
              <Users className={`w-5 h-5 stroke-[1.5] ${salesExpanded ? "text-gray-700" : "text-gray-500"}`} />
              <span>Sales</span>
              <span className="ml-auto text-gray-400">
                {salesExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </span>
            </button>
            {salesExpanded && (
              <div className="mt-2 ml-4 space-y-1">
                {salesItems.map(item => (
                  <button
                    key={item.label}
                    onClick={() => handleFinanceNavigation(item.path)}
                    className={`
                      flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm
                      transition-all duration-200
                      ${pathname === item.path
                        ? "bg-indigo-50 text-indigo-700 font-medium"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                      }
                    `}
                  >
                    {item.icon}
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Purchases Module */}
          <div className="mt-2">
            <button
              onClick={togglePurchases}
              className={`
                flex items-center gap-3 px-3 py-3 w-full rounded-lg text-sm font-medium
                text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200
                ${purchasesExpanded ? "bg-gray-50 text-gray-900" : ""}
              `}
            >
              <ArrowDownCircle className={`w-5 h-5 stroke-[1.5] ${purchasesExpanded ? "text-gray-700" : "text-gray-500"}`} />
              <span>Purchases</span>
              <span className="ml-auto text-gray-400">
                {purchasesExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </span>
            </button>
            {purchasesExpanded && (
              <div className="mt-2 ml-4 space-y-1">
                {purchasesItems.map(item => (
                  <button
                    key={item.label}
                    onClick={() => handleFinanceNavigation(item.path)}
                    className={`
                      flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm
                      transition-all duration-200
                      ${pathname === item.path
                        ? "bg-indigo-50 text-indigo-700 font-medium"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                      }
                    `}
                  >
                    {item.icon}
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Inventory Module */}
          <div className="mt-2">
            <button
              onClick={toggleInventory}
              className={`
                flex items-center gap-3 px-3 py-3 w-full rounded-lg text-sm font-medium
                text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200
                ${inventoryExpanded ? "bg-gray-50 text-gray-900" : ""}
              `}
            >
              <Package className={`w-5 h-5 stroke-[1.5] ${inventoryExpanded ? "text-gray-700" : "text-gray-500"}`} />
              <span>Inventory</span>
              <span className="ml-auto text-gray-400">
                {inventoryExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </span>
            </button>
            {inventoryExpanded && (
              <div className="mt-2 ml-4 space-y-1">
                {inventoryItems.map(item => (
                  <button
                    key={item.label}
                    onClick={() => handleFinanceNavigation(item.path)}
                    className={`
                      flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm
                      transition-all duration-200
                      ${pathname === item.path
                        ? "bg-indigo-50 text-indigo-700 font-medium"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                      }
                    `}
                  >
                    {item.icon}
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reports Module */}
          <div className="mt-2">
            <button
              onClick={toggleReports}
              className={`
                flex items-center gap-3 px-3 py-3 w-full rounded-lg text-sm font-medium
                text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200
                ${reportsExpanded ? "bg-gray-50 text-gray-900" : ""}
              `}
            >
              <BarChart3 className={`w-5 h-5 stroke-[1.5] ${reportsExpanded ? "text-gray-700" : "text-gray-500"}`} />
              <span>Reports</span>
              <span className="ml-auto text-gray-400">
                {reportsExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </span>
            </button>
            {reportsExpanded && (
              <div className="mt-2 ml-4 space-y-1">
                {reportsItems.map(item => (
                  <button
                    key={item.label}
                    onClick={() => handleFinanceNavigation(item.path)}
                    className={`
                      flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm
                      transition-all duration-200
                      ${pathname === item.path
                        ? "bg-indigo-50 text-indigo-700 font-medium"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                      }
                    `}
                  >
                    {item.icon}
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Settings Section */}
          <div className="mt-5 pt-6 border-t border-gray-200">
            <button
              onClick={toggleSettings}
              className={`
                flex items-center gap-3 px-3 py-3 w-full rounded-lg text-sm font-medium
                text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all
                ${settingsExpanded ? "bg-gray-100 text-gray-900" : ""}
              `}
            >
              <LucideSettings className="w-5 h-5 text-gray-500" />
              <span>Settings</span>
              <span className="ml-auto text-gray-400">
                {settingsExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </span>
            </button>
            {settingsExpanded && (
              <div className="mt-2 ml-4 space-y-1">
                {settingsMenuItems.map(item => (
                  <Link key={item.href} href={item.href} onClick={onClose}>
                    <button
                      className={`
                        flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm
                        transition-all duration-200
                        ${isCurrentPath(item.href)
                          ? "bg-blue-50 text-indigo-700 font-medium"
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                        }
                      `}
                    >
                      {item.icon}
                      <span className="truncate">{item.label}</span>
                    </button>
                  </Link>
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
          <button
            onClick={() => setProfileSheetOpen(true)}
            className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-gray-50 transition-all duration-200 border border-transparent hover:border-gray-200"
          >
            <div className="relative">
              <Avatar src="/user.jpg" sx={{ width: 40, height: 40 }} className="ring-2 ring-gray-200" />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            </div>
            <div className="text-left min-w-0 flex-1">
              <div className="font-semibold text-sm text-gray-900 truncate">{user?.name || "User"}</div>
              <div className="text-xs text-gray-500 truncate">{user?.email || "user@crm.com"}</div>
            </div>
          </button>
        </div>
        {/* Logout */}
        <div className="px-4 pb-4">
          <button
            onClick={() => setShowLogoutDialog(true)}
            className="flex items-center gap-3 w-full p-3 rounded-lg text-sm font-medium hover:bg-red-50 text-red-600 transition-colors border border-transparent hover:border-red-200"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </footer>
      {/* Profile Sheet */}
      <Profilesheet
        open={profileSheetOpen}
        onClose={() => setProfileSheetOpen(false)}
        onLogout={handleLogout}
        onProfile={() => {router.push("/profile"); setProfileSheetOpen(false); onClose();}}
      />
      {/* Logout Confirmation Dialog */}
      <ConfirmationDialog
        show={showLogoutDialog}
        title="Logout"
        message="Are you sure you want to logout? You will be logged out of your account."
        onConfirm={() => { setShowLogoutDialog(false); handleLogout(); }}
        onCancel={() => setShowLogoutDialog(false)}
        confirmText="Logout"
        cancelText="Cancel"
        type="warning"
      />
    </Drawer>
  );
}

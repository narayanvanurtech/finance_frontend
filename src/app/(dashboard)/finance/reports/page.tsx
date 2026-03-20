"use client";
import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  Search,
  Plus,
  Star,
  Calendar,
  FileText,
  BarChart3,
  Users,
  Package,
  Activity,
  Zap,
  Filter,
  Download,
  Eye,
  Clock,
  Settings,
  TrendingUp,
  Database,
  Menu,
  X,
} from "lucide-react";

// Enhanced mock data with more realistic business reports
const reportCategories = [
  {
    name: "Sales & Revenue",
    icon: TrendingUp,
    color: "text-chart-1",
    reports: [
      {
        name: "Sales Performance Dashboard",
        type: "Interactive Dashboard",
        createdBy: "System Generated",
        lastRun: "2 hours ago",
        frequency: "Real-time",
        status: "Active",
        favorite: true,
        description: "Comprehensive sales metrics and KPIs",
      },
      {
        name: "Revenue by Customer Segment",
        type: "Analytical Report",
        createdBy: "Sarah Johnson",
        lastRun: "1 day ago",
        frequency: "Daily",
        status: "Active",
        favorite: false,
        description: "Customer segmentation analysis",
      },
      {
        name: "Sales Funnel Analysis",
        type: "Pipeline Report",
        createdBy: "System Generated",
        lastRun: "6 hours ago",
        frequency: "Weekly",
        status: "Active",
        favorite: true,
        description: "Lead conversion and pipeline metrics",
      },
      {
        name: "Product Performance Matrix",
        type: "Product Analysis",
        createdBy: "Mike Chen",
        lastRun: "3 hours ago",
        frequency: "Daily",
        status: "Active",
        favorite: false,
        description: "Top performing products and categories",
      },
      {
        name: "Sales Territory Analysis",
        type: "Geographic Report",
        createdBy: "System Generated",
        lastRun: "1 day ago",
        frequency: "Weekly",
        status: "Active",
        favorite: false,
        description: "Regional sales performance comparison",
      },
    ],
  },
  {
    name: "Inventory & Stock",
    icon: Package,
    color: "text-chart-2",
    reports: [
      {
        name: "Real-time Inventory Status",
        type: "Live Dashboard",
        createdBy: "System Generated",
        lastRun: "Live",
        frequency: "Real-time",
        status: "Active",
        favorite: true,
        description: "Current stock levels and alerts",
      },
      {
        name: "Inventory Turnover Analysis",
        type: "Financial Report",
        createdBy: "Emily Rodriguez",
        lastRun: "2 days ago",
        frequency: "Monthly",
        status: "Active",
        favorite: false,
        description: "Stock rotation and efficiency metrics",
      },
      {
        name: "Demand Forecasting Report",
        type: "Predictive Analytics",
        createdBy: "AI Engine",
        lastRun: "4 hours ago",
        frequency: "Daily",
        status: "Active",
        favorite: true,
        description: "ML-powered demand predictions",
      },
      {
        name: "Warehouse Optimization",
        type: "Operational Report",
        createdBy: "David Kim",
        lastRun: "1 week ago",
        frequency: "Weekly",
        status: "Active",
        favorite: false,
        description: "Storage efficiency and optimization",
      },
    ],
  },
  {
    name: "Financial Analytics",
    icon: BarChart3,
    color: "text-chart-3",
    reports: [
      {
        name: "Executive Financial Dashboard",
        type: "Executive Summary",
        createdBy: "System Generated",
        lastRun: "1 hour ago",
        frequency: "Real-time",
        status: "Active",
        favorite: true,
        description: "Key financial metrics and trends",
      },
      {
        name: "Cash Flow Projection",
        type: "Financial Forecast",
        createdBy: "Finance Team",
        lastRun: "6 hours ago",
        frequency: "Daily",
        status: "Active",
        favorite: true,
        description: "13-week rolling cash flow forecast",
      },
      {
        name: "Profit & Loss Analysis",
        type: "Financial Statement",
        createdBy: "System Generated",
        lastRun: "1 day ago",
        frequency: "Monthly",
        status: "Active",
        favorite: false,
        description: "Detailed P&L with variance analysis",
      },
      {
        name: "Budget vs Actual Performance",
        type: "Variance Report",
        createdBy: "Lisa Wang",
        lastRun: "2 days ago",
        frequency: "Monthly",
        status: "Active",
        favorite: false,
        description: "Budget performance tracking",
      },
    ],
  },
  {
    name: "GST & Tax Compliance",
    icon: FileText,
    color: "text-red-600",
    reports: [
      {
        name: "GSTR-1 Summary Report",
        type: "Tax Compliance",
        createdBy: "System Generated",
        lastRun: "2 hours ago",
        frequency: "Monthly",
        status: "Active",
        favorite: true,
        description: "Outward supplies summary for GST filing",
        link: "/dashboard/reports/gstr1summary",
      },
      {
        name: "GSTR-2 Summary Report",
        type: "Tax Compliance",
        createdBy: "System Generated",
        lastRun: "2 hours ago",
        frequency: "Monthly",
        status: "Active",
        favorite: true,
        description: "Inward supplies and ITC summary",
        link: "/dashboard/reports/gstr2summary",
      },
      {
        name: "GST Reconciliation Report",
        type: "Reconciliation",
        createdBy: "Tax Team",
        lastRun: "1 day ago",
        frequency: "Monthly",
        status: "Active",
        favorite: false,
        description: "Auto vs manual GST data reconciliation",
      },
      {
        name: "Input Tax Credit Analysis",
        type: "ITC Report",
        createdBy: "System Generated",
        lastRun: "6 hours ago",
        frequency: "Weekly",
        status: "Active",
        favorite: false,
        description: "ITC eligibility and utilization analysis",
      },
      {
        name: "HSN-wise Sales Analysis",
        type: "Product Classification",
        createdBy: "System Generated",
        lastRun: "1 day ago",
        frequency: "Monthly",
        status: "Active",
        favorite: false,
        description: "HSN code wise sales and tax analysis",
      },
      {
        name: "TDS Compliance Report",
        type: "Tax Compliance",
        createdBy: "Finance Team",
        lastRun: "3 days ago",
        frequency: "Monthly",
        status: "Active",
        favorite: false,
        description: "TDS deduction and filing compliance",
      },
    ],
  },
  {
    name: "Customer Intelligence",
    icon: Users,
    color: "text-orange-600",
    reports: [
      {
        name: "Customer Lifetime Value",
        type: "Customer Analytics",
        createdBy: "Marketing Team",
        lastRun: "5 hours ago",
        frequency: "Weekly",
        status: "Active",
        favorite: true,
        description: "CLV analysis and segmentation",
      },
      {
        name: "Churn Risk Assessment",
        type: "Predictive Report",
        createdBy: "AI Engine",
        lastRun: "12 hours ago",
        frequency: "Daily",
        status: "Active",
        favorite: true,
        description: "At-risk customer identification",
      },
      {
        name: "Customer Satisfaction Trends",
        type: "Survey Analysis",
        createdBy: "Support Team",
        lastRun: "1 day ago",
        frequency: "Weekly",
        status: "Active",
        favorite: false,
        description: "NPS and satisfaction metrics",
      },
    ],
  },
  {
    name: "Operations & Performance",
    icon: Activity,
    color: "text-chart-4",
    reports: [
      {
        name: "Operational KPI Dashboard",
        type: "Performance Dashboard",
        createdBy: "System Generated",
        lastRun: "30 minutes ago",
        frequency: "Real-time",
        status: "Active",
        favorite: true,
        description: "Key operational metrics",
      },
      {
        name: "Process Efficiency Report",
        type: "Process Analysis",
        createdBy: "Operations Team",
        lastRun: "4 hours ago",
        frequency: "Daily",
        status: "Active",
        favorite: false,
        description: "Workflow and process optimization",
      },
      {
        name: "Quality Control Metrics",
        type: "Quality Report",
        createdBy: "QA Team",
        lastRun: "2 hours ago",
        frequency: "Daily",
        status: "Active",
        favorite: false,
        description: "Quality assurance metrics",
      },
    ],
  },
  {
    name: "Automation & Workflows",
    icon: Zap,
    color: "text-chart-5",
    reports: [
      {
        name: "Automation Performance",
        type: "System Report",
        createdBy: "System Generated",
        lastRun: "1 hour ago",
        frequency: "Hourly",
        status: "Active",
        favorite: false,
        description: "Automated process performance",
      },
      {
        name: "Workflow Bottleneck Analysis",
        type: "Process Report",
        createdBy: "Tech Team",
        lastRun: "6 hours ago",
        frequency: "Daily",
        status: "Active",
        favorite: true,
        description: "Identify workflow inefficiencies",
      },
    ],
  },
];

const sidebarSections = [
  {
    title: "Quick Access",
    items: [
      { label: "Favorites", icon: Star, count: 8 },
      { label: "Recent Reports", icon: Clock, count: 12 },
      { label: "Scheduled Reports", icon: Calendar, count: 5 },
    ],
  },
  {
    title: "Report Types",
    items: [
      { label: "All Reports", icon: FileText, count: 28 },
      { label: "Custom Reports", icon: Settings, count: 7 },
      { label: "System Reports", icon: Database, count: 21 },
    ],
  },
  {
    title: "Categories",
    items: reportCategories.map((cat) => ({
      label: cat.name,
      icon: cat.icon,
      count: cat.reports.length,
      color: cat.color,
    })),
  },
];

export default function ReportsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Reports");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleReportClick = (report: any) => {
    if (report.link) {
      router.push(report.link);
    } else {
      // Handle default report view or show coming soon message
      //console.log(`Opening report: ${report.name}`);
    }
  };

  // Enhanced filtering logic
  const filteredCategories = useMemo(() => {
    let categories = reportCategories;

    // Filter by active category
    if (
      activeCategory &&
      activeCategory !== "All Reports" &&
      activeCategory !== "Favorites"
    ) {
      categories = categories.filter((cat) => cat.name === activeCategory);
    }

    // Apply search and favorites filter
    return categories
      .map((cat) => ({
        ...cat,
        reports: cat.reports.filter((report) => {
          const matchesSearch =
            report.name.toLowerCase().includes(search.toLowerCase()) ||
            report.type.toLowerCase().includes(search.toLowerCase()) ||
            report.description.toLowerCase().includes(search.toLowerCase());
          const matchesFavorites =
            !showFavoritesOnly ||
            (activeCategory === "Favorites" && report.favorite) ||
            activeCategory !== "Favorites";
          return matchesSearch && matchesFavorites;
        }),
      }))
      .filter((cat) => cat.reports.length > 0);
  }, [search, activeCategory, showFavoritesOnly]);

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
    if (category === "Favorites") {
      setShowFavoritesOnly(true);
    } else {
      setShowFavoritesOnly(false);
    }
    // Close mobile sidebar when category is selected
    setIsSidebarOpen(false);
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      Active: "bg-success/20 text-success border-success/30",
      Inactive: "bg-muted text-muted-foreground border-muted",
      Error: "bg-destructive/20 text-destructive border-destructive/30",
    };
    return (
      <span
        className={`px-2 py-1 text-xs rounded-md border ${
          statusColors[status as keyof typeof statusColors] ||
          statusColors.Active
        }`}
      >
        {status}
      </span>
    );
  };

  const totalReports = reportCategories.reduce(
    (sum, cat) => sum + cat.reports.length,
    0
  );
  const favoriteReports = reportCategories.reduce(
    (sum, cat) => sum + cat.reports.filter((r) => r.favorite).length,
    0
  );

  return (
    <div className="flex min-h-screen">
      {/* Main Content */}
      <main className="flex-1 w-full lg:max-w-none overflow-hidden lg:mr-78">
        <div className="p-4 lg:p-8 flex flex-col h-full">
          {/* Mobile Header with Menu Button */}
          <div className="flex items-center gap-4 mb-6 lg:hidden">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 border border-border rounded-lg hover:bg-accent transition-colors"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {activeCategory === "All Reports"
                  ? "All Reports"
                  : activeCategory}
              </h2>
            </div>
          </div>

          {/* Desktop Header Section */}
          <div className="mb-6 lg:mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 lg:mb-6 gap-4">
              <div className="hidden lg:block">
                <h2 className="text-2xl lg:text-3xl font-bold mb-2 text-foreground">
                  {activeCategory === "All Reports"
                    ? "All Reports"
                    : activeCategory}
                </h2>
                <p className="text-muted-foreground">
                  {activeCategory === "Favorites"
                    ? `${favoriteReports} favorite reports`
                    : `Manage and analyze your business reports`}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button className="flex items-center justify-center gap-2 px-4 py-2 text-sm border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors">
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export All</span>
                  <span className="sm:hidden">Export</span>
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Create Report</span>
                  <span className="sm:hidden">Create</span>
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 lg:gap-4">
              <div className="relative flex-1 max-w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-ring focus:border-ring"
                />
              </div>
              <button className="flex items-center justify-center gap-2 px-4 py-2 text-sm border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors">
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>
          </div>

          {/* Reports Content - Only this should scroll */}
          <div className="space-y-6 lg:space-y-8 flex-1 overflow-y-auto lg:max-h-[calc(100vh-13rem)]">
            {filteredCategories.length === 0 ? (
              <div className="bg-card border border-border rounded-lg shadow-sm">
                <div className="py-12 lg:py-16 text-center">
                  <FileText className="w-10 h-10 lg:w-12 lg:h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-base lg:text-lg font-medium mb-2 text-card-foreground">
                    No reports found
                  </h3>
                  <p className="mb-4 lg:mb-6 text-sm lg:text-base text-muted-foreground">
                    Try adjusting your search criteria or create a new report.
                  </p>
                  <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                    <Plus className="w-4 h-4" />
                    Create New Report
                  </button>
                </div>
              </div>
            ) : (
              filteredCategories.map((category) => (
                <div
                  key={category.name}
                  className="bg-card border border-border rounded-lg shadow-sm"
                >
                  <div className="px-4 lg:px-6 py-4 border-b border-border bg-muted">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-card shadow-sm">
                        <category.icon
                          className={`w-4 h-4 lg:w-5 lg:h-5 ${category.color}`}
                        />
                      </div>
                      <div>
                        <h3 className="text-base lg:text-lg font-semibold text-foreground">
                          {category.name}
                        </h3>
                        <p className="text-xs lg:text-sm mt-1 text-muted-foreground">
                          {category.reports.length} reports available
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Card View */}
                  <div className="lg:hidden">
                    {category.reports.map((report, index) => (
                      <div
                        key={report.name}
                        className={`p-4 border-b border-border ${
                          index === category.reports.length - 1
                            ? "border-b-0"
                            : ""
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-start gap-2 flex-1">
                            {report.favorite && (
                              <Star
                                className="w-4 h-4 mt-0.5 flex-shrink-0 text-yellow-500"
                                fill="currentColor"
                              />
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="font-semibold text-sm mb-1 truncate text-foreground">
                                {report.name}
                              </div>
                              <div className="text-xs mb-2 text-muted-foreground">
                                {report.description}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            <button 
                              className="p-2 hover:bg-accent rounded transition-colors"
                              onClick={() => handleReportClick(report)}
                            >
                              <Eye className="w-4 h-4 text-primary" />
                            </button>
                            <button className="p-2 hover:bg-accent rounded transition-colors">
                              <MoreHorizontal className="w-4 h-4 text-primary" />
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="inline-flex items-center px-2 py-1 rounded-md font-medium bg-muted text-muted-foreground">
                            {report.type}
                          </span>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-muted-foreground">
                            {report.lastRun}
                          </span>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-muted-foreground">
                            {report.frequency}
                          </span>
                          <div className="ml-auto">
                            {getStatusBadge(report.status)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="text-left font-semibold py-4 px-6 text-sm text-muted-foreground">
                            Report
                          </th>
                          <th className="text-left font-semibold py-4 px-6 text-sm text-muted-foreground">
                            Type
                          </th>
                          <th className="text-left font-semibold py-4 px-6 text-sm text-muted-foreground">
                            Last Run
                          </th>
                          <th className="text-left font-semibold py-4 px-6 text-sm text-muted-foreground">
                            Frequency
                          </th>
                          <th className="text-left font-semibold py-4 px-6 text-sm text-muted-foreground">
                            Status
                          </th>
                          <th className="text-left font-semibold py-4 px-6 text-sm text-muted-foreground">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {category.reports.map((report, index) => (
                          <tr
                            key={report.name}
                            className={`border-b border-border hover:bg-accent transition-colors ${
                              index === category.reports.length - 1
                                ? "border-b-0"
                                : ""
                            }`}
                          >
                            <td className="py-4 px-6">
                              <div className="flex items-start gap-3">
                                {report.favorite && (
                                  <Star
                                    className="w-4 h-4 text-yellow-500"
                                    fill="currentColor"
                                  />
                                )}
                                <div>
                                  <div className="font-semibold mb-1 text-foreground">
                                    {report.name}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {report.description}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground">
                                {report.type}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-sm text-muted-foreground">
                              {report.lastRun}
                            </td>
                            <td className="py-4 px-6 text-sm text-muted-foreground">
                              {report.frequency}
                            </td>
                            <td className="py-4 px-6">
                              {getStatusBadge(report.status)}
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2">
                                <button 
                                  className="p-2 hover:bg-accent rounded transition-colors"
                                  onClick={() => handleReportClick(report)}
                                >
                                  <Eye className="w-4 h-4 text-primary" />
                                </button>
                                <button className="p-2 hover:bg-accent rounded transition-colors">
                                  <MoreHorizontal className="w-4 h-4 text-primary" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
      {/* Sidebar */}
      <aside
        className={`
          fixed
          inset-y-0 right-0
          w-72 h-screen lg:top-32 lg:right-8 lg:h-[80vh] lg:rounded-md
          bg-sidebar border-l border-sidebar-border shadow-lg 
          overflow-y-auto 
          z-50 lg:z-10
          transform transition-transform duration-300 ease-in-out
          ${
            isSidebarOpen
              ? "translate-x-0"
              : "translate-x-full lg:translate-x-0"
          }
        `}
      >
        <div className="p-4 lg:p-6">
          {/* Mobile Close Button */}
          <div className="flex justify-end lg:hidden mb-4">
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Header */}
          <div className="mb-6 lg:mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary">
                <BarChart3 className="w-5 h-5 lg:w-6 lg:h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg lg:text-xl font-bold text-foreground">
                  Reports Center
                </h1>
                <p className="text-xs lg:text-sm text-muted-foreground">
                  {totalReports} total reports
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Sections */}
          <nav className="space-y-4 lg:space-y-6">
            {sidebarSections.map((section) => (
              <div key={section.title}>
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-2 lg:mb-3 text-muted-foreground">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const IconComponent = item.icon;
                    const isActive = activeCategory === item.label;
                    return (
                      <button
                        key={item.label}
                        className={`w-full flex items-center justify-between px-3 py-2 lg:py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? "bg-sidebar-primary/15 text-sidebar-primary border border-sidebar-primary/30"
                            : "text-sidebar-foreground hover:bg-sidebar-accent/10"
                        }`}
                        onClick={() => handleCategoryClick(item.label)}
                      >
                        <div className="flex items-center gap-2 lg:gap-3">
                          <IconComponent
                            className={`w-4 h-4 ${
                              "color" in item && item.color ? item.color : ""
                            }`}
                          />
                          <span className="truncate">{item.label}</span>
                        </div>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                            isActive
                              ? "bg-primary/20 text-primary"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {item.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </aside>
    </div>
  );
}

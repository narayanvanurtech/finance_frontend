"use client";

import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { FilterList, Add } from "@mui/icons-material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import {
  Button,
  Menu,
  MenuItem,
} from "@mui/material";
import { Parser } from "json2csv";

import { useAuthStore } from "@/stores/salesCrmStore/useAuthStore";
import { useClientStore } from "@/stores/financeStore/useClientStore";
import ConfirmationDialog from "@/components/sales-crm/ConfirmationDialog";

interface SubNavProps {
  activeTab: string;
  isFilterActive?: boolean;
  setIsFilterActive?: React.Dispatch<React.SetStateAction<boolean>>;
  selectedItems?: string[];
  onClearSelection?: () => void;
}

interface SectionConfig {
  dropdownLabel: string;
  createButtonText: string;
  actionMenuItems: string[];
  pageTitle: string;
  pageSubtitle?: string;
}

const sectionConfigs: Record<string, SectionConfig> = {
  clients: {
    dropdownLabel: "All Clients",
    createButtonText: "Create Client",
    pageTitle: "Client Management",
    pageSubtitle: "Manage your client database and relationships",
    actionMenuItems: [
      "Mass Delete",
      "Export Clients",
      "Import Clients from CSV",
    ],
  },
  invoices: {
    dropdownLabel: "All Invoices",
    createButtonText: "Create Invoice",
    pageTitle: "Invoice Management",
    pageSubtitle: "Create and track your invoices",
    actionMenuItems: [
      "Mass Delete",
      "Export Invoices",
      "Import Invoices from CSV",
    ],
  },
  estimates: {
    dropdownLabel: "All Estimates",
    createButtonText: "Create Estimate",
    pageTitle: "Estimate Management",
    pageSubtitle: "Create and manage estimates for clients",
    actionMenuItems: [
      "Mass Delete",
      "Export Estimates",
      "Import Estimates from CSV",
    ],
  },
  payments: {
    dropdownLabel: "All Payments",
    createButtonText: "Record Payment",
    pageTitle: "Payment Management",
    pageSubtitle: "Track and record client payments",
    actionMenuItems: [
      "Mass Delete",
      "Export Payments",
    ],
  },
  expenses: {
    dropdownLabel: "All Expenses",
    createButtonText: "Add Expense",
    pageTitle: "Expense Management",
    pageSubtitle: "Track and manage business expenses",
    actionMenuItems: [
      "Mass Delete",
      "Export Expenses",
      "Import Expenses from CSV",
    ],
  },
};

export default function FinanceSubNav({
  activeTab,
  isFilterActive,
  setIsFilterActive,
  selectedItems = [],
  onClearSelection,
}: SubNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const currentSection = getCurrentSection();
  const config = sectionConfigs[currentSection] || sectionConfigs.clients;
  const { user } = useAuthStore();
  const { clients, fetchClientsByUser, deleteClient } = useClientStore();

  const [selectedOption, setSelectedOption] = useState(config.dropdownLabel);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState({
    title: "",
    message: "",
    type: "success" as "success" | "danger" | "warning" | "info",
  });
  const [isProcessing, setIsProcessing] = useState(false);

  function getCurrentSection() {
    if (!pathname) return "clients";
    
    const pathParts = pathname.split("/");
    
    // Route structure: /finance/sales/section or /finance/section
    if (pathParts[1] === "finance") {
      if (pathParts[2] === "sales") {
        return pathParts[3] || "clients";
      }
      return pathParts[2] || "clients";
    }
    
    return pathParts[1] || "clients";
  }

  // Update selected option when section changes
  useEffect(() => {
    setSelectedOption(config.dropdownLabel);
  }, [currentSection, config.dropdownLabel]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleFilterClick = () => {
    if (setIsFilterActive) {
      setIsFilterActive((prev) => !prev);
    }
  };

  const handleCreateClick = () => {
    let route = "";
    switch (currentSection) {
      case "clients":
        // This will trigger the modal in the clients page
        route = "/finance/clients/create";
        break;
      case "invoices":
        route = "/finance/invoices/create";
        break;
      case "estimates":
        route = "/finance/estimates/create";
        break;
      case "payments":
        route = "/finance/payments/create";
        break;
      case "expenses":
        route = "/finance/expenses/create";
        break;
      default:
        route = `/finance/${currentSection}/create`;
    }
    router.push(route);
  };

  useEffect(() => {
    if (setIsFilterActive) {
      setIsFilterActive(false);
    }
  }, [pathname, setIsFilterActive]);

  const handleExportClients = async () => {
    setIsProcessing(true);
    try {
      setSuccessMessage({
        title: "Processing",
        message: "Preparing clients data for export...",
        type: "info",
      });
      setShowSuccessDialog(true);

      if (!user?.companyId) {
        throw new Error("Company ID is required to export clients");
      }

      // Ensure we have the latest client data
      await fetchClientsByUser(user.companyId);
      
      // Define fields for CSV
      const fields = [
        { label: "ID", value: "_id" },
        { label: "Business Name", value: "businessName" },
        { label: "Email", value: "email" },
        { label: "Phone", value: "phone" },
        { label: "Industry", value: "industry" },
        { label: "Client Type", value: "clientType" },
        { label: "GSTIN", value: "gstin" },
        { label: "PAN", value: "pan" },
        { label: "Tax Treatment", value: "taxTreatment" },
        { label: "Street", value: "address.street" },
        { label: "City", value: "address.city" },
        { label: "State", value: "address.state" },
        { label: "Postal Code", value: "address.postalCode" },
        { label: "Country", value: "address.country" },
        { label: "Created At", value: "createdAt" },
        { label: "Updated At", value: "updatedAt" },
      ];

      // Create the parser with options
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(clients || []);

      // Create a Blob with the CSV data
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

      // Create a temporary link element and trigger download
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.setAttribute(
        "download",
        `clients_export_${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccessMessage({
        title: "Success",
        message: "Clients exported successfully!",
        type: "success",
      });
    } catch (error) {
      setSuccessMessage({
        title: "Error",
        message:
          error instanceof Error ? error.message : "Failed to export clients",
        type: "danger",
      });
    } finally {
      setIsProcessing(false);
      setShowSuccessDialog(true);
      setTimeout(() => {
        setShowSuccessDialog(false);
        setSuccessMessage({ title: "", message: "", type: "success" });
      }, 2000);
    }
  };

  const handleBulkDelete = async () => {
    if (isProcessing || selectedItems.length === 0) return;

    setIsProcessing(true);
    try {
      switch (currentSection) {
        case "clients":
          if (!user?.companyId) {
            throw new Error("Company ID is required to delete clients");
          }
          
          // Delete each selected client
          for (const clientId of selectedItems) {
            await deleteClient(user.companyId, clientId);
          }
          
          setSuccessMessage({
            title: "Success",
            message: `Successfully deleted ${selectedItems.length} clients.`,
            type: "success",
          });
          
          // Refresh clients data
          await fetchClientsByUser(user.companyId);
          break;

        default:
          throw new Error("Bulk delete not implemented for this section");
      }

      // Clear selections
      onClearSelection?.();
    } catch (error) {
      setSuccessMessage({
        title: "Error",
        message:
          error instanceof Error ? error.message : "Failed to delete items",
        type: "danger",
      });
    } finally {
      setShowDeleteConfirmation(false);
      setShowSuccessDialog(true);
      setIsProcessing(false);
      setTimeout(() => {
        setShowSuccessDialog(false);
      }, 3000);
    }
  };

  const handleActionMenuItemClick = async (action: string) => {
    handleMenuClose();

    // Check if action requires selection and no items are selected
    const actionsRequiringSelection = [
      "Mass Delete",
    ];

    if (
      selectedItems.length === 0 &&
      actionsRequiringSelection.includes(action)
    ) {
      setSuccessMessage({
        title: "Warning",
        message: `Please select ${currentSection} before performing this bulk action.`,
        type: "warning",
      });
      setShowSuccessDialog(true);
      return;
    }

    switch (action) {
      case "Mass Delete":
        setShowDeleteConfirmation(true);
        break;
      case "Export Clients":
        handleExportClients();
        break;
      case "Import Clients from CSV":
        setShowImportDialog(true);
        break;
      default:
        setSuccessMessage({
          title: "Not Implemented",
          message: `${action} functionality is coming soon.`,
          type: "info",
        });
        setShowSuccessDialog(true);
    }
  };

  return (
    <div className="w-full bg-white">
      <div className="px-6 py-4">
        {/* Title Row */}
        <div className="flex flex-col gap-1 lg:flex-row lg:items-center lg:justify-between">
          {/* Left: Title and Subtitle */}
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-900 truncate">
                {config.pageTitle}
              </h1>
              {/* Filter Button to the right of the title - Only show if setIsFilterActive is provided */}
              {setIsFilterActive && (
                <button
                  onClick={handleFilterClick}
                  className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm ml-4 ${
                    isFilterActive
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                  }`}
                  style={{ minWidth: 90 }}
                >
                  <FilterList fontSize="small" />
                  <span>Filter</span>
                </button>
              )}
            </div>
            {config.pageSubtitle && (
              <p className="text-sm text-gray-600 truncate mt-1">
                {config.pageSubtitle}
              </p>
            )}
          </div>
        </div>
        
        {/* Controls Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 flex-shrink-0 mt-4">
          {/* Left: Search placeholder */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="text-sm text-gray-500">
              {clients?.length || 0} {currentSection} found
            </div>
          </div>
          
          {/* Right: Actions + Create */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <Button
              onClick={() => {
                if (user?.companyId) {
                  fetchClientsByUser(user.companyId);
                }
              }}
              size="small"
              sx={{
                fontSize: "0.875rem",
                fontWeight: 500,
                textTransform: "none",
                border: "1px solid #D1D5DC",
                color: "#374151",
                padding: "8px 14px",
                borderRadius: "8px",
                backgroundColor: "white",
                '&:hover': {
                  backgroundColor: "#F9FAFB",
                  borderColor: "#9CA3AF",
                },
              }}
            >
              Refresh
            </Button>
            <Button
              aria-controls="actions-menu"
              aria-haspopup="true"
              onClick={handleMenuOpen}
              size="small"
              sx={{
                fontSize: "0.875rem",
                fontWeight: 500,
                textTransform: "none",
                border: "1px solid #D1D5DC",
                color: "#374151",
                padding: "8px 14px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                minWidth: "100px",
                backgroundColor: "white",
                '&:hover': {
                  backgroundColor: "#F9FAFB",
                  borderColor: "#9CA3AF",
                },
              }}
              endIcon={anchorEl ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
            >
              Actions
              {selectedItems.length > 0 && (
                <span className="ml-2 bg-indigo-100 text-indigo-800 text-xs font-medium px-2 py-0.5 rounded-full">
                  {selectedItems.length}
                </span>
              )}
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreateClick}
              sx={{
                backgroundColor: '#4F46E5',
                color: 'white',
                fontWeight: 600,
                textTransform: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                '&:hover': {
                  backgroundColor: '#3730A3',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                },
              }}
            >
              {config.createButtonText}
            </Button>
          </div>
        </div>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          transformOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
          PaperProps={{
            sx: {
              mt: 1.2,
              borderRadius: "8px",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            },
          }}
        >
          {config.actionMenuItems.map((item) => (
            <MenuItem
              key={item}
              onClick={() => handleActionMenuItemClick(item)}
              sx={{
                fontSize: "0.875rem",
                py: 1.5,
                px: 3,
                minWidth: "220px",
                '&:hover': {
                  backgroundColor: "#F3F4F6",
                },
              }}
            >
              {item}
            </MenuItem>
          ))}
        </Menu>
      </div>

      <ConfirmationDialog
        show={showDeleteConfirmation}
        title={`Delete ${
          currentSection.charAt(0).toUpperCase() + currentSection.slice(1)
        }`}
        message={`Are you sure you want to delete ${selectedItems.length} ${currentSection}? This action cannot be undone.`}
        onConfirm={handleBulkDelete}
        onCancel={() => setShowDeleteConfirmation(false)}
        confirmText={isProcessing ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        type="danger"
        disableConfirm={isProcessing}
        disableCancel={isProcessing}
      />

      <ConfirmationDialog
        show={showSuccessDialog}
        title={successMessage.title}
        message={successMessage.message}
        onConfirm={() => setShowSuccessDialog(false)}
        onCancel={() => setShowSuccessDialog(false)}
        confirmText="OK"
        type={successMessage.type}
      />
    </div>
  );
}

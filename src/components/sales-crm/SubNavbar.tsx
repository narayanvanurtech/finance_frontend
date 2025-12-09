"use client";

import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { FilterList, Add } from "@mui/icons-material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import {
  Button,
  Select,
  MenuItem,
  Menu,
} from "@mui/material";
import { Parser } from "json2csv";

import { useAuthStore } from "@/stores/salesCrmStore/useAuthStore";
import { useLeadsStore } from "@/stores/salesCrmStore/useLeadsStore";
import { useMeetingsStore } from "@/stores/salesCrmStore/useMeetingsStore";
import { useCallsStore } from "@/stores/salesCrmStore/useCallsStore";
import { pageLimit } from "@/utils/data";
import { useTasksStore } from "@/stores/salesCrmStore/useTasksStore";
import { useSelectedItemsStore } from "@/stores/salesCrmStore/useSelectedItemsStore";
import ImportLeadsDialog from "@/components/sales-crm/ImportLeadsDialog";
import ConfirmationDialog from "@/components/sales-crm/ConfirmationDialog";
import AssignLeadsDialog from "@/components/sales-crm/AssignLeadsDialog";
import BulkMailDialog from "@/components/sales-crm/BulkMailDialog";
import EmailDialog from "@/components/sales-crm/EmailDialog";
import { useDealsStore } from "@/stores/salesCrmStore/useDealsStore";
import { getAllLeads, getLeadById } from "@/api/leadsApi";
import { sendBulkEmailsToLeads } from "@/api/emailApi";
import SearchBar from './SearchBar';

interface SubNavProps {
  activeTab: string;
  isFilterActive: boolean;
  setIsFilterActive: React.Dispatch<React.SetStateAction<boolean>>;
}

interface SectionConfig {
  dropdownLabel: string;
  createButtonText: string;
  actionMenuItems: string[];
  pageTitle: string;
  pageSubtitle?: string;
}

const sectionConfigs: Record<string, SectionConfig> = {
  leads: {
    dropdownLabel: "All Leads",
    createButtonText: "Create Lead",
    pageTitle: "Lead Management",
    pageSubtitle: "New and track your sales leads effectively",

    actionMenuItems: [
      "Mass Delete",
      "Bulk Assign Leads", 
      "Export Leads",
      "Import Leads from CSV",
      "Send Bulk Mail",
    ],
  },
  tasks: {
    dropdownLabel: "All Tasks",
    createButtonText: "Create Task",
    pageTitle: "Task Management",
    pageSubtitle: "Organize and track your daily tasks and activities",
   
    actionMenuItems: [
      "Delete All Tasks",
      "Mass Delete",
      "Export Tasks",
      "Import Tasks from CSV",
    ],
  },
  deals: {
    dropdownLabel: "All Deals",
    createButtonText: "Create Deal",
    pageTitle: "Deal Management",
    pageSubtitle: "Track your sales pipeline and close more deals",
   
    actionMenuItems: [
      "Mass Delete",
      // "Export Deals",
      // "Import Deals from CSV",
      // "Bulk Update Status",
    ],
  },
  contacts: {
    dropdownLabel: "All Contacts",
    createButtonText: "Create Contact",
    pageTitle: "Contact Management",
    pageSubtitle: "Maintain your contact database and relationships",

    actionMenuItems: [
      "Mass Delete",
    
    ],
  },
  calls: {
    dropdownLabel: "All Calls",
    createButtonText: "Create Call",
    pageTitle: "Call Management",
    pageSubtitle: "Log and track your customer interactions",

    actionMenuItems: [
      "Mass Delete",
     
    ],
  },
  meetings: {
    dropdownLabel: "All Meetings",
    createButtonText: "Create Meeting",
    pageTitle: "Meeting Management",
    pageSubtitle: "Schedule and manage your client meetings",

    actionMenuItems: [
      "Mass Delete",
    ],
  },
};

export default function SubNav({
  activeTab,
  isFilterActive,
  setIsFilterActive,
}: SubNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const currentSection = getCurrentSection();
  const config = sectionConfigs[currentSection] || sectionConfigs.leads;
  const { user } = useAuthStore();
  const { bulkDeleteLeads, bulkAssignLeads, fetchLeads } = useLeadsStore();
  const { deleteAllMeetings, bulkDeleteMeetings, fetchMeetings } = useMeetingsStore();
  const { bulkDeleteCalls, fetchAllCalls } = useCallsStore();
  const { bulkDeleteTasks, fetchTasks, deleteAllTasks } = useTasksStore();
  const { selectedItems, clearSelectedItems } = useSelectedItemsStore();
  const { bulkDeleteDeals, setFilters } = useDealsStore();

  const [selectedOption, setSelectedOption] = useState(config.dropdownLabel);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showBulkMailDialog, setShowBulkMailDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [selectedLeadDetails, setSelectedLeadDetails] = useState<{ email: string; name: string } | null>(null);
  const [successMessage, setSuccessMessage] = useState({
    title: "",
    message: "",
    type: "success" as "success" | "danger" | "warning" | "info",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  // Remove getSearchableFields, searchField, searchValue, setSearchField, setSearchValue from SubNavbar

function getCurrentSection() {
  if (!pathname) return "leads"; // Default fallback
  
  const pathParts = pathname.split("/");
  
  // New route structure: /sales-crm/section
  if (pathParts[1] === "sales-crm") {
    return pathParts[2] || "leads"; // Default to leads if no section specified
  }
  
  // Fallback to old structure if needed
  return pathParts[1] || "leads"; // Default to leads if no section specified
};

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
    setIsFilterActive((prev) => !prev);
  };

const handleCreateClick = () => {
  const route = `/sales-crm/${currentSection}/add`;
  router.push(route);
};

  useEffect(() => {
    console.log(pathname)
    setIsFilterActive(false);
  }, [pathname])
  

  const handleExportLeads = async () => {
    setIsProcessing(true);
    try {
      setSuccessMessage({
        title: "Processing",
        message: "Preparing leads data for export...",
        type: "info",
      });
      setShowSuccessDialog(true);

      const response = await getAllLeads(user?.companyId || "");
      const leads = response.data.response;

      // Define fields for CSV
      const fields = [
        { label: "ID", value: "id" },
        { label: "Company", value: "company" },
        { label: "First Name", value: "firstName" },
        { label: "Last Name", value: "lastName" },
        { label: "Full Name", value: "fullName" },
        { label: "Email", value: "email" },
        { label: "Phone", value: "phone" },
        { label: "Website", value: "website" },
        { label: "Title", value: "title" },
        { label: "Industry", value: "industry" },
        { label: "Lead Source", value: "leadSource" },
        { label: "Lead Status", value: "leadStatus" },
        { label: "Priority", value: "priority" },
        { label: "Status", value: "status" },
        { label: "Follow Up Date", value: "followUpDate" },
        { label: "Last Status Change", value: "lastStatusChange" },
        { label: "Owner Name", value: "ownerName" },
        { label: "Owner Email", value: "ownerEmail" },
        { label: "Street", value: "street" },
        { label: "City", value: "city" },
        { label: "State", value: "state" },
        { label: "Postal Code", value: "postalCode" },
        { label: "Country", value: "country" },
      ];

      // Create the parser with options
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(leads);

      // Create a Blob with the CSV data
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

      // Create a temporary link element and trigger download
      const link = document.createElement("a");
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute(
          "download",
          `leads_export_${new Date().toISOString().split("T")[0]}.csv`
        );
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      setSuccessMessage({
        title: "Success",
        message: "Leads exported successfully!",
        type: "success",
      });
    } catch (error) {
      setSuccessMessage({
        title: "Error",
        message:
          error instanceof Error ? error.message : "Failed to export leads",
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

  const handleExportTasks = async () => {
    setIsProcessing(true);
    try {
      setSuccessMessage({
        title: "Processing",
        message: "Preparing tasks data for export...",
        type: "info",
      });
      setShowSuccessDialog(true);

      // Fetch tasks using the task store
      if (!user?.companyId) {
        throw new Error("Company ID is required to export tasks");
      }

      await fetchTasks(user.companyId);
      const tasks = useTasksStore.getState().tasks;

      // Define fields for CSV
      const fields = [
        { label: "ID", value: "id" },
        { label: "Title", value: "title" },
        { label: "Description", value: "description" },
        { label: "Priority", value: "priority" },
        { label: "Status", value: "status" },
        { label: "Task Owner", value: "taskOwner.name" },
        { label: "Task Owner Email", value: "taskOwner.email" },
        { label: "Assigned To", value: "assign.name" },
        { label: "Assigned Email", value: "assign.email" },
        { label: "Lead Name", value: (row: any) => `${row.lead?.firstName || ''} ${row.lead?.lastName || ''}`.trim() },
        { label: "Lead Email", value: "lead.email" },
        { label: "Lead Phone", value: "lead.phone" },
        { label: "Company", value: "company.name" },
        { label: "Created At", value: "createdAt" },
        { label: "Updated At", value: "updatedAt" },
        { label: "Completed At", value: "completedAt" },
      ];

      // Create the parser with options
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(tasks);

      // Create a Blob with the CSV data
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

      // Create a temporary link element and trigger download
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.setAttribute(
        "download",
        `tasks_export_${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccessMessage({
        title: "Success",
        message: "Tasks exported successfully!",
        type: "success",
      });
    } catch (error) {
      setSuccessMessage({
        title: "Error",
        message:
          error instanceof Error ? error.message : "Failed to export tasks",
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
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      switch (currentSection) {

        case "leads":
          if (selectedItems.length > 0) {
            if (!user?.companyId) {
              throw new Error("Company ID is required to delete leads");
            }
            await bulkDeleteLeads(selectedItems, user.companyId);
            setSuccessMessage({
              title: "Success",
              message: `Successfully deleted ${selectedItems.length} leads.`,
              type: "success",
            });
          }
          break;

        case "tasks":
          if (selectedItems.length > 0) {
            await bulkDeleteTasks(selectedItems);
            setSuccessMessage({
              title: "Success",
              message: `Successfully deleted ${selectedItems.length} tasks.`,
              type: "success",
            });
          } else {
            // Delete all tasks when no specific items are selected
            if (!user?.companyId) {
              throw new Error("Company ID is required to delete all tasks");
            }
            await deleteAllTasks(user.companyId);
            setSuccessMessage({
              title: "Success",
              message: "Successfully deleted all tasks.",
              type: "success",
            });
          }
          // Refresh tasks after deletion
          if (user?.companyId) {
            await fetchTasks(user.companyId);
          }
          break;

        case "meetings":
          if (selectedItems.length > 0) {
            await bulkDeleteMeetings(selectedItems);
            setSuccessMessage({
              title: "Success",
              message: `Successfully deleted ${selectedItems.length} meetings.`,
              type: "success",
            });
          } else {
            // Delete all meetings when no specific items are selected
            if (!user?.companyId) {
              throw new Error('Company ID is required to delete all meetings');
            }
            await deleteAllMeetings();
            setSuccessMessage({
              title: "Success",
              message: "All meetings have been deleted.",
              type: "success",
            });
            
            // Refresh meetings after deletion
            if (user?.companyId) {
              await fetchMeetings({
                page: 1,
                limit: pageLimit,
                companyId: user.companyId
              });
            }
          }
          break;

        case "deals":
          if (selectedItems.length > 0) {
            await bulkDeleteDeals(selectedItems);
            setSuccessMessage({
              title: "Success", 
              message: `Successfully deleted ${selectedItems.length} deals.`,
              type: "success",
            });
          }
          break;

        case "calls":
          if (selectedItems.length > 0) {
            await bulkDeleteCalls(selectedItems);
            setSuccessMessage({
              title: "Success",
              message: `Successfully deleted ${selectedItems.length} calls.`,
              type: "success",
            });
          }
          break;

        default:
          throw new Error("Bulk delete not implemented for this section");
      }

      // Reset the state after successful deletion
      clearSelectedItems();
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

  const handleBulkAssign = async (email: string) => {
    if (!selectedItems.length || !email || isProcessing) return;

    setIsProcessing(true);
    try {
      // Store selected items before clearing
      const itemsToAssign = [...selectedItems];

      // Clear selections first to prevent UI glitches
      clearSelectedItems();

      await bulkAssignLeads(itemsToAssign, email);

      setSuccessMessage({
        title: "Success",
        message: `${itemsToAssign.length} leads have been successfully assigned to ${email}.`,
        type: "success",
      });
    } catch (error) {
      setSuccessMessage({
        title: "Error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to assign leads. Please try again.",
        type: "danger",
      });
    } finally {
      setShowSuccessDialog(true);
      setIsProcessing(false);

      // Auto hide success/error message
      setTimeout(() => {
        setShowSuccessDialog(false);
        setSuccessMessage({ title: "", message: "", type: "success" });
      }, 2000);
    }
  };

  const handleSingleEmail = async (subject: string, message: string) => {
    if (!selectedLeadDetails || !subject || !message || isProcessing) return;

    setIsProcessing(true);
    try {
      await sendBulkEmailsToLeads({
        emails: [selectedLeadDetails.email],
        subject,
        message
      });

      setSuccessMessage({
        title: "Success",
        message: `Email sent successfully to ${selectedLeadDetails.name}.`,
        type: "success",
      });
    } catch (error) {
      setSuccessMessage({
        title: "Error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to send email. Please try again.",
        type: "danger",
      });
    } finally {
      setShowSuccessDialog(true);
      setIsProcessing(false);

      // Auto hide success/error message
      setTimeout(() => {
        setShowSuccessDialog(false);
        setSuccessMessage({ title: "", message: "", type: "success" });
      }, 2000);
    }
  };

  const handleBulkMail = async (subject: string, message: string) => {
    if (!selectedItems.length || !subject || !message || isProcessing) return;

    setIsProcessing(true);
    try {
      // Get the selected leads to extract their emails
      const response = await getAllLeads(user?.companyId || "");
      const allLeads = response.data.response;
      const selectedLeads = allLeads.filter((lead: any) => 
        selectedItems.includes(lead.id)
      );
      
      const emails = selectedLeads.map((lead: any) => lead.email).filter(Boolean);

      if (emails.length === 0) {
        throw new Error("No valid email addresses found in selected leads");
      }

      await sendBulkEmailsToLeads({
        emails,
        subject,
        message
      });

      setSuccessMessage({
        title: "Success",
        message: `Bulk email sent successfully to ${emails.length} leads.`,
        type: "success",
      });
    } catch (error) {
      setSuccessMessage({
        title: "Error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to send bulk email. Please try again.",
        type: "danger",
      });
    } finally {
      setShowSuccessDialog(true);
      setIsProcessing(false);

      // Auto hide success/error message
      setTimeout(() => {
        setShowSuccessDialog(false);
        setSuccessMessage({ title: "", message: "", type: "success" });
      }, 2000);
    }
  };

  const handleActionMenuItemClick = async (action: string) => {
    handleMenuClose();

    if (action === "Import Tasks from CSV") {
      setShowImportDialog(true);
      return;
    }

    // Check if action requires selection and no items are selected
    const actionsRequiringSelection = [
      "Mass Delete",
      "Bulk Assign Leads", 
      "Send Bulk Mail"
    ];

    // Special handling for tasks section
    if (currentSection === "tasks" && action === "Delete All Tasks") {
      // For "Delete All Tasks", we don't need selection check as it deletes all
    } else if (
      selectedItems.length === 0 &&
      actionsRequiringSelection.includes(action) &&
      currentSection !== "meetings"
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
      case "Delete All Tasks":
        setShowDeleteConfirmation(true);
        break;
      case "Export Tasks":
        handleExportTasks();
        break;
      case "Export Leads":
        handleExportLeads();
        break;
      case "Bulk Assign Leads":
        setShowAssignDialog(true);
        break;
      case "Send Bulk Mail":
        if (selectedItems.length === 1) {
          // Single lead selected - use EmailDialog
          try {
            const response = await getAllLeads(user?.companyId || "");
            const allLeads = response.data.response;
            const selectedLead = allLeads.find((lead: any) => lead.id === selectedItems[0]);
            
            if (selectedLead && selectedLead.email) {
              setSelectedLeadDetails({
                email: selectedLead.email,
                name: selectedLead.fullName || `${selectedLead.firstName} ${selectedLead.lastName}`
              });
              setShowEmailDialog(true);
            } else {
              setSuccessMessage({
                title: "Error",
                message: "Selected lead does not have a valid email address.",
                type: "danger",
              });
              setShowSuccessDialog(true);
            }
          } catch (error) {
            setSuccessMessage({
              title: "Error",
              message: "Failed to get lead details. Please try again.",
              type: "danger",
            });
            setShowSuccessDialog(true);
          }
        } else {
          // Multiple leads selected - use BulkMailDialog
          setShowBulkMailDialog(true);
        }
        break;
      case "Import Tasks from CSV":
        setSuccessMessage({
          title: "Not Implemented",
          message: "Task import functionality is coming soon.",
          type: "info",
        });
        setShowSuccessDialog(true);
        break;
      case "Import Leads from CSV":
        setShowImportDialog(true);
        break;
      default:
        console.log(`Action '${action}' not implemented`);
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
              {/* Filter Button to the right of the title */}
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
          {/* Left: SearchBar */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <SearchBar section={currentSection} />
          </div>
          {/* Right: Actions + Create */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
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
        message={
          (currentSection === "meetings" && selectedItems.length === 0) ||
          (currentSection === "tasks" && selectedItems.length === 0)
            ? `Are you sure you want to delete all ${currentSection}? This action cannot be undone.`
            : `Are you sure you want to delete ${selectedItems.length} ${currentSection}? This action cannot be undone.`
        }
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

      <ImportLeadsDialog
        isOpen={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        onSuccess={() => {
          setShowImportDialog(false);
          setSuccessMessage({
            title: "Success",
            message: "Leads have been successfully imported.",
            type: "success",
          });
          setShowSuccessDialog(true);
          
          // Refresh leads data instead of full page reload
          if (user?.companyId) {
            setTimeout(() => {
              fetchLeads(user.companyId, {});
            }, 1000);
          }
        }}
        onError={(errorMessage) => {
          setShowImportDialog(false);
          setSuccessMessage({
            title: "Import Failed",
            message: errorMessage,
            type: "danger",
          });
          setShowSuccessDialog(true);
        }}
      />

      <AssignLeadsDialog
        isOpen={showAssignDialog}
        onClose={() => setShowAssignDialog(false)}
        onAssign={handleBulkAssign}
        selectedCount={selectedItems.length}
      />

      <BulkMailDialog
        isOpen={showBulkMailDialog}
        onClose={() => setShowBulkMailDialog(false)}
        onSend={handleBulkMail}
        selectedCount={selectedItems.length}
      />

      {selectedLeadDetails && (
        <EmailDialog
          isOpen={showEmailDialog}
          onClose={() => {
            setShowEmailDialog(false);
            setSelectedLeadDetails(null);
          }}
          onSend={handleSingleEmail}
          recipientEmail={selectedLeadDetails.email}
          recipientName={selectedLeadDetails.name}
          lead={selectedLeadDetails}
        />
      )}
    </div>
  );
}

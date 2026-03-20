"use client";

import React, { useState, useEffect } from "react";
import Table from "@/components/sales-crm/Table";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import SelectedHeaderData from "@/components/sales-crm/SelectedHeaderData";
import Pagination from "@/components/sales-crm/Pagination";
import { useRouter } from "next/navigation";
import { useLeadsStore } from "@/stores/salesCrmStore/useLeadsStore";
import { useSelectedItemsStore } from "@/stores/salesCrmStore/useSelectedItemsStore";
import { Lead } from "@/api/leadsApi";
import { sendEmailToLead } from "@/api/emailApi";
import ConfirmationDialog from "@/components/sales-crm/ConfirmationDialog";
import AssignLeadsDialog from "@/components/sales-crm/AssignLeadsDialog";
import EmailDialog from "@/components/sales-crm/EmailDialog";
import { pageLimit } from "@/utils/data";
import { useAuthStore } from "@/stores/salesCrmStore/useAuthStore";

const LeadPage = () => {
  const router = useRouter();
  const { leads, totalLeads, isLoading, fetchLeads, deleteLead, assignLead } =
    useLeadsStore();
  const { setSelectedItems, clearSelectedItems } = useSelectedItemsStore();
  const { user } = useAuthStore();

  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [menuAnchorEls, setMenuAnchorEls] = useState<(null | HTMLElement)[]>(
    []
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState<{
    title: string;
    message: string;
  }>({
    title: "",
    message: "",
  });
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [leadToAssign, setLeadToAssign] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [leadToEmail, setLeadToEmail] = useState<Lead | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = pageLimit; // Change this value to control items per page

  useEffect(() => {
    if (user && user?.companyId) {
      fetchLeads(user?.companyId, {
        page: currentPage,
        limit: itemsPerPage,
      });
    }
  }, [fetchLeads, currentPage, itemsPerPage, user?.companyId]);



  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    setMenuAnchorEls(Array(leads.length).fill(null));
  }, [leads.length]);

  // Update selected items store when rows are selected
  useEffect(() => {
    // If there are no leads but we have selected rows, clear the selection
    if (leads.length === 0 && selectedRows.length > 0) {
      setSelectedRows([]);
      clearSelectedItems();
      return;
    }

    // Filter out invalid indices and map to lead IDs
    const validSelectedRows = selectedRows.filter(
      (index) => index >= 0 && index < leads.length
    );
    const selectedLeadIds = validSelectedRows.map((index) => leads[index]._id);

    // Update selected rows if any were invalid
    if (validSelectedRows.length !== selectedRows.length) {
      setSelectedRows(validSelectedRows);
    }

    setSelectedItems(selectedLeadIds);
    return () => {
      clearSelectedItems();
    };
  }, [selectedRows, leads, setSelectedItems, clearSelectedItems]);

  const toggleAll = () => {
    setSelectedRows((prev) =>
      prev.length === leads.length ? [] : leads.map((_, i) => i)
    );
  };

  const toggleRow = (index: number) => {
    setSelectedRows((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleMoreClick = (
    index: number,
    event: React.MouseEvent<HTMLElement>
  ) => {
    const newAnchors = [...menuAnchorEls];
    newAnchors[index] = event.currentTarget;
    setMenuAnchorEls(newAnchors);
    if (!selectedRows.includes(index)) {
      setSelectedRows((prev) => [...prev, index]);
    }
  };

  const handleMoreClose = (index: number) => {
    const newAnchors = [...menuAnchorEls];
    newAnchors[index] = null;
    setMenuAnchorEls(newAnchors);
    setSelectedRows((prev) => prev.filter((i) => i !== index));
  };

  const handleOptionClick = async (action: string, index: number) => {
    const lead = leads[index];

    switch (action) {
      case "Edit":
        router.push(`/sales-crm/leads/${lead._id}/edit`);
        break;

      case "Delete":
        setLeadToDelete({
          id: lead._id,
          name: `${lead.firstName} ${lead.lastName}`,
        });
        setShowDeleteModal(true);
        break;

      case "Assign Lead":
        setLeadToAssign({
          id: lead._id,
          name: `${lead.firstName} ${lead.lastName}`,
        });
        setShowAssignDialog(true);
        break;

      case "Send Email":
        setLeadToEmail(lead);
        setShowEmailDialog(true);
        break;

      default:
        console.log(`Action '${action}' on row ${index}`);
    }

    handleMoreClose(index);
  };

  const handleRowClick = (item: Lead) => {
    // Use leadId if available, otherwise fallback to _id
    const leadId = item.leadId || item._id;
    console.log("Navigating to lead details:", leadId);
    console.log("Lead data:", {
      id: item._id,
      leadId: item.leadId,
      fullName: item.fullName,
      companyId: item.companyId,
      email: item.email,
      complete: item // Log the complete item for debugging
    });
    router.push(`/sales-crm/leads/${leadId}`);
  };


  const handleDeleteConfirm = async () => {
    if (!leadToDelete || isDeleting) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      if (!user?.companyId) {
        throw new Error("Company ID is required to delete lead");
      }

      const success = await deleteLead(leadToDelete.id, user.companyId);
      if (success) {
        // Clear selection for the deleted lead
        setSelectedRows((prev) =>
          prev.filter((index) => leads[index]._id !== leadToDelete.id)
        );

        setShowDeleteModal(false);
        setLeadToDelete(null);
        setSuccessMessage({
          title: "Success",
          message: `Lead "${leadToDelete.name}" has been successfully deleted.`,
        });
        setShowSuccessDialog(true);

        // Auto hide success message after 3 seconds
        setTimeout(() => {
          setShowSuccessDialog(false);
          setSuccessMessage({ title: "", message: "" });
        }, 3000);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete lead";
      setDeleteError(errorMessage);
      console.error("Failed to delete lead:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setLeadToDelete(null);
  };

  const handleAssign = async (email: string) => {
    if (!leadToAssign) return;

    try {
      await assignLead(leadToAssign.id, email);
      setSuccessMessage({
        title: "Success",
        message: `Lead "${leadToAssign.name}" has been successfully assigned to ${email}.`,
      });
      setShowSuccessDialog(true);
      setShowAssignDialog(false);
      setLeadToAssign(null);

      // Refresh leads list
      if (user && user.companyId) {
        await fetchLeads(user.companyId);
      }

      // Auto hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccessDialog(false);
        setSuccessMessage({ title: "", message: "" });
      }, 3000);
    } catch (error) {
      setSuccessMessage({
        title: "Error",
        message:
          error instanceof Error ? error.message : "Failed to assign lead",
      });
      setShowSuccessDialog(true);
    }
  };

  const handleSendEmail = async (subject: string, message: string) => {
    if (!leadToEmail) return;

    try {
      await sendEmailToLead({
        email: leadToEmail.email,
        subject,
        message,
      });
      setSuccessMessage({
        title: "Success",
        message: `Email has been successfully sent to ${leadToEmail.firstName} ${leadToEmail.lastName}.`,
      });
      setShowSuccessDialog(true);
      setShowEmailDialog(false);
      setLeadToEmail(null);

      // Auto hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccessDialog(false);
        setSuccessMessage({ title: "", message: "" });
      }, 3000);
    } catch (error) {
      setSuccessMessage({
        title: "Error",
        message:
          error instanceof Error ? error.message : "Failed to send email",
      });
      setShowSuccessDialog(true);
    }
  };

  const renderRow = (item: Lead, index: number) => {
    const isMenuOpen = Boolean(menuAnchorEls[index]);
    const isSelected = selectedRows.includes(index);

    return (
      <tr
        key={item._id}
        className={`group border-b border-zinc-300 text-sm text-gray-700 transition ${
          isSelected ? "bg-blue-50" : "hover:bg-gray-50"
        }`}
        onClick={() => handleRowClick(item)}
      >
        <td
          className="py-4 px-2 text-center w-10"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className={`transition-opacity duration-200 ${
              isMenuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
          >
            <Tooltip title="More Options">
              <IconButton
                onClick={(e) => handleMoreClick(index, e)}
                size="small"
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={menuAnchorEls[index]}
              open={isMenuOpen}
              onClose={() => handleMoreClose(index)}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              transformOrigin={{ vertical: "top", horizontal: "left" }}
              PaperProps={{
                style: {
                  minWidth: "160px",
                  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
                },
              }}
            >
              <MenuItem onClick={() => handleOptionClick("Edit", index)}>
                Edit
              </MenuItem>
              <MenuItem onClick={() => handleOptionClick("Delete", index)}>
                Delete
              </MenuItem>
              <MenuItem onClick={() => handleOptionClick("Assign Lead", index)}>
                Assign Lead
              </MenuItem>
              <MenuItem onClick={() => handleOptionClick("Send Email", index)}>
                Send Email
              </MenuItem>
            </Menu>
          </div>
        </td>

        <td
          className="py-4 px-4 text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            className="form-checkbox h-4 w-4 text-blue-600 cursor-pointer"
            checked={isSelected}
            onChange={() => toggleRow(index)}
          />
        </td>

        <td className="py-4 px-4">{item.leadId || item._id}</td>
        <td className="py-4 px-4">{item.fullName}</td>
        <td className="py-4 px-4 group-hover:text-blue-600 group-hover:underline">
          <a href={`mailto:${item.email}`} onClick={(e) => e.stopPropagation()}>
            {item.email}
          </a>
        </td>
        <td className="py-4 px-4">{item.phone}</td>
        <td className="py-4 px-4">{item.status}</td>
        <td className="py-4 px-4">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              item.priority === "High"
                ? "bg-red-100 text-red-800"
                : item.priority === "Medium"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {item?.priority}
          </span>
        </td>
        <td className="py-4 px-4">{item?.leadOwner}</td>

        <td className="py-4 px-4">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              item.isConverted
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {item.isConverted ? "Converted" : "Not Converted"}
          </span>
        </td>
      </tr>
    );
  };

  const updatedColumns = [
    { header: "", accessor: "actions", className: "py-2 px-2 w-10" },
    {
      header: (
        <input
          type="checkbox"
          className="form-checkbox h-4 w-4 text-blue-600 cursor-pointer"
          onChange={toggleAll}
          checked={selectedRows.length === leads.length}
        />
      ),
      accessor: "select",
      className: "py-2 px-4 w-10 text-center",
    },
    { header: "Lead ID", accessor: "leadId", className: "py-2 px-4" },
    { header: "Lead Name", accessor: "name", className: "py-2 px-4" },
    { header: "Email", accessor: "email", className: "py-2 px-4" },
    { header: "Phone", accessor: "phone", className: "py-2 px-4" },
    { header: "Lead Status", accessor: "status", className: "py-2 px-4" },
    { header: "Priority", accessor: "priority", className: "py-2 px-4" },
    { header: "Owner Name", accessor: "owner", className: "py-2 px-4" },
    { header: "Status", accessor: "converted", className: "py-2 px-4" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-4 py-4 rounded-xl custom-scrollbar space-y-6">
      <div className="overflow-auto max-h-full shadow bg-white rounded-lg border border-gray-200">
        <SelectedHeaderData total={totalLeads} selected={selectedRows.length} />
        <Table columns={updatedColumns} data={leads} renderRow={renderRow} />

        {/* Pagination */}
        <div className="mt-4 mb-2">
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(totalLeads / itemsPerPage)}
            onPageChange={handlePageChange}
            className="py-2"
          />
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        show={showDeleteModal}
        title="Delete Lead"
        message={
          <>
            {deleteError ? (
              <div className="text-red-600 mb-4">{deleteError}</div>
            ) : (
              <>
                Are you sure you want to delete <br />{" "}
                <span className="font-medium">"{leadToDelete?.name}"</span>?
              </>
            )}
          </>
        }
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        type="danger"
        disableConfirm={isDeleting}
        disableCancel={isDeleting}
      />

      {/* Success Dialog */}
      <ConfirmationDialog
        show={showSuccessDialog}
        title={successMessage.title}
        message={successMessage.message}
        onConfirm={() => setShowSuccessDialog(false)}
        onCancel={() => setShowSuccessDialog(false)}
        confirmText="OK"
        cancelText="Cancel"
        type="success"
      />

      {/* Assign Lead Dialog */}
      <AssignLeadsDialog
        isOpen={showAssignDialog}
        onClose={() => {
          setShowAssignDialog(false);
          setLeadToAssign(null);
        }}
        onAssign={handleAssign}
        selectedCount={leadToAssign ? 1 : selectedRows.length}
      />

      {/* Email Dialog */}
      <EmailDialog
        isOpen={showEmailDialog}
        onClose={() => {
          setShowEmailDialog(false);
          setLeadToEmail(null);
        }}
        onSend={handleSendEmail}
        recipientEmail={leadToEmail?.email || ""}
        recipientName={leadToEmail ? `${leadToEmail.firstName} ${leadToEmail.lastName}` : ""}
        lead={leadToEmail}
      />
    </div>
  );
};

export default LeadPage;

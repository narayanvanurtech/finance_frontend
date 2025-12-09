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
import { useAuthStore } from "@/stores/salesCrmStore/useAuthStore";
import { useSelectedItemsStore } from "@/stores/salesCrmStore/useSelectedItemsStore";
import { Lead } from "@/api/leadsApi";
import ConfirmationDialog from "@/components/sales-crm/ConfirmationDialog";
import { pageLimit } from "@/utils/data";

const LeadPage = () => {
  const router = useRouter();
  const {
    leads,
    totalLeads,
    isLoading,
    fetchUserLeads,
    deleteLead,
    assignLead,
    error,
  } = useLeadsStore();
  const { user } = useAuthStore();
  const { setSelectedItems, clearSelectedItems } = useSelectedItemsStore();

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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = pageLimit;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    console.log(user?._id);
    if (user?._id) {
      fetchUserLeads(user?._id, {
        page: currentPage,
        limit: itemsPerPage,
      });
    }
  }, [user?._id, currentPage, itemsPerPage]);

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
        router.push(`/leads/${lead._id}/edit`);
        break;

      case "Delete":
        setLeadToDelete({
          id: lead._id,
          name: `${lead.firstName} ${lead.lastName}`,
        });
        setShowDeleteModal(true);
        break;

      case "Assign Lead":
        if (user?.email) {
          try {
            await assignLead(lead._id, user.email);
            setSuccessMessage({
              title: "Success",
              message: `Lead "${lead.firstName} ${lead.lastName}" has been successfully assigned to ${user?.email}.`,
            });
            setShowSuccessDialog(true);
            setTimeout(() => {
              setShowSuccessDialog(false);
              setSuccessMessage({ title: "", message: "" });
            }, 3000);
          } catch (error) {
            console.error("Failed to assign lead:", error);
          }
        } else {
          console.error("No user email found in session");
        }
        break;

      default:
        console.log(`Action '${action}' on row ${index}`);
    }

    handleMoreClose(index);
  };

  const handleRowClick = (item: Lead) => {
    router.push(`/leads/${item._id}`);
  };

  const handleDeleteConfirm = async () => {
    if (!leadToDelete || isDeleting) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const companyId = user?.companyId || "";
      const success = await deleteLead(leadToDelete.id, companyId);
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

        // Refresh the leads list with pagination
        if (user?._id) {
          fetchUserLeads(user._id, {
            page: currentPage,
            limit: itemsPerPage,
          });
        }
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
              {/* <MenuItem onClick={() => handleOptionClick("Assign Lead", index)}>
                Assign Lead
              </MenuItem> */}
              {/* <MenuItem onClick={() => handleOptionClick("Convert to Deal", index)}>
                Convert to Deal
              </MenuItem> */}
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
        <td className="py-4 px-4">{item.fullName}</td>
        <td className="py-4 px-4 group-hover:text-blue-600 group-hover:underline">
          <a href={`mailto:${item.email}`} onClick={(e) => e.stopPropagation()}>
            {item.email}
          </a>
        </td>
        <td className="py-4 px-4">{item.phone}</td>
        <td className="py-4 px-4">{item.source}</td>
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
            {item.priority}
          </span>
        </td>
        <td className="py-4 px-4">
          {typeof item.ownerId === "object"
            ? item.ownerId?.name
            : item.leadOwner || "Unassigned"}
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
    { header: "Lead Name", accessor: "name", className: "py-2 px-4" },
    { header: "Email", accessor: "email", className: "py-2 px-4" },
    { header: "Phone", accessor: "phone", className: "py-2 px-4" },
    { header: "Lead Source", accessor: "source", className: "py-2 px-4" },
    { header: "Priority", accessor: "priority", className: "py-2 px-4" },
    { header: "Owner Name", accessor: "owner", className: "py-2 px-4" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-red-500">
        <p className="text-xl">Error loading leads</p>
        <p>{error}</p>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() =>
            user?._id &&
            fetchUserLeads(user._id, {
              page: currentPage,
              limit: itemsPerPage,
            })
          }
        >
          Try Again
        </button>
      </div>
    );
  }

  // Handle case with no leads
  if (!leads || leads.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <div className="text-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300 shadow-sm">
          <div className="mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-20 w-20 mx-auto text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-700 mb-2">
            No Leads Available
          </h3>
          <p className="text-gray-500 mb-4">
            You don't have any leads in your system at the moment.
          </p>
          <div className="w-16 h-1 bg-gray-300 mx-auto rounded-full"></div>
        </div>
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
    </div>
  );
};

export default LeadPage;

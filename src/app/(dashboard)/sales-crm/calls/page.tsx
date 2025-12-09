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
import { useCallsStore } from "@/stores/salesCrmStore/useCallsStore";
import { useSelectedItemsStore } from "@/stores/salesCrmStore/useSelectedItemsStore";
import { useAuthStore } from "@/stores/salesCrmStore/useAuthStore";
import { Call } from "@/api/callsApi";
import ConfirmationDialog from "@/components/sales-crm/ConfirmationDialog";
import { pageLimit } from "@/utils/data";

const CallsPage = () => {
  const router = useRouter();
  const {
    calls,
    totalCalls,
    fetchAllCalls,
    isLoading,
    error,
    removeCall,
    bulkDeleteCalls,
  } = useCallsStore();
  const { setSelectedItems, clearSelectedItems, selectedItems } =
    useSelectedItemsStore();
  const { user } = useAuthStore();

  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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
  const [callToDelete, setCallToDelete] = useState<{ id: string; subject: string } | null>(null);
  const [menuAnchorEls, setMenuAnchorEls] = useState<(null | HTMLElement)[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = pageLimit;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Fetch calls on component mount
  useEffect(() => {
    if (user?.companyId) {
      fetchAllCalls({
        page: currentPage,
        limit: itemsPerPage
      });
    }
    clearSelectedItems();
  }, [fetchAllCalls, clearSelectedItems, currentPage, itemsPerPage, user?.companyId]);

  // Update menu anchors when calls data changes
  useEffect(() => {
    setMenuAnchorEls(Array(calls.length).fill(null));
  }, [calls]);

  const toggleAll = () => {
    const newSelectedRows =
      selectedRows.length === calls.length ? [] : calls.map((_, i) => i);
    setSelectedRows(newSelectedRows);

    const selectedIds = newSelectedRows.map((index) => calls[index].callId);
    console.log("Selected call IDs:", selectedIds);
    setSelectedItems(selectedIds);
  };

  const toggleRow = (index: number) => {
    const newSelectedRows = selectedRows.includes(index)
      ? selectedRows.filter((i) => i !== index)
      : [...selectedRows, index];

    setSelectedRows(newSelectedRows);

    const selectedIds = newSelectedRows.map((index) => calls[index].callId);
    console.log("Updated selected call IDs:", selectedIds);
    setSelectedItems(selectedIds);
  };
  const handleMoreClick = (
    index: number,
    event: React.MouseEvent<HTMLElement>
  ) => {
    const newAnchors = [...menuAnchorEls];
    newAnchors[index] = event.currentTarget;
    setMenuAnchorEls(newAnchors);

    if (!selectedRows.includes(index)) {
      // Update local selection
      const newSelectedRows = [...selectedRows, index];
      setSelectedRows(newSelectedRows);

      // Sync with global selected items store
      const selectedIds = newSelectedRows.map((idx) => calls[idx].callId); // Use callId
      setSelectedItems(selectedIds);
    }
  };

  const handleMoreClose = (index: number) => {
    const newAnchors = [...menuAnchorEls];
    newAnchors[index] = null;
    setMenuAnchorEls(newAnchors);

    // Update local selection
    const newSelectedRows = selectedRows.filter((i) => i !== index);
    setSelectedRows(newSelectedRows);

    // Sync with global selected items store
    const selectedIds = newSelectedRows.map((idx) => calls[idx].callId); // Use callId
    setSelectedItems(selectedIds);
  };

  const handleOptionClick = async (action: string, index: number) => {
    const call = calls[index];
    console.log(`Action '${action}' on call ${call.callId}`); // Using callId

    switch (action) {
      case "Edit":
        router.push(`/sales-crm/calls/${call.callId}/edit`); // Use callId and correct route
        break;

      case "Delete":
        setCallToDelete({
          id: call.callId, 
          subject: call.callPurpose, // Use callPurpose as subject
        });
        setShowDeleteModal(true);
        break;

      case "Assign Owner":
        // Implement owner assignment if needed
        console.log(`Assign Owner action on ${call.callPurpose}`);
        break;

      case "Log Follow-Up":
        // Implement follow-up logging if needed
        console.log(`Log Follow-Up action on ${call.callPurpose}`);
        break;

      default:
        console.log(`Action '${action}' on row ${index}`);
    }

    handleMoreClose(index);
  };

  const handleRowClick = (item: Call) => {
    console.log("Viewing call details:", item.callId); 
    router.push(`/sales-crm/calls/${item.callId}`);
  };

  const handleSingleCallDelete = async () => {
    if (!callToDelete) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await removeCall(callToDelete.id);
      
      // Clear the call to delete
      setCallToDelete(null);
      
      setSuccessMessage({
        title: "Success",
        message: `Successfully deleted call: ${callToDelete.subject}`,
      });
      setShowSuccessDialog(true);

      // Refresh the calls list
      await fetchAllCalls({
        page: currentPage,
        limit: itemsPerPage
      });
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Failed to delete call");
      setSuccessMessage({
        title: "Error",
        message: error instanceof Error ? error.message : "Failed to delete call",
      });
      setShowSuccessDialog(true);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleBulkDelete = async () => {
    if (isDeleting || !selectedItems.length) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await bulkDeleteCalls(selectedItems);
      
      // Clear selections after successful deletion
      setSelectedRows([]);
      clearSelectedItems();

      setSuccessMessage({
        title: "Success",
        message: `Successfully deleted ${selectedItems.length} calls.`,
      });
      setShowSuccessDialog(true);
      

      // Refresh the calls list
      await fetchAllCalls({
        page: currentPage,
        limit: itemsPerPage
      });

      // Reload the page after successful deletion
      window.location.reload();

    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Failed to delete calls");
      setSuccessMessage({
        title: "Error",
        message: error instanceof Error ? error.message : "Failed to delete calls",
      });
      setShowSuccessDialog(true);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleBulkDeleteClick = () => {
    if (selectedItems.length === 0) {
      setSuccessMessage({
        title: "Warning",
        message: "Please select calls to delete.",
      });
      setShowSuccessDialog(true);
      return;
    }
    setShowDeleteModal(true);
  };

  const renderRow = (item: Call, index: number) => {
    const isMenuOpen = Boolean(menuAnchorEls[index]);
    const isSelected = selectedRows.includes(index);

    // Format the call start time to a readable format
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleString();
    };

    return (
      <tr
        key={item.callId} // Use callId instead of id
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

        <td className="py-4 px-4">{item.callPurpose}</td> {/* Use callPurpose as subject */}
        <td className="py-4 px-4">{item.callType}</td>
        <td className="py-4 px-4">{formatDate(item.callStartTime)}</td>
        <td className="py-4 px-4">{item.callAgenda}</td>
        <td className="py-4 px-4">
          {typeof item.leadId === 'object' ? item.leadId.fullName : 'N/A'}
        </td>
        <td className="py-4 px-4">
          {typeof item.callOwner === 'object' ? item.callOwner.name : 'N/A'}
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
          checked={selectedRows.length === calls.length && calls.length > 0}
        />
      ),
      accessor: "select",
      className: "py-2 px-4 w-10 text-center",
    },
    { header: "Purpose", accessor: "callPurpose", className: "py-2 px-4" },
    { header: "Call Type", accessor: "callType", className: "py-2 px-4" },
    { header: "Start Time", accessor: "callStartTime", className: "py-2 px-4" },
    { header: "Agenda", accessor: "callAgenda", className: "py-2 px-4" },
    { header: "Contact Name", accessor: "leadName", className: "py-2 px-4" },
    { header: "Owner", accessor: "callOwnerName", className: "py-2 px-4" },
  ];

  if (!user?.companyId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-gray-500 mb-2">Company information not found</p>
          <p className="text-sm text-gray-400">Please ensure you are logged in with a valid company account</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <div className="h-full overflow-y-auto px-4 py-4 rounded-xl custom-scrollbar space-y-6 flex-1">
        <div className="overflow-auto max-h-full shadow bg-white rounded-lg border border-gray-200">
          <SelectedHeaderData
            total={totalCalls}
            selected={selectedRows.length}
          />
          <Table columns={updatedColumns} data={calls} renderRow={renderRow} />

          {/* Pagination Component */}
          <div className="mt-4 mb-2">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(totalCalls / itemsPerPage)}
              onPageChange={handlePageChange}
              className="py-2"
            />
          </div>
        </div>

        {/* Delete Confirmation Dialog */}      <ConfirmationDialog
        show={showDeleteModal}
        title={callToDelete ? "Delete Call" : "Delete Calls"}
        message={
          <>
            {deleteError ? (
              <p className="text-red-500">{deleteError}</p>
            ) : (
              <p>
                {callToDelete ? 
                  `Are you sure you want to delete the call "${callToDelete.subject}"?` :
                  `Are you sure you want to delete ${selectedItems.length} selected calls?`
                }
                This action cannot be undone.
              </p>
            )}
          </>
        }
        onConfirm={callToDelete ? handleSingleCallDelete : handleBulkDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setCallToDelete(null);
        }}
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
    </div>
  );
};

export default CallsPage;

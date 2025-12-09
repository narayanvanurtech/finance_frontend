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
import { Meeting } from "@/api/meetingsApi";
import { useMeetingsStore } from "@/stores/salesCrmStore/useMeetingsStore";
import { format } from "date-fns";
import ConfirmationDialog from "@/components/sales-crm/ConfirmationDialog";
import { useSelectedItemsStore } from "@/stores/salesCrmStore/useSelectedItemsStore";
import { useAuthStore } from "@/stores/salesCrmStore/useAuthStore";
import { pageLimit } from "@/utils/data";

// Helper function to calculate meeting duration
const calculateDuration = (
  fromDateTime: string,
  toDateTime: string
): string => {
  const start = new Date(fromDateTime);
  const end = new Date(toDateTime);
  const durationMs = end.getTime() - start.getTime();

  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0 && minutes > 0) {
    return `${hours} ${hours === 1 ? "hour" : "hours"} ${minutes} mins`;
  } else if (hours > 0) {
    return `${hours} ${hours === 1 ? "hour" : "hours"}`;
  } else {
    return `${minutes} mins`;
  }
};

const MeetingsPage = () => {
  const router = useRouter();
  const {
    meetings,
    totalMeetings,
    isLoading,
    error,
    fetchMeetings,
    deleteMeeting,
  } = useMeetingsStore();
  const { user } = useAuthStore();

  // Selected rows and menu states
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [menuAnchorEls, setMenuAnchorEls] = useState<(null | HTMLElement)[]>(
    Array(meetings?.length || 0).fill(null)
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = pageLimit;

  // Delete confirmation dialog states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState<{
    id: string;
    title: string;
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
  
  // We're using SubNavbar for bulk deletion
  
  const { setSelectedItems, clearSelectedItems } = useSelectedItemsStore();

  // State to track whether to show all meetings or filtered by lead
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  
  // Fetch meetings on component mount or when parameters change
  useEffect(() => {
    if (!user?.companyId) {
      console.log("No companyId available, skipping meeting fetch");
      return;
    }
    
    if (selectedLeadId) {
      // Fetch meetings for a specific lead
      console.log(`Fetching meetings for leadId: ${selectedLeadId}, companyId: ${user.companyId}`);
      useMeetingsStore.getState().fetchUserMeetings({
        page: currentPage,
        limit: itemsPerPage,
        leadId: selectedLeadId,
        companyId: user.companyId
      });
    } else {
      // Fetch all meetings
      console.log(`Fetching all meetings for companyId: ${user.companyId}, page: ${currentPage}, limit: ${itemsPerPage}`);
      fetchMeetings({
        page: currentPage,
        limit: itemsPerPage,
        companyId: user.companyId
      });
    }

    // Debug log for data structure
    const debugInterval = setTimeout(() => {
      if (meetings?.length > 0) {
        console.log("Current meeting structure (first item):", meetings[0]);
      }
    }, 2000);

    return () => clearTimeout(debugInterval);
  }, [fetchMeetings, currentPage, itemsPerPage, user?.companyId, selectedLeadId]);
  
  // Function to fetch user-specific meetings (for a specific lead)
  const fetchUserSpecificMeetings = (leadId: string) => {
    // Reset to page 1 when changing filters
    setCurrentPage(1);
    setSelectedLeadId(leadId);
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Update menuAnchorEls when meetings change
  useEffect(() => {
    setMenuAnchorEls(Array(meetings?.length || 0).fill(null));
  }, [meetings?.length]);

  // Update selected items store when rows are selected
  useEffect(() => {
    if (meetings?.length === 0 && selectedRows.length > 0) {
      setSelectedRows([]);
      clearSelectedItems();
      return;
    }

    const validSelectedRows = selectedRows.filter(
      (index) => index >= 0 && index < (meetings?.length || 0)
    );
    const selectedMeetingIds = validSelectedRows.map(
      (index) => meetings![index]._id // Use _id which is always defined in the new API response
    );

    // Removed console.log to improve performance

    if (validSelectedRows.length !== selectedRows.length) {
      setSelectedRows(validSelectedRows);
    }

    setSelectedItems(selectedMeetingIds);
    return () => {
      clearSelectedItems();
    };
  }, [selectedRows, meetings, setSelectedItems, clearSelectedItems]);
  const toggleAll = () => {
    setSelectedRows((prev) =>
      prev.length === (meetings?.length || 0)
        ? []
        : meetings?.map((_, i: number) => i) || []
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
    event.stopPropagation();
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

  const handleOptionClick = (
    action: string,
    index: number,
    meetingId: string,
    meetingTitle: string
  ) => {
    // Removed console.log to improve performance

    if (action === "Edit") {
      router.push(`/sales-crm/meetings/${meetingId}/edit`);
    } else if (action === "Delete") {
      // Open delete confirmation dialog
      const meeting = meetings[index];
      // Removed console.log to improve performance
      setMeetingToDelete({ id: meetingId, title: meetingTitle });
      setShowDeleteModal(true);
    } else if (action === "Reschedule") {
      router.push(`/sales-crm/meetings/${meetingId}/edit?reschedule=true`);
    } else if (action === "Send Reminder") {
      // Removed console.log to improve performance
    }

    handleMoreClose(index);
  };

  const handleRowClick = (item: Meeting) => {
    // Use _id which is always defined in the new API response
    router.push(`/sales-crm/meetings/${item._id}`);
  };

  const handleDeleteConfirm = async () => {
    if (!meetingToDelete || isDeleting) return;

    console.log("Deleting meeting with ID:", meetingToDelete.id);

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const success = await deleteMeeting(meetingToDelete.id);
      if (success) {
        setSelectedRows((prev) =>
          prev.filter(
            (index) => 
              meetings[index]._id !== meetingToDelete.id && 
              meetings[index].meetingId !== meetingToDelete.id
          )
        );

        setShowDeleteModal(false);
        setMeetingToDelete(null);
        setSuccessMessage({
          title: "Success",
          message: `Meeting "${meetingToDelete.title}" has been successfully deleted.`,
        });
        setShowSuccessDialog(true);

        setTimeout(() => {
          setShowSuccessDialog(false);
          setSuccessMessage({ title: "", message: "" });
        }, 3000);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete meeting";
      setDeleteError(errorMessage);
      console.error("Failed to delete meeting:", error);
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Bulk deletion is now handled by SubNavbar

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setMeetingToDelete(null);
    setDeleteError(null);
  };

  const renderRow = (item: Meeting, index: number) => {
    const isMenuOpen = Boolean(menuAnchorEls[index]);
    const isSelected = selectedRows.includes(index);

    // Format date and time for display
    let formattedDateTime = "";
    let duration = "";

    try {
      // Check if we have the fromDateTime and toDateTime from API
      if (!item || !item.fromDateTime || !item.toDateTime) {
        console.error("Missing datetime data for meeting:", item);
        formattedDateTime = "Invalid date";
        duration = "Unknown";
      } else {
        const meetingDate = new Date(item.fromDateTime);
        const endDate = new Date(item.toDateTime);
        formattedDateTime = `${format(meetingDate, "yyyy-MM-dd")} at ${format(
          meetingDate,
          "hh:mm a"
        )}`;
        duration = calculateDuration(item.fromDateTime, item.toDateTime);
      }
    } catch (e) {
      console.error("Date formatting error:", e, "for meeting:", item);
    }

    return (
      <tr
        key={item._id || item.id}
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
              <MenuItem
                onClick={() =>
                  handleOptionClick(
                    "Edit",
                    index,
                    item._id,
                    item.title || item.meetingVenue
                  )
                }
              >
                Edit
              </MenuItem>
              <MenuItem
                onClick={() =>
                  handleOptionClick(
                    "Delete",
                    index,
                    item._id,
                    item.title || item.meetingVenue
                  )
                }
              >
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

        <td className="py-4 px-4 font-medium">
          {item.title || item.meetingVenue}
        </td>
        <td className="py-4 px-4">{formattedDateTime}</td>
        <td className="py-4 px-4">{duration}</td>
        <td className="py-4 px-4">{item.location || item.meetingVenue}</td>
        <td className="py-4 px-4">
          {typeof item.meetingOwner === 'object' ? item.meetingOwner.name : item.host || 'Unknown'}
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
          checked={selectedRows.length === (meetings?.length || 0)}
        />
      ),
      accessor: "select",
      className: "py-2 px-4 w-10 text-center",
    },
    {
      header: "Meeting Title",
      accessor: "title",
      className: "py-2 px-4",
    },
    { header: "Date & Time", accessor: "datetime", className: "py-2 px-4" },
    { header: "Duration", accessor: "duration", className: "py-2 px-4" },
    { header: "Location", accessor: "location", className: "py-2 px-4" },
    { header: "Organizer", accessor: "meetingOwner", className: "py-2 px-4" },
  ];

  if (!user?.companyId) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-lg font-medium">No company information found.</p>
          <p className="text-sm mt-2">Please check your account settings.</p>
        </div>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-red-500">
        <p className="text-xl">Error loading meetings</p>
        <p>{error}</p>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => user?.companyId && fetchMeetings({
            page: currentPage,
            limit: itemsPerPage,
            companyId: user.companyId
          })}
        >
          Try Again
        </button>
      </div>
    );
  }

  // Handle case with no meetings
  if (!meetings || meetings.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500">
        <p className="text-xl">No meetings found</p>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => router.push("/sales-crm/meetings/add")}
        >
          Create Meeting
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <div className="h-full overflow-y-auto px-4 py-4 rounded-xl custom-scrollbar space-y-6 flex-1">
        {/* Filter status indicator and reset option */}
        {selectedLeadId && (
          <div className="bg-blue-50 p-3 rounded-lg mb-2 flex items-center justify-between">
            <p className="text-blue-700 text-sm">
              Currently showing meetings for specific lead
            </p>
            <button
              onClick={() => {
                setSelectedLeadId(null);
                setCurrentPage(1);
              }}
              className="text-blue-700 hover:text-blue-900 text-sm font-medium"
            >
              Show All Meetings
            </button>
          </div>
        )}
      
        <div className="overflow-auto max-h-full shadow bg-white rounded-lg border border-gray-200">
          <div className="flex justify-between items-center px-4 py-2 bg-gray-50 border-b border-gray-200">
            <SelectedHeaderData
              total={totalMeetings}
              selected={selectedRows.length}
            />
            
            {/* We're using the SubNavbar for bulk actions instead */}
          </div>
          
          <Table
            columns={updatedColumns}
            data={meetings || []}
            renderRow={renderRow}
          />
          
          {/* Pagination */}
          <div className="mt-4 mb-2">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(totalMeetings / itemsPerPage)}
              onPageChange={handlePageChange}
              className="py-2"
            />
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          show={showDeleteModal}
          title="Delete Meeting"
          message={
            <>
              {deleteError ? (
                <p className="text-red-500">{deleteError}</p>
              ) : (
                <p>
                  Are you sure you want to delete the meeting "
                  {meetingToDelete?.title}"? This action cannot be undone.
                </p>
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
        
        {/* Bulk deletion is now handled by SubNavbar */}
      </div>
    </div>
  );
};

export default MeetingsPage;

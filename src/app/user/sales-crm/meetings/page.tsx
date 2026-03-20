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
    fetchUserMeetings,
    deleteMeeting,
  } = useMeetingsStore();

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
  const { setSelectedItems, clearSelectedItems } = useSelectedItemsStore();

  // Fetch meetings on component mount
  useEffect(() => {
    fetchUserMeetings({
      page: currentPage,
      limit: itemsPerPage,
    });
  }, [fetchUserMeetings, currentPage, itemsPerPage]);

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
      (index) => meetings![index].meetingId
    );

    // Removed //console.log to improve performance

    if (validSelectedRows.length !== selectedRows.length) {
      setSelectedRows(validSelectedRows);
    }

    setSelectedItems(
      selectedMeetingIds.filter((id): id is string => id !== undefined)
    );
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
    // Removed //console.log to improve performance

    if (action === "Edit") {
      router.push(`/meetings/${meetingId}/edit`);
    } else if (action === "Delete") {
      // Open delete confirmation dialog
      const meeting = meetings[index];
      // Removed //console.log to improve performance
      setMeetingToDelete({ id: meetingId, title: meetingTitle });
      setShowDeleteModal(true);
    } else if (action === "Reschedule") {
      router.push(`/meetings/${meetingId}/edit?reschedule=true`);
    } else if (action === "Send Reminder") {
      // Removed //console.log to improve performance
    }

    handleMoreClose(index);
  };

  const handleRowClick = (item: Meeting) => {
    // Removed //console.log to improve performance
    router.push(`/meetings/${item.id}`);
  };

  const handleDeleteConfirm = async () => {
    if (!meetingToDelete || isDeleting) return;

    // Removed //console.log to improve performance

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const success = await deleteMeeting(meetingToDelete.id);
      if (success) {
        setSelectedRows((prev) =>
          prev.filter(
            (index) => meetings[index].meetingId !== meetingToDelete.id
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

        // Refresh the meetings list with pagination parameters
        fetchUserMeetings({
          page: currentPage,
          limit: itemsPerPage,
        });
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
        key={item.id}
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
                    item.id || item.meetingId || "",
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
                    item.meetingId || item.id || "",
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
        <td className="py-4 px-4">{item.location}</td>
        <td className="py-4 px-4">{item.host}</td>
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
      accessor: "meetingtitle",
      className: "py-2 px-4",
    },
    { header: "Date & Time", accessor: "datetime", className: "py-2 px-4" },
    { header: "Duration", accessor: "duration", className: "py-2 px-4" },
    { header: "Location", accessor: "location", className: "py-2 px-4" },
    { header: "Organizer", accessor: "host", className: "py-2 px-4" },
  ];

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
          onClick={() =>
            fetchUserMeetings({
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

  // Handle case with no meetings
  if (!meetings || meetings.length === 0) {
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-700 mb-2">
            No Meetings Scheduled
          </h3>
          <p className="text-gray-500 mb-4">
            You don't have any meetings scheduled at the moment.
          </p>
          <div className="w-16 h-1 bg-gray-300 mx-auto rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <div className="h-full overflow-y-auto px-4 py-4 rounded-xl custom-scrollbar space-y-6 flex-1">
        <div className="overflow-auto max-h-full shadow bg-white rounded-lg border border-gray-200">
          <SelectedHeaderData
            total={totalMeetings}
            selected={selectedRows.length}
          />
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
      </div>
    </div>
  );
};

export default MeetingsPage;

"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Button,
  IconButton,
  Menu,
  MenuItem,
  Badge,
  Avatar,
  Skeleton,
} from "@mui/material";
import {
  ArrowBackIosNew as BackIcon,
  MoreVert as MoreIcon,
  Email as EmailIcon,
  ChangeCircle as ConvertIcon,
  Edit as EditIcon,
  ContentCopy as CloneIcon,
  DeleteOutline as DeleteIcon,
  PrintOutlined as PrintIcon,
  Merge as MergeIcon,
  Bolt as PriorityIcon,
} from "@mui/icons-material";
import { useLeadsStore } from "@/stores/salesCrmStore/useLeadsStore";
import { useAuthStore } from "@/stores/salesCrmStore/useAuthStore";

interface DetailsSubNavbarProps {
  onConvertClick?: () => void;
  onDeleteClick?: (id: string, name: string) => void;
}

const DetailsSubNavbar = ({
  onConvertClick,
  onDeleteClick,
}: DetailsSubNavbarProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const router = useRouter();
  const params = useParams();
  const leadId = params?.id as string;
  const { currentLead, isLoading, error } = useLeadsStore();
  const { user } = useAuthStore();

  console.log("Current Lead Subnav:", currentLead);

  // Remove the useEffect that was fetching data since the parent page handles this
  // The DetailsSubNavbar will now only display data that's already in the store

  const handleMoreClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleBack = () => {
    router.back();
  };

  // Function to get priority color
  const getPriorityColor = () => {
    if (!currentLead)
      return {
        color: "#ff9f43",
        bg: "yellow-200",
        textColor: "yellow-600",
      };

    switch (currentLead.priority.toLowerCase()) {
      case "High":
        return { color: "#e74c3c", bg: "red-200", textColor: "red-600" };
      case "Medium":
        return { color: "#ff9f43", bg: "yellow-200", textColor: "yellow-600" };
      case "Low":
        return { color: "#2ecc71", bg: "green-200", textColor: "green-600" };
      default:
        return { color: "#ff9f43", bg: "yellow-200", textColor: "yellow-600" };
    }
  };

  const priorityColors = getPriorityColor();

  // Function to get status color
  const getStatusColor = () => {
    if (!currentLead) return "#9e9e9e"; // Gray default

    switch (currentLead.temperature) {
      case "Hot":
        return "#e74c3c"; // Red for hot
      case "Warm":
        return "#ff9f43"; // Orange/amber for warm
      case "Cold":
        return "#3498db"; // Blue for cold
      default:
        return "#9e9e9e"; // Gray for unknown
    }
  };

  // Format date to "X days ago" format
  const formatLastContacted = (dateString?: string) => {
    if (!dateString) return "Never";

    const contactDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - contactDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  };

  return (
    <div className="flex justify-between flex-wrap gap-5 items-center px-6 py-3 bg-gradient-to-br from-gray-100 to-white border-b border-gray-200 shadow-sm backdrop-blur-md">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <IconButton
          onClick={handleBack}
          className="!text-blue-600 !bg-blue-100 hover:!bg-blue-200 transition-all hover:-translate-x-1"
        >
          <BackIcon fontSize="small" />
        </IconButton>

        {/* {isLoading ? (
          <Skeleton variant="circular" width={40} height={40} />
        ) : (
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            badgeContent={
              <PriorityIcon
                sx={{
                  color: priorityColors.color,
                  fontSize: "14px",
                  filter: `drop-shadow(0 0 2px rgba(255, 159, 67, 0.5))`,
                }}
              />
            }
          >
            <Avatar
              alt={
                currentLead
                  ? `${currentLead.firstName} ${currentLead.lastName}`
                  : "Lead"
              }
              src="/static/images/avatar/1.jpg"
              sx={{
                width: 40,
                height: 40,
                border: "2px solid #4a6bff",
                boxShadow: "0 2px 8px rgba(74, 107, 255, 0.3)",
              }}
            />
          </Badge>
        )} */}

        <div>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton variant="text" width={150} height={20} />
              <Skeleton variant="text" width={200} height={16} />
            </div>
          ) : error ? (
            <div className="space-y-1">
              <div className="text-red-600 font-semibold text-sm">
                Error loading lead
              </div>
              <div className="text-xs text-red-500">{error}</div>
            </div>
          ) : (
            <>
              <div className="flex items-center text-gray-800 font-semibold">
                {currentLead
                  ? `${currentLead.firstName} ${currentLead.lastName}`
                  : "Lead not found"}
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 font-medium">
                <span
                  className="w-2 h-2 rounded-full shadow-sm"
                  style={{ backgroundColor: getStatusColor() }}
                />
                <span
                  className="capitalize font-medium"
                  style={{ color: getStatusColor() }}
                >
                  {currentLead?.temperature || "Unknown"}
                </span>{" "}
                • Last contacted:{" "}
                <strong className="font-semibold">
                  {currentLead?.updatedAt
                    ? new Date(currentLead.updatedAt).toLocaleDateString(
                        "en-US",
                        {
                          month: "numeric",
                          day: "numeric",
                          year: "numeric",
                        }
                      )
                    : "Invalid Contact"}
                </strong>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center justify-end gap-3">
        {isLoading ? (
          <Skeleton variant="rounded" width={80} height={32} />
        ) : (
          <span className="text-xs sm:text-sm bg-red-100 text-red-500 font-semibold px-3 py-1 rounded-full flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            Lead Priority:{" "}
            <strong className="ml-1">
              {currentLead?.priority || "Medium"}
            </strong>
          </span>
        )}

        {/* Create Deal Button */}
        <Button
          variant="contained"
          size="small"
          disabled={isLoading || !currentLead}
          onClick={() => {
            if (currentLead) {
              router.push(`/deals/add?leadId=${currentLead._id}`);
            }
          }}
          sx={{
            textTransform: "none",
            borderRadius: "8px",
            px: 2,
            minWidth: "0",
            backgroundColor: "white",
            color: "#4a6bff",
            border: "1px solid rgba(74, 107, 255, 0.3)",
            boxShadow: "0 2px 5px rgba(74, 107, 255, 0.1)",
            "&:hover": {
              backgroundColor: "rgba(74, 107, 255, 0.05)",
              boxShadow: "0 3px 8px rgba(74, 107, 255, 0.2)",
            },
          }}
        >
          <span className="hidden md:inline">Create Deal</span>
        </Button>

        {/* Convert Button */}
        <Button
          variant="contained"
          startIcon={<ConvertIcon sx={{ color: "#9b59b6" }} />}
          size="small"
          disabled={isLoading || !currentLead}
          onClick={onConvertClick}
          sx={{
            textTransform: "none",
            borderRadius: "8px",
            px: 2,
            minWidth: "0",
            backgroundColor: "white",
            color: "#9b59b6",
            border: "1px solid rgba(155, 89, 182, 0.3)",
            boxShadow: "0 2px 5px rgba(155, 89, 182, 0.1)",
            "&:hover": {
              backgroundColor: "rgba(155, 89, 182, 0.05)",
              boxShadow: "0 3px 8px rgba(155, 89, 182, 0.2)",
            },
          }}
        >
          <span className="hidden md:inline">Convert</span>
        </Button>

        <IconButton
          size="small"
          disabled={isLoading || !currentLead}
          onClick={handleMoreClick}
          className="!bg-white !border !border-gray-200 !rounded-lg w-9 h-9 hover:!bg-gray-100 hover:scale-105 transition-transform"
        >
          <MoreIcon className="text-gray-500" />
        </IconButton>

        {/* Dropdown Menu */}
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 220,
              boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)",
              borderRadius: "12px",
              "& .MuiMenuItem-root": {
                px: 2,
                py: 1.2,
                fontSize: "0.9rem",
                "&:hover": {
                  backgroundColor: "rgba(74, 107, 255, 0.08)",
                },
              },
              "& .MuiSvgIcon-root": {
                fontSize: "1.1rem",
                marginRight: "12px",
              },
            },
          }}
        >
          <MenuItem
            onClick={() => {
              handleClose();
              router.push(`/sales-crm/leads/${leadId}/edit`);
            }}
          >
            <EditIcon sx={{ color: "#4a6bff" }} />
            Edit Profile
          </MenuItem>

          <MenuItem
            onClick={() => {
              handleClose();
              if (currentLead) {
                onDeleteClick?.(
                  currentLead._id,
                  `${currentLead.firstName} ${currentLead.lastName}`
                );
              }
            }}
            sx={{ color: "#e74c3c" }}
          >
            <DeleteIcon sx={{ color: "#e74c3c" }} />
            Delete Lead
          </MenuItem>
        </Menu>
      </div>
    </div>
  );
};

export default DetailsSubNavbar;

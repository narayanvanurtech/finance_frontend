"use client";

import React, { useEffect } from "react";
import { useMeetingsStore } from "@/stores/salesCrmStore/useMeetingsStore";
import { format, formatDistance, formatRelative, subDays } from "date-fns";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/salesCrmStore/useAuthStore";
import {
  Box,
  Typography,
  List,
  ListItemButton,
  Divider,
  Tooltip,
  Avatar,
  Chip,
  IconButton,
  styled,
  Badge,
} from "@mui/material";
import {
  Videocam as VideocamIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";

// Styled components

const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: "#44b700",
    color: "#44b700",
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    "&::after": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      animation: "ripple 1.2s infinite ease-in-out",
      border: "1px solid currentColor",
      content: '""',
    },
  },
  "@keyframes ripple": {
    "0%": {
      transform: "scale(.8)",
      opacity: 1,
    },
    "100%": {
      transform: "scale(2.4)",
      opacity: 0,
    },
  },
}));

const MeetingsSidebar = ({ collapsed }: { collapsed: boolean }) => {
  const router = useRouter();
  const { meetings, fetchMeetings, fetchUserMeetings, isLoading, error } =
    useMeetingsStore();
  const { user } = useAuthStore();
  console.log("MeetingsSidebar - User:", user?.role);

  useEffect(() => {
    // Only proceed if user object is available
    if (!user) {
      console.log("User not available yet, waiting...");
      return;
    }

    // Make sure we have company ID
    const companyId = user.companyId;
    if (!companyId) {
      console.error("No companyId available for fetching meetings");
      return;
    }

    // Fetch meetings based on user type - always use fetchMeetings with companyId
    console.log("Fetching meetings with companyId:", companyId);
    fetchMeetings({ companyId });

    // Note: If in the future you need to fetch meetings for a specific lead,
    // you'll need to use fetchUserMeetings with both companyId and leadId
  }, [fetchMeetings, user]);

  // Helper function to get the meeting ID from different possible field names
  const getMeetingId = (meeting: any): string => {
    // Log meeting structure to help debug
    console.log("Meeting structure:", {
      _id: meeting._id,
      id: meeting.id,
      meetingId: meeting.meetingId,
    });

    // Try to get the ID from different fields, in order of preference
    return meeting._id || meeting.id || meeting.meetingId;
  };

  const handleMeetingClick = (meeting: any) => {
    const meetingId = getMeetingId(meeting);
    if (meetingId) {
      console.log(`Navigating to meeting: ${meetingId}`);
      // Use the correct path structure for the meeting detail page
      router.push(`/sales-crm/meetings/${meetingId}`);
    } else {
      console.error("Could not determine meeting ID", meeting);
    }
  };

  const getMeetingStatus = (meeting: any) => {
    const meetingDate = new Date(meeting.fromDateTime);
    const now = new Date();

    if (meetingDate < now) {
      return "completed";
    }
    return "upcoming";
  };

  // Format date and time range
  const formatMeetingTime = (fromDateTime: string, toDateTime: string) => {
    try {
      const fromDate = new Date(fromDateTime);
      const toDate = new Date(toDateTime);

      // Format date as "MMM d, yyyy" (e.g., "Aug 14, 2023")
      const formattedDate = format(fromDate, "MMM d, yyyy");

      // Format time range as "h:mm a - h:mm a" (e.g., "2:00 PM - 3:00 PM")
      const formattedTime = `${format(fromDate, "h:mm a")} - ${format(
        toDate,
        "h:mm a"
      )}`;

      return `${formattedDate} • ${formattedTime}`;
    } catch (error) {
      console.error("Error formatting meeting time:", error);
      return "Invalid date";
    }
  };

  // Format relative time (e.g., "Today", "Tomorrow", "In 3 days")
  const formatRelativeTime = (dateTime: string) => {
    try {
      const date = new Date(dateTime);
      return formatRelative(date, new Date());
    } catch (error) {
      console.error("Error formatting relative time:", error);
      return dateTime;
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography>Loading meetings...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: collapsed ? 64 : 288,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid rgba(0, 0, 0, 0.08)",
        bgcolor: "background.paper",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      {!collapsed && (
        <Box
          sx={{
            p: 2,
            borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            Meetings
          </Typography>
          <IconButton
            size="small"
            sx={{ color: "primary.main" }}
            onClick={() => router.push("/sales-crm/meetings/add")}
            title="Add New Meeting"
          >
            <AddIcon />
          </IconButton>
        </Box>
      )}

      {/* List Section */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          "&::-webkit-scrollbar": {
            width: "4px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(106, 17, 203, 0.3)",
            borderRadius: "2px",
          },
        }}
      >
        <List disablePadding sx={{ width: "100%", pr: collapsed ? 0 : 1 }}>
          {meetings.map((meeting) => (
            <React.Fragment key={getMeetingId(meeting)}>
              <Tooltip
                title={
                  collapsed
                    ? `${meeting.title}\n${formatMeetingTime(
                        meeting.fromDateTime,
                        meeting.toDateTime
                      )}`
                    : ""
                }
                placement="right"
                arrow
              >
                <ListItemButton
                  onClick={() => handleMeetingClick(meeting)}
                  sx={{
                    px: collapsed ? 1.5 : 2,
                    py: 1.5,
                    mx: 0,
                    my: 0.25,
                    borderRadius: "8px",
                    "&:hover": {
                      backgroundColor: "rgba(106, 17, 203, 0.05)",
                    },
                    cursor: "pointer",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                      minWidth: 0,
                    }}
                  >

                    <StyledBadge
                      overlap="circular"
                      anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "right",
                      }}
                      variant="standard"
                    >
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: "#4f46e5",
                          fontSize: collapsed ? "1rem" : "1.1rem",
                          fontWeight: "bold",
                          mr: collapsed ? 0 : 2,
                        }}
                      >
                        {meeting?.title
                          ? meeting?.title.charAt(0).toUpperCase()
                          : "M"}
                      </Avatar>
                    </StyledBadge>

                    {!collapsed && (
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                          }}
                        >
                          <Typography
                            variant="subtitle1"
                            fontWeight="600"
                            noWrap
                            sx={{ maxWidth: "180px" }}
                          >
                            {meeting.title}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            mt: 0.5,
                          }}
                        >
                          <Typography
                            variant="caption"
                            color="textSecondary"
                            noWrap
                            sx={{ maxWidth: "300px" }}
                          >
                            {formatMeetingTime(
                              meeting.fromDateTime,
                              meeting.toDateTime
                            )}
                          </Typography>
                        </Box>
                    

                        <Box sx={{ display: "flex", mt: 1 }}>
                          {meeting.participants?.length > 0 && (
                            <Chip
                              label={`${meeting.participants.length} ${
                                meeting.participants.length === 1
                                  ? "person"
                                  : "people"
                              }`}
                              size="small"
                              sx={{
                                fontSize: "0.65rem",
                                height: "20px",
                                marginRight: 1,
                              }}
                            />
                          )}
                          {meeting.meetingVenue && (
                            <Chip
                              label={meeting.meetingVenue}
                              size="small"
                              sx={{
                                fontSize: "0.65rem",
                                height: "20px",
                                  backgroundColor: "#e8f5e8",

                              }}
                            />
                          )}
                        </Box>
                      </Box>
                    )}
                  </Box>
                </ListItemButton>
              </Tooltip>
              <Divider
                sx={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(106, 17, 203, 0.5), transparent)",
                  height: "1px",
                  border: "none",
                }}
              />
            </React.Fragment>
          ))}
        </List>
      </Box>

      {/* Collapsed View Icons */}
      {collapsed && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            p: 1,
            borderTop: "1px solid rgba(0, 0, 0, 0.08)",
          }}
        >
          <IconButton
            size="small"
            sx={{ mb: 1 }}
            onClick={() => router.push("/sales-crm/meetings/add")}
            title="Add New Meeting"
          >
            <AddIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" title="More Options">
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
    </Box>
  );
};

export default MeetingsSidebar;

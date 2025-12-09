import React, { useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  Tooltip,
  Avatar,
  Badge,
  IconButton,
  styled,
  CircularProgress,
  Chip,
} from "@mui/material";
import { Phone, Schedule, AccessTime } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useCallsStore } from "@/stores/salesCrmStore/useCallsStore";
import { Add as AddIcon } from "@mui/icons-material";
import { useAuthStore } from "@/stores/salesCrmStore/useAuthStore";

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

// Helper function to get status color
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
      return "#4caf50";
    case "scheduled":
      return "#2196f3";
    case "missed":
      return "#f44336";
    default:
      return "#757575";
  }
};

const CallsSidebar = ({ collapsed }: { collapsed: boolean }) => {
  const router = useRouter();
  const { calls, isLoading, error, fetchAllCalls, fetchCalls, setCurrentCall } =
    useCallsStore();
  const { user } = useAuthStore();

 useEffect(() => {
    if (user?.role === "admin") {
      fetchAllCalls();
    } else {
      fetchCalls();
    }
  }, [fetchAllCalls, fetchCalls, user?.role]);

  // Use useCallback to memoize the function and prevent unnecessary re-renders
  const handleCallClick = useCallback(
    (callId: string, call: any) => {
      // Set the current call directly without fetching again
      setCurrentCall(call);
      // Navigate to the call detail page without awaiting the fetch
      router.push(`/sales-crm/calls/${callId}`);
    },
    [router, setCurrentCall]
  );

  if (isLoading) {
    return (
      <Box
        sx={{
          width: collapsed ? 64 : 288,
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          width: collapsed ? 64 : 288,
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: 2,
        }}
      >
        <Typography color="error" textAlign="center">
          {error}
        </Typography>
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
            Calls
          </Typography>
          <IconButton
            size="small"
            sx={{ color: "#4f46e5" }}
            onClick={() => router.push("/sales-crm/calls/add")}
          >
            <AddIcon />
          </IconButton>
        </Box>
      )}

      {/* List Section - Takes remaining space without scrolling */}
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
        <List
          disablePadding
          sx={{
            width: "100%",
            pr: collapsed ? 0 : 1,
          }}
        >
          {calls.length === 0 ? (
            <Box sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="body2" color="#4f46e5">
                No calls found
              </Typography>
            </Box>
          ) : (
            calls.map((call) => (
              <React.Fragment key={call._id}>
                <Tooltip
                  title={collapsed ? call.callPurpose : ""}
                  placement="right"
                  arrow
                >
                  <ListItemButton
                    sx={{
                      px: collapsed ? 1.5 : 2,
                      py: 1.25,
                      mx: 0,
                      my: 0.25,
                      borderRadius: "8px",
                      "&:hover": {
                        backgroundColor: "rgba(79, 70, 229, 0.05)",
                      },
                    }}
                    onClick={() => handleCallClick(call._id, call)}
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
                          {call?.callPurpose
                            ? call?.callPurpose.charAt(0).toUpperCase()
                            : "C"}
                        </Avatar>
                      </StyledBadge>

                      {!collapsed && (
                        <Box
                          sx={{
                            flex: 1,
                            minWidth: 0,
                            ml: 1,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              width: "100%",
                            }}
                          >
                            <Typography
                              variant="subtitle1"
                              fontWeight="600"
                              noWrap
                            >
                              {call.callPurpose}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#4f46e5",
                                fontWeight: 600,
                              }}
                            >
                              {new Date(
                                call.createdAt || call.updatedAt
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </Typography>
                          </Box>

                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              width: "100%",
                              mt: 0.5,
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                color: "text.secondary",
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                              noWrap
                            >
                              <Phone sx={{ fontSize: 16 }} />
                              {call.callType === "outbound"
                                ? "Outbound"
                                : "Inbound"}
                            </Typography>
                            <Chip
                              label={call.outgoingCallStatus}
                              size="small"
                              sx={{
                                backgroundColor: getStatusColor(
                                  call.outgoingCallStatus
                                ),
                                color: "#fff",
                                textTransform: "capitalize",
                                height: "20px",
                                fontSize: "0.75rem",
                              }}
                            />
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </ListItemButton>
                </Tooltip>
                <Divider
                  sx={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(79, 70, 229), transparent)",
                    height: "1px",
                    border: "none",
                  }}
                />
              </React.Fragment>
            ))
          )}
        </List>
      </Box>
    </Box>
  );
};

export default CallsSidebar;

import React, { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Box,
  Menu,
  MenuItem,
  Divider,
  Badge,
  Avatar,
  styled,
  CircularProgress,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import leadsApi from "@/api/leadsApi";
import { useRouter, useParams } from "next/navigation";
import { useCallsStore } from "@/stores/salesCrmStore/useCallsStore";

interface CallsNavbarProps {
  toggleSidebar?: () => void;
}

// Styled components for custom designs
const GradientButton = styled(Button)({
  background: "linear-gradient(45deg, #6a11cb 0%, #2575fc 100%)",
  color: "white",
  fontWeight: 600,
  textTransform: "none",
  padding: "8px 20px",
  borderRadius: "8px",
  boxShadow: "0 2px 10px rgba(106, 17, 203, 0.3)",
  "&:hover": {
    boxShadow: "0 4px 15px rgba(106, 17, 203, 0.4)",
  },
});

const OutlineButton = styled(Button)({
  borderColor: "#e0e0e0",
  color: "#6a11cb",
  fontWeight: 500,
  textTransform: "none",
  padding: "8px 16px",
  borderRadius: "8px",
  "&:hover": {
    borderColor: "#6a11cb",
    backgroundColor: "rgba(106, 17, 203, 0.05)",
  },
});

const CallsNavbar: React.FC<CallsNavbarProps> = ({ toggleSidebar }) => {
  const [anchorElCall, setAnchorElCall] = React.useState<null | HTMLElement>(
    null
  );
  const [anchorElMore, setAnchorElMore] = React.useState<null | HTMLElement>(
    null
  );
  const [isCompleting, setIsCompleting] = useState(false);
  const router = useRouter();
  const params = useParams();
  const callId = params?.id as string;
  const { currentCall } = useCallsStore();

  const handleCallMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElCall(event.currentTarget);
  };

  const handleMoreMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElMore(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorElCall(null);
    setAnchorElMore(null);
  };

  const handleMarkAsCompleted = async () => {
    // Functionality removed - call completion is now handled in the call details page
    setAnchorElCall(null);
  };

  const handleEditCall = () => {
    // Navigate to edit page using the current call ID
    if (callId) {
      router.push(`/sales-crm/calls/${callId}/edit`);
    }
    setAnchorElCall(null);
  };

  return (
    <AppBar
      position="static"
      color="transparent"
      elevation={0}
      sx={{
        borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
        backgroundColor: "white",
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          px: { xs: 2, md: 3 },
          py: 1,
        }}
      >
        {/* Left side: Menu icon and title */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton
            edge="start"
            onClick={toggleSidebar}
            sx={{
              color: "text.primary",
              "&:hover": {
                backgroundColor: "rgba(106, 17, 203, 0.08)",
              },
            }}
          >
            <MenuIcon />
          </IconButton>
          <Box>
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 700,
                background: "black",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                display: "inline-block",
              }}
            >
              Call Details
            </Typography>
            {/* Display Call ID and Lead Name */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 0.5 }}>
              {/* <Typography variant="caption" sx={{ color: "text.secondary", fontFamily: "monospace" }}>
                Call ID: {callId ? callId.slice(-8) : "Loading..."}
              </Typography> */}
              {currentCall && (
                <>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    Lead: {typeof currentCall.leadId === 'object' 
                      ? currentCall.leadId.fullName || `${currentCall.leadId.firstName} ${currentCall.leadId.lastName}`
                      : 'Loading...'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    •
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: currentCall.outgoingCallStatus === 'completed' ? 'success.main' : 
                             currentCall.outgoingCallStatus === 'scheduled' ? 'info.main' : 
                             currentCall.outgoingCallStatus === 'missed' ? 'error.main' : 'warning.main',
                      fontWeight: 500,
                      textTransform: 'capitalize'
                    }}
                  >
                    {currentCall.outgoingCallStatus}
                  </Typography>
                </>
              )}
            </Box>
          </Box>
        </Box>

        {/* Right side: Action buttons and user */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>

          {/* Call Actions Dropdown */}
          <Box sx={{ position: "relative" }}>
            <OutlineButton
              variant="outlined"
              endIcon={<ArrowDropDownIcon />}
              onClick={handleCallMenuClick}
              disabled={!callId || !currentCall}
            >
              Actions
            </OutlineButton>
            <Menu
              anchorEl={anchorElCall}
              open={Boolean(anchorElCall)}
              onClose={handleClose}
              PaperProps={{
                elevation: 1,
                sx: {
                  borderRadius: "8px",
                  minWidth: "180px",
                  mt: 1,
                  py: 0,
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                },
              }}
            >
              <MenuItem 
                onClick={handleEditCall} 
                sx={{ py: 1.5 }}
                disabled={!callId}
              >
                Edit Call
              </MenuItem>
            </Menu>
          </Box>

          {/* Call Actions Dropdown */}
          {/* <Box sx={{ position: "relative" }}>
            <IconButton
              onClick={handleMoreMenuClick}
              sx={{
                color: "text.primary",
                "&:hover": {
                  backgroundColor: "rgba(106, 17, 203, 0.08)",
                },
              }}
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={anchorElMore}
              open={Boolean(anchorElMore)}
              onClose={handleClose}
              PaperProps={{
                elevation: 1,
                sx: {
                  borderRadius: "8px",
                  minWidth: "180px",
                  mt: 1,
                  py: 0,
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                },
              }}
            >
              <MenuItem onClick={handleClose} sx={{ py: 1.5 }}>
                Edit
              </MenuItem>
              <MenuItem onClick={handleClose} sx={{ py: 1.5 }}>
                Delete
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleClose} sx={{ py: 1.5 }}>
                Print View
              </MenuItem>
              <MenuItem onClick={handleClose} sx={{ py: 1.5 }}>
                Send Email
              </MenuItem>
            </Menu>
          </Box> */}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default CallsNavbar;

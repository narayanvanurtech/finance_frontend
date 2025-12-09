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
  styled,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { useRouter, useParams } from "next/navigation";
import { Meeting } from "@/api/meetingsApi";


interface MeetingsNavbarProps {
  toggleSidebar?: () => void;
  meeting?: Meeting | null;
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

const MeetingsNavbar: React.FC<MeetingsNavbarProps> = ({ toggleSidebar, meeting }) => {
  const [anchorElMeeting, setAnchorElMeeting] = React.useState<null | HTMLElement>(null);
  
  const router = useRouter();
  const params = useParams();
  const meetingId = params?.id as string;

  const handleMeetingMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElMeeting(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorElMeeting(null);
  };

  const handleEditMeeting = () => {
    if (meeting && meeting._id) {
      router.push(`/sales-crm/meetings/${meeting._id}/edit`);
      handleClose(); // Close the menu after navigation
    } else {
      console.error("Cannot navigate to edit page: meeting._id is missing");
    }
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
                display: "flex",
              }}
            >
              Meeting Details
            </Typography>
            {meeting && meeting.leadId && typeof meeting.leadId === 'object' && (
              <Typography variant="caption" color="textSecondary">
                Lead: {meeting.leadId.firstName} {meeting.leadId.lastName}
                {meeting.status && (
                  <span style={{ marginLeft: '10px', fontWeight: 'bold', color: meeting.status === 'completed' ? '#4CAF50' : '#FFA000' }}>
                    • {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                  </span>
                )}
              </Typography>
            )}
          </Box>
          
        </Box>

        {/* Right side: Action buttons */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Meetings Actions Dropdown */}
          <Box sx={{ position: "relative" }}>
            <OutlineButton
              variant="outlined"
              endIcon={<ArrowDropDownIcon />}
              onClick={handleMeetingMenuClick}
            >
              Actions
            </OutlineButton>
            <Menu
              anchorEl={anchorElMeeting}
              open={Boolean(anchorElMeeting)}
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
              <MenuItem onClick={handleEditMeeting} sx={{ py: 1.5 }}>
                Edit Meeting
              </MenuItem>
            </Menu>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default MeetingsNavbar;

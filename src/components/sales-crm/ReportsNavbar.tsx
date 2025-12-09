import React from "react";
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
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";


// Styled components for custom designs
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

const ReportsNavbar = () => {
  // State for menus
  const [anchorElCall, setAnchorElCall] = React.useState<null | HTMLElement>(null);
  const [anchorElMore, setAnchorElMore] = React.useState<null | HTMLElement>(null);

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
        {/* Left side: Actions dropdown */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Actions Dropdown */}
          <OutlineButton
            variant="outlined"
            endIcon={<ArrowDropDownIcon />}
            onClick={handleCallMenuClick}
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
            <MenuItem onClick={handleClose} sx={{ py: 1.5 }}>
              All Reports
            </MenuItem>
            <MenuItem onClick={handleClose} sx={{ py: 1.5 }}>
              Sales Reports
            </MenuItem>
            <MenuItem onClick={handleClose} sx={{ py: 1.5 }}>
              Performance Reports
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleClose} sx={{ py: 1.5 }}>
              Refresh Data
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleClose();
              }}
              sx={{ py: 1.5, display: { xs: "block", sm: "none" } }}
            >
              Mark Completed
            </MenuItem>
          </Menu>
        </Box>
        {/* Right side: Create Report button and 3-dot menu */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Mark Completed - visible only on md and up */}
          <button
            type="button"
            className="hidden sm:inline-flex bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md px-5 py-2 transition-colors"
            onClick={() => {}}
          >
            Create Report
          </button>

          {/* Call Actions Dropdown */}
          <Box sx={{ position: "relative" }}>
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
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default ReportsNavbar;

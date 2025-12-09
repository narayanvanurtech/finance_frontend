import React from "react";
import { useRouter } from "next/navigation";
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

import { ArrowBackIosNew as BackIcon, Refresh } from "@mui/icons-material";

import MenuIcon from "@mui/icons-material/Menu";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";

interface ReportsNavbarDetailsProps {
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

const ReportsNavbarDetails: React.FC<ReportsNavbarDetailsProps> = ({
  toggleSidebar,
}) => {
  const [anchorElReport, setAnchorElReport] =
    React.useState<null | HTMLElement>(null);
  const [anchorElMore, setAnchorElMore] = React.useState<null | HTMLElement>(
    null
  );
  const router = useRouter();

  const handleReportMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElReport(event.currentTarget);
  };

  const handleMoreMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElMore(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorElReport(null);
    setAnchorElMore(null);
  };

  const handleBack = () => {
    router.back();
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
            onClick={handleBack}
            className="!text-blue-600 !bg-blue-100 hover:!bg-blue-200 transition-all hover:-translate-x-1"
          >
            <BackIcon fontSize="small" />
          </IconButton>

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
            Top 10 Templates by Click Rate
          </Typography>
        </Box>

        {/* Right side: Action buttons and user */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Report Actions Dropdown */}
          
          <div className="flex gap-3 items-center">
          <button
            onClick={() => window.location.reload()}
            className="w-9 h-9 flex items-center justify-center bg-white text-indigo-600 rounded-full shadow hover:bg-indigo-50 transition cursor-pointer"
          >
            <Refresh fontSize="small"/>
          </button>
          <p className="text-xs text-zinc-500">Updated less than a minute ago</p>
          </div>
          
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

export default ReportsNavbarDetails;

import React from "react";
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
  IconButton,
  styled,
  Badge,
} from "@mui/material";
import {
  Description as ReportsIcon,
  Star as FavoritesIcon,
  Schedule as ScheduledIcon,
  Delete as DeletedIcon,
  AccountCircle as AccountIcon,
  MonetizationOn as DealIcon,
  Leaderboard as LeadIcon,
  Campaign as CampaignIcon,
  Work as CaseIcon,
  Inventory as ProductIcon,
  Store as VendorIcon,
  History as RecentIcon,
  Add as AddIcon,
  Folder as FolderIcon,
} from "@mui/icons-material";

// Styled components
const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    right: 8,
    top: 8,
    padding: "0 4px",
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
}));

const reportCategories = [
  { name: "All Reports", icon: <ReportsIcon />, count: 24 },
  { name: "My Reports", icon: <AccountIcon />, count: 5 },
  { name: "Favorites", icon: <FavoritesIcon /> },
  { name: "Recently Viewed", icon: <RecentIcon /> },
  { name: "Scheduled Reports", icon: <ScheduledIcon />, count: 3 },
  { name: "Recently Deleted", icon: <DeletedIcon /> },
];

const reportTypes = [
  { name: "Account and Contact Reports", icon: <AccountIcon /> },
  { name: "Deal Reports", icon: <DealIcon />, count: 8 },
  { name: "Lead Reports", icon: <LeadIcon />, count: 5 },
  { name: "Campaign Reports", icon: <CampaignIcon /> },
  { name: "Case and Solution Reports", icon: <CaseIcon />, count: 2 },
  { name: "Product Reports", icon: <ProductIcon /> },
  { name: "Vendor Reports", icon: <VendorIcon />, count: 3 },
];

const ReportsSidebar = ({ collapsed }: { collapsed: boolean }) => {
  const [selectedItem, setSelectedItem] = React.useState("All Reports");

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
            Reports
          </Typography>
          <Tooltip title="Create new report">
            <IconButton size="small" color="primary">
              <AddIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {/* Main List Section */}
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
        <List disablePadding>
          {/* Personal Reports Section */}
          {!collapsed && (
            <Typography
              variant="caption"
              sx={{
                px: 2,
                py: 1,
                color: "text.secondary",
                display: "block",
              }}
            >
              PERSONAL REPORTS
            </Typography>
          )}

          {reportCategories.map((item, index) => (
            <Tooltip
              key={item.name}
              title={collapsed ? item.name : ""}
              placement="right"
            >
              <ListItemButton
                selected={selectedItem === item.name}
                onClick={() => setSelectedItem(item.name)}
                sx={{
                  px: collapsed ? 2 : 2,
                  py: 1.5,
                  mx:  0.5,
                  my: 0.25,
                  borderRadius: "8px",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    backgroundColor: "rgba(106, 17, 203, 0.05)",
                    color: "#6A11CB",
                  },
                  "&.Mui-selected": {
                    backgroundColor: "rgba(106, 17, 203, 0.2)",
                    color: "#6A11CB",
                    "&:hover": {
                      backgroundColor: "rgba(106, 17, 203, 0.3)",
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: collapsed ? "auto" : 40,
                    color:
                      selectedItem === item.name
                        ? "rgba(106, 17, 203)"
                        : "inherit",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {!collapsed && (
                  <ListItemText
                    primary={item.name}
                    primaryTypographyProps={{
                      fontWeight: selectedItem === item.name ? 600 : 400,
                    }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          ))}

          {!collapsed && <Divider sx={{ my: 1, mx: 2 }} />}

          {/* Report Types Section */}
          {!collapsed && (
            <Typography
              variant="caption"
              sx={{
                px: 2,
                py: 1,
                color: "text.secondary",
                display: "block",
              }}
            >
              REPORT TYPES
            </Typography>
          )}

          {reportTypes.map((item) => (
            <Tooltip
              key={item.name}
              title={collapsed ? item.name : ""}
              placement="right"
            >
              <ListItemButton
                selected={selectedItem === item.name}
                onClick={() => setSelectedItem(item.name)}
                sx={{
                  px: collapsed ? 2 : 2,
                  py: 1.5,
                  mx: 0.5,
                  my: 0.25,
                  borderRadius: "8px",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    backgroundColor: "rgba(106, 17, 203, 0.05)",
                    color: "#6A11CB",
                  },
                  "&.Mui-selected": {
                    backgroundColor: "rgba(106, 17, 203, 0.2)",
                    color: "#6A11CB",
                    "&:hover": {
                      backgroundColor: "rgba(106, 17, 203, 0.3)",
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: collapsed ? "auto" : 40,
                    color:
                      selectedItem === item.name
                        ? "rgba(106, 17, 203)"
                        : "inherit",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {!collapsed && (
                  <ListItemText
                    primary={item.name}
                    primaryTypographyProps={{
                      fontWeight: selectedItem === item.name ? 600 : 400,
                    }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          ))}
        </List>
      </Box>

      {/* Bottom Section - Recent Folders */}
      {!collapsed && (
        <>
          <Divider sx={{ mx: 2 }} />
          <Box sx={{ p: 2 }}>
            <Typography
              variant="subtitle2"
              sx={{
                display: "flex",
                alignItems: "center",
                color: "text.secondary",
                mb: 1,
              }}
            >
              <FolderIcon sx={{ fontSize: 16, mr: 1 }} />
              Recent Folders
            </Typography>
            <Typography variant="body2" sx={{ color: "primary.main" }}>
              Q2 Sales Analysis
            </Typography>
            <Typography variant="body2" sx={{ color: "primary.main" }}>
              Marketing Campaigns
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
};

export default ReportsSidebar;

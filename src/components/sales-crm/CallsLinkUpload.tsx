"use client";

import React, { useState } from "react";
import { Call } from "@/api/callsApi";
import { useCallsStore } from "@/stores/salesCrmStore/useCallsStore";

interface CallsLinkUploadProps {
  call: Call;
}
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Button,
  Chip,
  Avatar,
  Typography,
  Box,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Badge,
} from "@mui/material";
import {
  Link as LinkIcon,
  Add,
  Language,
  Visibility,
  VisibilityOff,
  Close,
  OpenInNew,
  Delete,
  Notes,
  MoreVert,
} from "@mui/icons-material";

interface LinkItem {
  id: string;
  linkName: string;
  description: string;
  url: string;
  linkEncoding: string;
  exposeForCRMUser: boolean;
  profiles: string[];
  createdAt: Date;
}

const mergeFields = [
  { label: "Contact Name", value: "{{contact.name}}" },
  { label: "Company", value: "{{contact.company}}" },
  { label: "Email", value: "{{contact.email}}" },
  { label: "Phone", value: "{{contact.phone}}" },
];

const CallsLinkUpload: React.FC<CallsLinkUploadProps> = ({ call }) => {
  const [open, setOpen] = useState(false);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [formData, setFormData] = useState({
    linkName: "",
    description: "",
    url: "",
    linkEncoding: "UTF-8",
    exposeForCRMUser: true,
  });
  const [profiles, setProfiles] = useState<string[]>([]);
  const [newProfile, setNewProfile] = useState("");
  const [showMergeHint, setShowMergeHint] = useState(false);
  const [selectedLink, setSelectedLink] = useState<LinkItem | null>(null);

  const handleOpen = () => {
    setSelectedLink(null);
    setOpen(true);
  };

  const handleEdit = (link: LinkItem) => {
    setSelectedLink(link);
    setFormData({
      linkName: link.linkName,
      description: link.description,
      url: link.url,
      linkEncoding: link.linkEncoding,
      exposeForCRMUser: link.exposeForCRMUser,
    });
    setProfiles([...link.profiles]);
    setOpen(true);
  };

  const handleClose = () => {
    resetForm();
    setOpen(false);
  };

  const resetForm = () => {
    setFormData({
      linkName: "",
      description: "",
      url: "",
      linkEncoding: "UTF-8",
      exposeForCRMUser: true,
    });
    setProfiles([]);
    setNewProfile("");
    setShowMergeHint(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (name === "url" && value.includes("#")) {
      setShowMergeHint(true);
    }
  };

  const handleAddProfile = () => {
    if (newProfile.trim() && !profiles.includes(newProfile.trim())) {
      setProfiles([...profiles, newProfile.trim()]);
      setNewProfile("");
    }
  };

  const handleDeleteProfile = (profileToDelete: string) => {
    setProfiles(profiles.filter((profile) => profile !== profileToDelete));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const linkEntry: LinkItem = {
      id: selectedLink?.id || Date.now().toString(),
      ...formData,
      profiles,
      createdAt: selectedLink?.createdAt || new Date(),
    };

    if (selectedLink) {
      setLinks(
        links.map((link) => (link.id === selectedLink.id ? linkEntry : link))
      );
    } else {
      setLinks([linkEntry, ...links]);
    }
    handleClose();
  };

  const handleDeleteLink = (id: string) => {
    setLinks(links.filter((link) => link.id !== id));
  };

  return (
    <Paper elevation={0} sx={{ p: 2, borderRadius: 2 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <LinkIcon color="primary" />
          <Typography variant="h6" component="h2">
            Links
          </Typography>
          <Badge badgeContent={links.length} color="primary" sx={{ ml: 1 }} />
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpen}
          size="small"
        >
          Add Link
        </Button>
      </Box>

      {/* Links List */}
      {links.length > 0 ? (
        <List sx={{ width: "100%", bgcolor: "background.paper" }}>
          {links.map((link) => (
            <React.Fragment key={link.id}>
              <ListItem
                secondaryAction={
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <IconButton
                      edge="end"
                      aria-label="open"
                      href={link.url}
                      target="_blank"
                    >
                      <OpenInNew fontSize="small" />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="edit"
                      onClick={() => handleEdit(link)}
                    >
                      <Notes fontSize="small" />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDeleteLink(link.id)}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: "primary.main" }}>
                    <LinkIcon fontSize="small" />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={link.linkName}
                  secondary={
                    <>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.primary"
                        display="block"
                      >
                        {link.url}
                      </Typography>
                      <Typography
                        component="span"
                        variant="caption"
                        color="text.secondary"
                      >
                        {link.createdAt.toLocaleString()} • {link.linkEncoding}{" "}
                        • {link.exposeForCRMUser ? "Public" : "Private"}
                      </Typography>
                      {link.profiles.length > 0 && (
                        <Box
                          sx={{
                            mt: 1,
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 0.5,
                          }}
                        >
                          {link.profiles.map((profile) => (
                            <Chip
                              key={profile}
                              label={profile}
                              size="small"
                              avatar={
                                <Avatar sx={{ width: 24, height: 24 }}>
                                  {profile[0]}
                                </Avatar>
                              }
                            />
                          ))}
                        </Box>
                      )}
                    </>
                  }
                />
              </ListItem>
              <Divider variant="inset" component="li" />
            </React.Fragment>
          ))}
        </List>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            p: 4,
            textAlign: "center",
            border: "1px dashed",
            borderColor: "divider",
            borderRadius: 1,
          }}
        >
          <LinkIcon sx={{ fontSize: 48, color: "action.disabled", mb: 2 }} />

          <p className="text-md text-gray-500 font-medium">No links added yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Click "Add Link" to create your first link{" "}
          </p>
        </Box>
      )}

      {/* Add/Edit Link Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <LinkIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">
              {selectedLink ? "Edit Link" : "Add New Link"}
            </Typography>
            <IconButton
              aria-label="close"
              onClick={handleClose}
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Link Name"
              name="linkName"
              value={formData.linkName}
              onChange={handleChange}
              required
              margin="normal"
              InputProps={{
                startAdornment: (
                  <Language sx={{ color: "action.active", mr: 1 }} />
                ),
              }}
            />

            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={3}
              margin="normal"
            />

            <TextField
              fullWidth
              label="URL"
              name="url"
              value={formData.url}
              onChange={handleChange}
              required
              margin="normal"
              helperText="Hint: Type # to insert merge fields"
              InputProps={{
                startAdornment: (
                  <Box sx={{ color: "text.secondary", mr: 1 }}>https://</Box>
                ),
              }}
            />

            {showMergeHint && (
              <Box sx={{ mb: 2, p: 1, bgcolor: "grey.100", borderRadius: 1 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Available merge fields:
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {mergeFields.map((field) => (
                    <Chip
                      key={field.value}
                      label={field.label}
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          url: prev.url.replace("#", field.value),
                        }));
                        setShowMergeHint(false);
                      }}
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Box>
              </Box>
            )}

            <FormControl fullWidth margin="normal">
              <InputLabel>Link Encoding</InputLabel>
              <Select
                name="linkEncoding"
                value={formData.linkEncoding}
                onChange={(e) =>
                  setFormData({ ...formData, linkEncoding: e.target.value })
                }
                label="Link Encoding"
              >
                <MenuItem value="UTF-8">UTF-8 (Unicode)</MenuItem>
                <MenuItem value="ISO-8859-1">ISO-8859-1 (Latin-1)</MenuItem>
                <MenuItem value="ASCII">ASCII</MenuItem>
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Checkbox
                  name="exposeForCRMUser"
                  checked={formData.exposeForCRMUser}
                  onChange={handleChange}
                  icon={<VisibilityOff />}
                  checkedIcon={<Visibility />}
                />
              }
              label="Expose for CRM User"
              sx={{ mt: 2, mb: 2 }}
            />

            <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
              Add Profile
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                value={newProfile}
                onChange={(e) => setNewProfile(e.target.value)}
                placeholder="Enter profile name"
              />
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleAddProfile}
                disabled={!newProfile.trim()}
                size="small"
              >
                Add
              </Button>
            </Box>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
              {profiles.map((profile) => (
                <Chip
                  key={profile}
                  label={profile}
                  onDelete={() => handleDeleteProfile(profile)}
                  avatar={
                    <Avatar sx={{ width: 24, height: 24 }}>{profile[0]}</Avatar>
                  }
                />
              ))}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={!formData.linkName || !formData.url}
          >
            {selectedLink ? "Update Link" : "Save Link"}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default CallsLinkUpload;

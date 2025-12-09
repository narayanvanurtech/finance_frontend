import React, { useState, useEffect, useRef } from "react";
import {
  TextField,
  MenuItem,
  Select,
  InputAdornment,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import { useLeadsStore } from "@/stores/salesCrmStore/useLeadsStore";
import { useTasksStore } from "@/stores/salesCrmStore/useTasksStore";
import { useDealsStore } from "@/stores/salesCrmStore/useDealsStore";
import { useCallsStore } from "@/stores/salesCrmStore/useCallsStore";
import { useMeetingsStore } from "@/stores/salesCrmStore/useMeetingsStore";
import { useAuthStore } from "@/stores/salesCrmStore/useAuthStore";

export interface SearchBarProps {
  section: string; // e.g. 'leads', 'tasks', etc.
  placeholder?: string;
}

// Internal mapping of searchable fields per section
const SEARCHABLE_FIELDS: Record<string, { label: string; value: string }[]> = {
  leads: [
    { label: "First Name", value: "firstName" },
    { label: "Last Name", value: "lastName" },
    { label: "Email", value: "email" },
    { label: "Phone", value: "phone" },
    { label: "Company", value: "company" },
  ],
  contacts: [
    { label: "First Name", value: "firstName" },
    { label: "Last Name", value: "lastName" },
    { label: "Email", value: "email" },
    { label: "Phone", value: "phone" },
    { label: "Company", value: "company" },
  ],
  tasks: [
    // Only keep 'Subject' in SearchBar, others are in FilterSidebar
    { label: "Subject", value: "subject" },
  ],
  deals: [
    // Only keep 'Deal Name' in SearchBar, others are in FilterSidebar
    { label: "Deal Name", value: "dealName" },
  ],
  calls: [
    // Only keep fields not in FilterSidebar
    // FilterSidebar: Call Type, Outgoing Call Status, Call Purpose, Call Agenda, Created At, Updated At
    // So SearchBar should be empty or only have fields not in sidebar (none left)
  ],
  meetings: [
    // Only keep fields not in FilterSidebar
    // FilterSidebar: Meeting Venue, Participants, From Date Time, To Date Time, Created At
    { label: "Title", value: "title" },
    { label: "Host", value: "host" },
  ],
};

const SearchBar: React.FC<SearchBarProps> = ({ section, placeholder }) => {
  const fields = SEARCHABLE_FIELDS[section] || [];
  const [selectedField, setSelectedField] = useState(fields[0]?.value || "");
  const [inputValue, setInputValue] = useState("");
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Store hooks
  const { user } = useAuthStore();
  const { fetchLeads } = useLeadsStore();
  const { fetchTasks } = useTasksStore();
  const { setFilters } = useDealsStore();
  const { fetchAllCalls } = useCallsStore();
  const { fetchMeetings } = useMeetingsStore();

  useEffect(() => {
    setSelectedField(fields[0]?.value || "");
    setInputValue("");
  }, [section]);

  // Debounced search effect
  useEffect(() => {
    if (!inputValue) return; // Don't search on empty
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      handleSearch(selectedField, inputValue);
    }, 400);
    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue, selectedField]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
      handleSearch(selectedField, inputValue);
    }
  };

  const handleSearchClick = () => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    handleSearch(selectedField, inputValue);
  };

  const handleFieldChange = (field: string) => {
    setSelectedField(field);
    setInputValue("");
  };

  // The search logic is now internal
  const handleSearch = (field: string, value: string) => {
    if (!value) return;
    if (section === "leads" || section === "contacts") {
      const filters: any = {};
      if (value) filters[field] = value;
      if (user?.companyId) {
        fetchLeads(user.companyId, filters);
      }
    } else if (section === "tasks") {
      const filters: any = {};
      if (value) filters[field] = value;
      if (user?.companyId) {
        fetchTasks(user.companyId, filters);
      }
    } else if (section === "deals") {
      const filters: any = {};
      if (value) filters[field] = value;
      setFilters(filters);
    } else if (section === "calls") {
      const filters: any = {};
      if (value) filters[field] = value;
      fetchAllCalls(filters);
    } else if (section === "meetings") {
      const filters: any = {};
      if (value) filters[field] = value;
      fetchMeetings(filters);
    }
  };

  // Clear handler for cross button
  const handleClear = () => {
    setInputValue("");
    setSelectedField(fields[0]?.value || "");
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    // Reset the store for the current section
    if (section === "leads" || section === "contacts") {
      if (user?.companyId) {
        fetchLeads(user.companyId, {});
      }
    } else if (section === "tasks") {
      if (user?.companyId) {
        fetchTasks(user.companyId, {});
      }
    } else if (section === "deals") {
      setFilters({});
    } else if (section === "calls") {
      fetchAllCalls({});
    } else if (section === "meetings") {
      fetchMeetings({});
    }
  };

  return (
    <div
      className="flex items-center w-full"
      style={{ gap: 12, alignItems: "center", minHeight: 48 }}
    >
      <div>
        <Select
          size="small"
          value={selectedField}
          onChange={(e) => handleFieldChange(e.target.value as string)}
          sx={{
            minWidth: 140,
            fontSize: "0.97rem",
            color: "#374151",
            backgroundColor: "#F9FAFB",
            borderRadius: "8px",
            border: "1px solid #E5E7EB",
            boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
            "& .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
            "&:hover": {
              backgroundColor: "#F3F4F6",
              borderColor: "#D1D5DB",
            },
            "&.Mui-focused": {
              backgroundColor: "#FFF",
              borderColor: "#6366F1",
            },
            transition: "all 0.2s",
          }}
          className="focus:ring-0"
          MenuProps={{
            PaperProps: {
              sx: {
                borderRadius: "8px",
                boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                py: 1,
                minWidth: 220,
              },
            },
          }}
        >
          {fields.map((field) => (
            <MenuItem
              key={field.value}
              value={field.value}
              sx={{ fontSize: "0.97rem", py: 1.7, px: 2.5 }}
            >
              {field.label}
            </MenuItem>
          ))}
        </Select>
      </div>
      <div style={{ flex: 1 }}>
        <TextField
          size="small"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={
            placeholder ||
            `Search by ${
              fields.find((f) => f.value === selectedField)?.label || ""
            }`
          }
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon sx={{ color: "#A1A1AA", ml: 1 }} />
              </InputAdornment>
            ),
            sx: {
              fontSize: "0.97rem",
              color: "#374151",
              backgroundColor: "#F9FAFB",
              borderRadius: "8px",
              border: "1px solid #E5E7EB",
              boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
              "& .MuiOutlinedInput-notchedOutline": {
                border: "none",
              },
              "&:hover": {
                backgroundColor: "#F3F4F6",
                borderColor: "#D1D5DB",
              },
              "&.Mui-focused": {
                backgroundColor: "#FFF",
                borderColor: "#6366F1",
              },
              transition: "all 0.2s",
            },
          }}
          sx={{ width: "100%", border: "none", backgroundColor: "transparent" }}
          className="focus:ring-0"
        />
      </div>
      <div>
        <button
          type="button"
          onClick={handleClear}
          className="flex items-center gap-1 px-3 py-2 rounded-md border border-gray-200 bg-white text-gray-600 text-sm hover:bg-gray-50 transition-colors"
          style={{ cursor: "pointer", minHeight: 40 }}
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default SearchBar;

"use client";
import React, { useState } from "react";
import { useLeadsStore } from "@/stores/salesCrmStore/useLeadsStore";
import { useTasksStore } from "@/stores/salesCrmStore/useTasksStore";
import { useCallsStore } from "@/stores/salesCrmStore/useCallsStore";
import { useMeetingsStore } from "@/stores/salesCrmStore/useMeetingsStore";
import { useDealsStore } from "@/stores/salesCrmStore/useDealsStore";
import { useAuthStore } from "@/stores/salesCrmStore/useAuthStore";
import { usePathname } from "next/navigation";
import {
  Button,
  Checkbox,
  Collapse,
  FormControlLabel,
  TextField,
  MenuItem,
} from "@mui/material";
import FilterIcon from "@mui/icons-material/FilterList";

interface FilterValue {
  field: string;
  value: string;
}

interface LeadFilters {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  leadSource?: string;
  leadStatus?: string;
  priority?: string;
  status?: string;
  "address.city"?: string;
  "address.state"?: string;
  "address.street"?: string;
}

export default function FilterSidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { fetchLeads } = useLeadsStore();
  const { fetchTasks } = useTasksStore();
  const { fetchAllCalls } = useCallsStore();
  const { fetchMeetings } = useMeetingsStore();
  const { setFilters: setDealsFilters, clearFilters: clearDealsFilters } =
    useDealsStore();
  const [searchText, setSearchText] = useState("");
  const [filterValues, setFilterValues] = useState<FilterValue[]>([]);
  const [filterByFieldsOpen, setFilterByFieldsOpen] = useState(true);
  const [selectedFilters, setSelectedFilters] = useState<{
    fields: string[];
  }>({
    fields: [],
  });

  // New function to check if any filter is active
  const hasActiveFilters = (): boolean => {
    return (
      !!searchText ||
      selectedFilters.fields.length > 0 ||
      filterValues.some((filter) => !!filter.value)
    );
  };

  const handleToggle = () => {
    setFilterByFieldsOpen(!filterByFieldsOpen);
  };

  const handleCheckboxChange = (value: string) => {
    setSelectedFilters((prev) => {
      const wasSelected = prev.fields.includes(value);
      const updatedFields = wasSelected
        ? prev.fields.filter((item) => item !== value)
        : [...prev.fields, value];

      if (wasSelected) {
        setFilterValues((prev) => prev.filter((f) => f.field !== value));
      } else {
        setFilterValues((prev) => [...prev, { field: value, value: "" }]);
      }

      return { ...prev, fields: updatedFields };
    });
  };

  const handleFilterValueChange = (field: string, value: string) => {
    setFilterValues((prev) =>
      prev.map((f) => (f.field === field ? { ...f, value } : f))
    );
  };

  // Get the filter fields based on the current page
  const getFilterFields = () => {
    if (pathname.includes("/tasks")) {
      return [
        "Status",
        "Priority",
        "Due Date",
        "Completion Date",
        "Created At",
      ];
    }
    if (pathname.includes("/deals")) {
      return [
        "Type",
        "Lead Source",
        "Stage",
        "Min Amount",
        "Max Amount",
        "Start Date",
        "End Date",
      ];
    }
    if (pathname.includes("/calls")) {
      return [
        "Call Type",
        "Outgoing Call Status",
        "Call Purpose",
        "Call Agenda",
        "Created At",
        "Updated At",
      ];
    }
    if (pathname.includes("/meetings")) {
      return [
        "Meeting Venue",
        "Participants",
        "From Date Time",
        "To Date Time",
        "Created At",
      ];
    }
    return ["Status", "Lead Source", "Lead Status", "Priority"];
  };

  const getFilterValue = (field: string): string => {
    if (pathname.includes("/tasks")) {
      switch (field) {
        case "Subject":
          return "subject";
        case "Status":
          return "status";
        case "Priority":
          return "priority";
        case "Due Date":
          return "dueDate";
        case "Completion Date":
          return "completionDate";
        case "Created At":
          return "createdAt";
        default:
          return field.toLowerCase();
      }
    }

    if (pathname.includes("/deals")) {
      switch (field) {
        case "Deal Name":
          return "dealName";
        case "Type":
          return "type";
        case "Lead Source":
          return "leadSource";
        case "Stage":
          return "stage";
        case "Min Amount":
          return "minAmount";
        case "Max Amount":
          return "maxAmount";
        case "Start Date":
          return "startDate";
        case "End Date":
          return "endDate";
        default:
          return field.toLowerCase();
      }
    }

    if (pathname.includes("/calls")) {
      switch (field) {
        case "Call Type":
          return "callType";
        case "Outgoing Call Status":
          return "outgoingCallStatus";
        case "Call Purpose":
          return "callPurpose";
        case "Call Agenda":
          return "callAgenda";
        case "Created At":
          return "createdAt";
        case "Updated At":
          return "updatedAt";
        default:
          return field.toLowerCase();
      }
    }

    if (pathname.includes("/meetings")) {
      switch (field) {
        case "Title":
          return "title";
        case "Host":
          return "host";
        case "Meeting Venue":
          return "meetingVenue";
        case "Participants":
          return "participants";
        case "From Date Time":
          return "fromDateTime";
        case "To Date Time":
          return "toDateTime";
        case "Created At":
          return "createdAt";
        default:
          return field.toLowerCase();
      }
    }

    switch (field) {
      case "Company":
        return "company";
      case "First Name":
        return "firstName";
      case "Last Name":
        return "lastName";
      case "Email":
        return "email";
      case "Phone":
        return "phone";
      case "Lead Source":
        return "leadSource";
      case "Lead Status":
        return "leadStatus";
      case "Priority":
        return "priority";
      case "Status":
        return "status";
      case "City":
        return "address.city";
      case "State":
        return "address.state";
      case "Street":
        return "address.street";
      default:
        return field.toLowerCase();
    }
  };

  const formatDateForApi = (dateStr: string, field: string): string => {
    const date = new Date(dateStr);

    // For dueDate, send in YYYY-MM-DD format
    if (field === "Due Date") {
      return date.toISOString().split("T")[0];
    }

    // For createdAt and completionDate, send in MM/DD/YYYY format
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${month}/${day}/${year}`; // Returns MM/DD/YYYY
  };

  const getFieldType = (field: string): string => {
    if (pathname.includes("/tasks")) {
      if (["Due Date", "Completion Date", "Created At"].includes(field)) {
        return "date";
      }
    }
    if (pathname.includes("/deals")) {
      if (["Start Date", "End Date"].includes(field)) {
        return "date";
      }
      if (["Min Amount", "Max Amount"].includes(field)) {
        return "number";
      }
    }
    if (pathname.includes("/calls")) {
      if (["Created At", "Updated At"].includes(field)) {
        return "date";
      }
    }
    if (pathname.includes("/meetings")) {
      if (["From Date Time", "To Date Time", "Created At"].includes(field)) {
        return "date";
      }
    }
    return "text";
  };

  const applyFilters = () => {
    if (pathname.includes("/tasks")) {
      const filters: any = {};

      // Add search text to subject if present
      if (searchText) {
        filters.subject = searchText;
      }

      // Add selected field filters with their values
      filterValues.forEach(({ field, value }) => {
        if (value) {
          const filterKey = getFilterValue(field);
          if (filterKey) {
            // Handle date fields specially
            if (
              ["dueDate", "completionDate", "createdAt"].includes(filterKey)
            ) {
              filters[filterKey] = formatDateForApi(value, field);
            } else {
              filters[filterKey] = value;
            }
          }
        }
      });

      if (user?.companyId) {
        fetchTasks(user.companyId, filters);
      }
    } else if (pathname.includes("/deals")) {
      const filters: any = {};

      // Add search text to dealName if present
      if (searchText) {
        filters.dealName = searchText;
      }

      // Add selected field filters with their values
      filterValues.forEach(({ field, value }) => {
        if (value) {
          const filterKey = getFilterValue(field);
          if (filterKey) {
            // Handle date fields specially
            if (["startDate", "endDate"].includes(filterKey)) {
              filters[filterKey] = formatDateForApi(value, field);
            }
            // Handle numeric fields for amounts
            else if (["minAmount", "maxAmount"].includes(filterKey)) {
              filters[filterKey] = parseFloat(value);
            } else {
              filters[filterKey] = value;
            }
          }
        }
      });

      setDealsFilters(filters);
    } else if (pathname.includes("/calls")) {
      const filters: any = {};

      // Add search text if present
      if (searchText) {
        filters.search = searchText;
      }

      // Add selected field filters with their values
      filterValues.forEach(({ field, value }) => {
        if (value) {
          const filterKey = getFilterValue(field);
          if (filterKey) {
            // Handle date fields specially
            if (["createdAt", "updatedAt"].includes(filterKey)) {
              filters[filterKey] = formatDateForApi(value, field);
            } else {
              filters[filterKey] = value;
            }
          }
        }
      });

      fetchAllCalls(filters);
    } else if (pathname.includes("/meetings")) {
      const filters: any = {};

      // Add search text if present
      if (searchText) {
        filters.title = searchText;
      }

      // Add selected field filters with their values
      filterValues.forEach(({ field, value }) => {
        if (value) {
          const filterKey = getFilterValue(field);
          if (filterKey) {
            // Handle date fields specially
            if (
              ["fromDateTime", "toDateTime", "createdAt"].includes(filterKey)
            ) {
              filters[filterKey] = formatDateForApi(value, field);
            } else {
              filters[filterKey] = value;
            }
          }
        }
      });

      fetchMeetings(filters);
    } else {
      // Default leads/contacts filtering
      const filters: LeadFilters = {};

      if (searchText) {
        filters.firstName = searchText;
        filters.lastName = searchText;
        filters.email = searchText;
        filters.company = searchText;
      }

      filterValues.forEach(({ field, value }) => {
        if (value) {
          const filterKey = getFilterValue(field) as keyof LeadFilters;
          if (filterKey) {
            filters[filterKey] = value;
          }
        }
      });

      if (user?.companyId) {
        fetchLeads(user.companyId, filters);
      }
    }
  };

  const clearFilters = () => {
    setSearchText("");
    setSelectedFilters({
      fields: [],
    });
    setFilterValues([]);

    if (pathname.includes("/tasks")) {
      if (user?.companyId) {
        fetchTasks(user.companyId, {});
      }
    } else if (pathname.includes("/deals")) {
      clearDealsFilters();
    } else if (pathname.includes("/calls")) {
      fetchAllCalls({});
    } else if (pathname.includes("/meetings")) {
      fetchMeetings({});
    } else {
      if (user?.companyId) {
        fetchLeads(user.companyId, {});
      }
    }
  };

  const sectionHeader =
    "flex items-center justify-between cursor-pointer py-2 text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors duration-200";

  const getFilterLabel = () => {
    if (pathname.includes("/tasks")) return "Filter Tasks";
    if (pathname.includes("/leads")) return "Filter Leads";
    if (pathname.includes("/contacts")) return "Filter Contacts";
    if (pathname.includes("/deals")) return "Filter Deals";
    if (pathname.includes("/accounts")) return "Filter Accounts";
    if (pathname.includes("/calls")) return "Filter Calls";
    if (pathname.includes("/meetings")) return "Filter Meetings";
    return "Filter"; // fallback
  };

  // Enum options for dropdowns based on backend models
  const LEAD_STATUS_OPTIONS = [
    "new",
    "contacted",
    "follow_up_scheduled",
    "interested",
    "qualified",
    "converted",
    "not_interested",
    "unreachable",
    "disqualified",
  ];
  const LEAD_STATUS_LABELS: Record<string, string> = {
    new: "New",
    contacted: "Contacted",
    follow_up_scheduled: "Follow Up Scheduled",
    interested: "Interested",
    qualified: "Qualified",
    converted: "Converted",
    not_interested: "Not Interested",
    unreachable: "Unreachable",
    disqualified: "Disqualified",
  };
  const LEAD_STATUS_SIMPLE_OPTIONS = ["hot", "warm", "cold"];
  const LEAD_STATUS_SIMPLE_LABELS: Record<string, string> = {
    hot: "Hot",
    warm: "Warm",
    cold: "Cold",
  };
  const TASK_STATUS_OPTIONS = [
    "Not Started",
    "In Progress",
    "Completed",
    "Deferred",
    "Waiting on someone else",
  ];
  const DEAL_STAGE_OPTIONS = [
    "Qualification",
    "Needs Analysis",
    "Value Proposition",
    "Identify Decision Makers",
    "Proposal/Price Quote",
    "Negotiation/Review",
    "Closed Won",
    "Closed Lost",
  ];
  const CALL_STATUS_OPTIONS = ["scheduled", "completed", "missed", "cancel"];
  const MEETING_STATUS_OPTIONS = [
    "scheduled",
    "completed",
    "missed",
    "cancel",
    "rescheduled",
  ];
  const PRIORITY_OPTIONS = ["low", "medium", "high", "critical"];
  const PRIORITY_LABELS: Record<string, string> = {
    low: "Low",
    medium: "Medium",
    high: "High",
    critical: "Critical",
  };

  return (
    <div className="h-full max-w-70 overflow-y-auto py-4 ml-2 my-2 px-4 bg-white custom-scrollbar space-y-4 border-r border-gray-200">
      <div>
        <div className={sectionHeader} onClick={handleToggle}>
          <div className="flex items-center gap-2">
            <FilterIcon fontSize="small" />
            {getFilterLabel()}
          </div>
          <span>{filterByFieldsOpen ? "−" : "+"}</span>
        </div>
        <Collapse in={filterByFieldsOpen}>
          <div className="space-y-1 pl-3 mt-2">
            {getFilterFields().map((option) => (
              <div key={option} className="space-y-2">
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={selectedFilters.fields.includes(option)}
                      onChange={() => handleCheckboxChange(option)}
                    />
                  }
                  label={
                    <span className="text-sm text-gray-700">{option}</span>
                  }
                />
                {selectedFilters.fields.includes(option) &&
                  (() => {
                    // Determine if this field should be a dropdown and which options to use
                    let dropdownOptions: string[] | null = null;
                    let optionLabels: Record<string, string> | null = null;
                    if (pathname.includes("/tasks") && option === "Status") {
                      dropdownOptions = TASK_STATUS_OPTIONS;
                    } else if (
                      pathname.includes("/deals") &&
                      option === "Stage"
                    ) {
                      dropdownOptions = DEAL_STAGE_OPTIONS;
                    } else if (
                      pathname.includes("/calls") &&
                      option === "Outgoing Call Status"
                    ) {
                      dropdownOptions = CALL_STATUS_OPTIONS;
                    } else if (
                      pathname.includes("/meetings") &&
                      option === "Status"
                    ) {
                      dropdownOptions = MEETING_STATUS_OPTIONS;
                    } else if (
                      (pathname.includes("/leads") ||
                        pathname.includes("/contacts") ||
                        !pathname.includes("/")) &&
                      option === "Status"
                    ) {
                      dropdownOptions = LEAD_STATUS_SIMPLE_OPTIONS;
                      optionLabels = LEAD_STATUS_SIMPLE_LABELS;
                    } else if (
                      (pathname.includes("/leads") ||
                        pathname.includes("/contacts") ||
                        !pathname.includes("/")) &&
                      option === "Lead Status"
                    ) {
                      dropdownOptions = LEAD_STATUS_OPTIONS;
                      optionLabels = LEAD_STATUS_LABELS;
                    } else if (
                      pathname.includes("/tasks") &&
                      option === "Priority"
                    ) {
                      dropdownOptions = PRIORITY_OPTIONS;
                      optionLabels = PRIORITY_LABELS;
                    } else if (
                      (pathname.includes("/leads") ||
                        pathname.includes("/contacts") ||
                        !pathname.includes("/")) &&
                      option === "Priority"
                    ) {
                      dropdownOptions = PRIORITY_OPTIONS;
                      optionLabels = PRIORITY_LABELS;
                    }
                    if (dropdownOptions) {
                      return (
                        <TextField
                          select
                          size="small"
                          fullWidth
                          value={
                            filterValues.find((f) => f.field === option)
                              ?.value || ""
                          }
                          onChange={(e) =>
                            handleFilterValueChange(option, e.target.value)
                          }
                          className="ml-6 mb-2"
                        >
                          <MenuItem value="" disabled>
                            Select {option}
                          </MenuItem>
                          {dropdownOptions.map((val) => (
                            <MenuItem key={val} value={val}>
                              {optionLabels ? optionLabels[val] : val}
                            </MenuItem>
                          ))}
                        </TextField>
                      );
                    }
                    // fallback to text/date/number field
                    return (
                      <TextField
                        size="small"
                        fullWidth
                        type={getFieldType(option)}
                        placeholder={`Enter ${option.toLowerCase()}`}
                        value={
                          filterValues.find((f) => f.field === option)?.value ||
                          ""
                        }
                        onChange={(e) =>
                          handleFilterValueChange(option, e.target.value)
                        }
                        inputProps={{
                          max: [
                            "Created At",
                            "Due Date",
                            "Completion Date",
                            "Updated At",
                          ].includes(option)
                            ? new Date().toISOString().split("T")[0]
                            : undefined,
                          step: ["Min Amount", "Max Amount"].includes(option)
                            ? "0.01"
                            : undefined,
                        }}
                        className="ml-6 mb-2"
                      />
                    );
                  })()}
              </div>
            ))}
          </div>
        </Collapse>
      </div>

      {hasActiveFilters() && (
        <div className="flex justify-between flex-wrap gap-3 mt-6">
          <Button
            variant="outlined"
            color="secondary"
            onClick={clearFilters}
            className="w-full"
          >
            Clear Filters
          </Button>
          <Button
            variant="contained"
            style={{ backgroundColor: "#0099F6", color: "white" }}
            onClick={applyFilters}
            className="w-full"
          >
            Apply Filters
          </Button>
        </div>
      )}
    </div>
  );
}

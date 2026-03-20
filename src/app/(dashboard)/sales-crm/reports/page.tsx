"use client";

import React, { useState } from "react";
import Table from "@/components/sales-crm/Table";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import SelectedHeaderData from "@/components/sales-crm/SelectedHeaderData";
import { useRouter } from "next/navigation";
import ReportsNavbar from "@/components/sales-crm/ReportsNavbar";

const ReportsData = [
  {
    id: 1,
    subject: "Top 10 Templates by Click Rate",
    description: "Ranking of email templates with the highest click-through percentages.",
    folder: "Email Reports",
    lastAccessedDate: "2 hours ago",
    CreatedBy: "Jane Smith",
  },
  {
    id: 2,
    subject: "Weekly Campaign Performance",
    description: "Summary of all marketing campaign metrics for the past week.",
    folder: "Marketing Reports",
    lastAccessedDate: "1 day ago",
    CreatedBy: "Mark Johnson",
  },
  {
    id: 3,
    subject: "Lead Conversion Statistics",
    description: "Insight into conversion rates across different lead sources.",
    folder: "Sales Reports",
    lastAccessedDate: "30 minutes ago",
    CreatedBy: "Alicia Gomez",
  },
  {
    id: 4,
    subject: "Monthly Revenue Breakdown",
    description: "Detailed breakdown of revenue streams by region and product.",
    folder: "Finance Reports",
    lastAccessedDate: "3 days ago",
    CreatedBy: "David Lee",
  },
  {
    id: 5,
    subject: "Customer Feedback Summary",
    description: "Analysis of customer feedback trends and satisfaction scores.",
    folder: "Support Reports",
    lastAccessedDate: "5 hours ago",
    CreatedBy: "Sarah Kim",
  },
  {
    id: 6,
    subject: "Top Performing Sales Reps",
    description: "List of top sales representatives based on quarterly revenue.",
    folder: "Sales Reports",
    lastAccessedDate: "6 hours ago",
    CreatedBy: "Michael Chen",
  },
  {
    id: 7,
    subject: "Quarterly Churn Analysis",
    description: "Report on customer churn rates and retention strategies.",
    folder: "Customer Reports",
    lastAccessedDate: "4 days ago",
    CreatedBy: "Priya Patel",
  },
  {
    id: 8,
    subject: "Product Usage Trends",
    description: "Analysis of product feature adoption and usage frequency.",
    folder: "Product Reports",
    lastAccessedDate: "8 hours ago",
    CreatedBy: "Lucas Brown",
  },
  {
    id: 9,
    subject: "Support Ticket Resolution Time",
    description: "Average resolution time for support tickets by category.",
    folder: "Support Reports",
    lastAccessedDate: "12 hours ago",
    CreatedBy: "Emily Davis",
  },
  {
    id: 10,
    subject: "Annual Growth Forecast",
    description: "Projections for company growth based on current trends.",
    folder: "Finance Reports",
    lastAccessedDate: "1 week ago",
    CreatedBy: "Omar Farouk",
  },
];


const ReportsPage = () => {
  const router = useRouter();

  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [menuAnchorEls, setMenuAnchorEls] = useState<(null | HTMLElement)[]>(
    Array(ReportsData.length).fill(null)
  );

  const toggleAll = () => {
    setSelectedRows((prev) =>
      prev.length === ReportsData.length ? [] : ReportsData.map((_, i) => i)
    );
  };

  const toggleRow = (index: number) => {
    setSelectedRows((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleMoreClick = (
    index: number,
    event: React.MouseEvent<HTMLElement>
  ) => {
    const newAnchors = [...menuAnchorEls];
    newAnchors[index] = event.currentTarget;
    setMenuAnchorEls(newAnchors);
    if (!selectedRows.includes(index)) {
      setSelectedRows((prev) => [...prev, index]);
    }
  };

  const handleMoreClose = (index: number) => {
    const newAnchors = [...menuAnchorEls];
    newAnchors[index] = null;
    setMenuAnchorEls(newAnchors);
    setSelectedRows((prev) => prev.filter((i) => i !== index));
  };

  const handleOptionClick = (action: string, index: number) => {
    console.log(`Action '${action}' on row ${index}`);
    handleMoreClose(index);
  };

  const handleRowClick = (item: (typeof ReportsData)[0]) => {
    router.push(`/reports/${item.id}`);
  };

  const renderRow = (item: (typeof ReportsData)[0], index: number) => {
    const isMenuOpen = Boolean(menuAnchorEls[index]);
    const isSelected = selectedRows.includes(index);

    return (
      <tr
        key={item.id}
        className={`group border-b border-zinc-300 text-sm text-gray-700 transition ${
          isSelected ? "bg-blue-50" : "hover:bg-gray-50"
        }`}
        onClick={() => handleRowClick(item)}
      >
        <td
          className="py-4 px-2 text-center w-10"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className={`transition-opacity duration-200 ${
              isMenuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
          >
            <Tooltip title="More Options">
              <IconButton
                onClick={(e) => handleMoreClick(index, e)}
                size="small"
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={menuAnchorEls[index]}
              open={isMenuOpen}
              onClose={() => handleMoreClose(index)}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              transformOrigin={{ vertical: "top", horizontal: "left" }}
            >
              <MenuItem onClick={() => handleOptionClick("Edit", index)}>
                Edit
              </MenuItem>
              <MenuItem onClick={() => handleOptionClick("Delete", index)}>
                Delete
              </MenuItem>
              <MenuItem
                onClick={() => handleOptionClick("Assign Owner", index)}
              >
                Assign Owner
              </MenuItem>
              <MenuItem
                onClick={() => handleOptionClick("Log Follow-Up", index)}
              >
                Log Follow-Up
              </MenuItem>
            </Menu>
          </div>
        </td>

        <td
          className="py-4 px-4 text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            className="form-checkbox h-4 w-4 text-blue-600 cursor-pointer"
            checked={isSelected}
            onChange={() => toggleRow(index)}
          />
        </td>

        <td className="py-4 px-4">{item.subject}</td>
        <td className="py-4 px-4">{item.description}</td>
        <td className="py-4 px-4">{item.folder}</td>
        <td className="py-4 px-4">{item.lastAccessedDate}</td>
        <td className="py-4 px-4">{item.CreatedBy}</td>
      </tr>
    );
  };

  const updatedColumns = [
    { header: "", accessor: "actions", className: "py-2 px-2 w-10" },
    {
      header: (
        <input
          type="checkbox"
          className="form-checkbox h-4 w-4 text-blue-600 cursor-pointer"
          onChange={toggleAll}
          checked={selectedRows.length === ReportsData.length}
        />
      ),
      accessor: "select",
      className: "py-2 px-4 w-10 text-center",
    },
    { header: "Subject", accessor: "subject", className: "py-2 px-4" },
    { header: "Description", accessor: "description", className: "py-2 px-4" },
    { header: "Folder", accessor: "folder", className: "py-2 px-4" },
    { header: "Last Accessed Date", accessor: "lastAccessedDate", className: "py-2 px-4" },
    { header: "Created By", accessor: "createdBy", className: "py-2 px-4" },
  
  ];

  return (
    <>
      <ReportsNavbar />
      <div className="h-full overflow-y-auto px-4 py-4 rounded-xl custom-scrollbar space-y-6">
        <div className="overflow-auto max-h-full shadow bg-white rounded-lg border border-gray-200">
          <SelectedHeaderData
            total={ReportsData.length}
            selected={selectedRows.length}
          />
          <Table
            columns={updatedColumns}
            data={ReportsData}
            renderRow={renderRow}
          />
        </div>
      </div>
    </>
  );
};

export default ReportsPage;

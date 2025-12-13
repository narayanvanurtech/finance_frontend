"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FilterList, Add, MoreVert } from "@mui/icons-material";
import { Menu, MenuItem, IconButton } from "@mui/material";
import ConfirmationDialog from "@/components/sales-crm/ConfirmationDialog";

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T, index: number) => React.ReactNode;
  sortable?: boolean;
}

interface FilterOption {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  error?: string | null;

  title: string;
  subtitle?: string;
  createButtonText: string;

  selectedItems: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  getItemId: (item: T) => string;

  onCreateClick: () => void;
  onEditClick?: (item: T) => void;
  onViewClick?: (item: T) => void;
  onDeleteClick?: (item: T) => void;
  onBulkDelete?: (selectedIds: string[]) => Promise<void>;
  onRefresh?: () => void;

  filters?: FilterOption[];
  onFilterChange?: (filters: Record<string, string>) => void;

  bulkActions?: {
    label: string;
    action: (selectedIds: string[]) => void;
    requiresSelection?: boolean;
  }[];

  emptyStateMessage?: string;
  renderCustomActions?: (item: T) => React.ReactNode;

  onRowClick?: (item: T) => void; // ⭐ NEWLY ADDED PROP
}

// -------------- ROW ACTION DROPDOWN --------------
function RowActionsDropdown<T>({
  item,
  onViewClick,
  onEditClick,
  onDeleteClick,
}: {
  item: T;
  onViewClick?: (item: T) => void;
  onEditClick?: (item: T) => void;
  onDeleteClick?: (item: T) => void;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  return (
    <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
      <IconButton
        onClick={(e) => {
          e.stopPropagation();
          setAnchorEl(e.currentTarget);
        }}
        size="small"
        className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        style={{ padding: "4px" }}
      >
        <MoreVert fontSize="small" />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          style: {
            minWidth: 120,
            boxShadow:
              "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
            border: "1px solid #e5e7eb",
          },
        }}
      >
        {onViewClick && (
          <MenuItem
            onClick={() => {
              onViewClick(item);
              setAnchorEl(null);
            }}
          >
            View
          </MenuItem>
        )}

        {onEditClick && (
          <MenuItem
            onClick={() => {
              onEditClick(item);
              setAnchorEl(null);
            }}
          >
            Edit
          </MenuItem>
        )}

        {onDeleteClick && (
          <MenuItem
            onClick={() => {
              onDeleteClick(item);
              setAnchorEl(null);
            }}
            className="text-red-600"
          >
            Delete
          </MenuItem>
        )}
      </Menu>
    </div>
  );
}

// ------------------- MAIN DATATABLE -------------------
export default function DataTable<T>(props: DataTableProps<T>) {
  const {
    data,
    columns,
    loading = false,
    error = null,
    title,
    subtitle,
    createButtonText,
    selectedItems,
    onSelectionChange,
    getItemId,
    onCreateClick,
    onEditClick,
    onViewClick,
    onDeleteClick,
    onBulkDelete,
    onRefresh,
    filters = [],
    onFilterChange,
    bulkActions = [],
    emptyStateMessage,
    renderCustomActions,
    onRowClick, // ⭐ NEW CLICK HANDLER
  } = props;

  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  const toggleAll = () => {
    if (selectedItems.length === data.length) onSelectionChange([]);
    else onSelectionChange(data.map(getItemId));
  };

  const toggleItem = (item: T) => {
    const id = getItemId(item);
    if (selectedItems.includes(id)) {
      onSelectionChange(selectedItems.filter((i) => i !== id));
    } else {
      onSelectionChange([...selectedItems, id]);
    }
  };

  return (
    <div className="w-full">
      {/* Table */}
      <div className="overflow-x-auto rounded-lg shadow-lg border mt-6">
        <table className="min-w-full divide-y text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 w-10">
                <input
                  type="checkbox"
                  checked={selectedItems.length === data.length}
                  onChange={toggleAll}
                />
              </th>

              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3 text-left text-xs">
                  {column.header}
                </th>
              ))}

              <th className="px-4 py-3 text-left text-xs">Actions</th>
            </tr>
          </thead>

          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 2} className="py-6 text-center">
                  {emptyStateMessage || "No data found"}
                </td>
              </tr>
            ) : (
              data.map((item, idx) => {
                const id = getItemId(item);
                const isSelected = selectedItems.includes(id);

                return (
                  <tr
                    key={id}
                    className={`border-b cursor-pointer ${
                      isSelected ? "bg-blue-50" : ""
                    } hover:bg-gray-100`}
                    onClick={() => onRowClick && onRowClick(item)} // ⭐ ROW CLICK
                  >
                    {/* Checkbox */}
                    <td
                      className="px-6 py-4"
                      onClick={(e) => e.stopPropagation()} // ❗ STOP ROW CLICK
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleItem(item)}
                      />
                    </td>

                    {/* Columns */}
                    {columns.map((column) => (
                      <td key={column.key} className="px-4 py-4">
                        {column.render
                          ? column.render(item, idx)
                          : (item as any)[column.key] || "-"}
                      </td>
                    ))}

                    {/* Actions */}
                    <td
                      className="px-4 py-4 text-right"
                      onClick={(e) => e.stopPropagation()} // ❗ STOP ROW CLICK
                    >
                      {renderCustomActions ? (
                        renderCustomActions(item)
                      ) : (
                        <RowActionsDropdown
                          item={item}
                          onViewClick={onViewClick}
                          onEditClick={onEditClick}
                          onDeleteClick={onDeleteClick}
                        />
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

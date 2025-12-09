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
  // Data
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  error?: string | null;
  
  // Header config
  title: string;
  subtitle?: string;
  createButtonText: string;
  
  // Selection
  selectedItems: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  getItemId: (item: T) => string;
  
  // Actions
  onCreateClick: () => void;
  onEditClick?: (item: T) => void;
  onViewClick?: (item: T) => void;
  onDeleteClick?: (item: T) => void;
  onBulkDelete?: (selectedIds: string[]) => Promise<void>;
  onRefresh?: () => void;
  
  // Filtering
  filters?: FilterOption[];
  onFilterChange?: (filters: Record<string, string>) => void;
  
  // Bulk actions
  bulkActions?: {
    label: string;
    action: (selectedIds: string[]) => void;
    requiresSelection?: boolean;
  }[];
  
  // Custom rendering
  emptyStateMessage?: string;
  renderCustomActions?: (item: T) => React.ReactNode;
}

// Row Actions Dropdown Component
interface RowActionsDropdownProps<T> {
  item: T;
  onViewClick?: (item: T) => void;
  onEditClick?: (item: T) => void;
  onDeleteClick?: (item: T) => void;
}

function RowActionsDropdown<T>({
  item,
  onViewClick,
  onEditClick,
  onDeleteClick,
}: RowActionsDropdownProps<T>) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Don't render if no actions are available
  if (!onViewClick && !onEditClick && !onDeleteClick) {
    return null;
  }

  return (
    <div className="flex justify-end">
      <IconButton
        onClick={handleClick}
        size="small"
        className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        style={{ padding: '4px' }}
      >
        <MoreVert fontSize="small" />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
            minWidth: 120,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid #e5e7eb',
          },
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {onViewClick && (
          <MenuItem
            onClick={() => {
              onViewClick(item);
              handleClose();
            }}
            className="text-sm text-gray-700 hover:bg-gray-50"
          >
            View
          </MenuItem>
        )}
        {onEditClick && (
          <MenuItem
            onClick={() => {
              onEditClick(item);
              handleClose();
            }}
            className="text-sm text-gray-700 hover:bg-gray-50"
          >
            Edit
          </MenuItem>
        )}
        {onDeleteClick && (
          <MenuItem
            onClick={() => {
              onDeleteClick(item);
              handleClose();
            }}
            className="text-sm text-red-600 hover:bg-red-50"
          >
            Delete
          </MenuItem>
        )}
      </Menu>
    </div>
  );
}

export default function DataTable<T>({
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
}: DataTableProps<T>) {
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [appliedFilters, setAppliedFilters] = useState<Record<string, string>>({});
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [bulkActionAnchorEl, setBulkActionAnchorEl] = useState<null | HTMLElement>(null);
  const [successMessage, setSuccessMessage] = useState({
    title: "",
    message: "",
    type: "success" as "success" | "danger" | "warning" | "info",
  });

  // Selection handlers
  const toggleAll = () => {
    if (selectedItems.length === data.length) {
      onSelectionChange([]);
    } else {
      const allIds = data.map(getItemId);
      onSelectionChange(allIds);
    }
  };

  const toggleItem = (item: T) => {
    const itemId = getItemId(item);
    const newSelection = selectedItems.includes(itemId)
      ? selectedItems.filter(id => id !== itemId)
      : [...selectedItems, itemId];
    onSelectionChange(newSelection);
  };

  // Filter handlers
  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filterValues, [key]: value };
    setFilterValues(newFilters);
  };

  const applyFilters = () => {
    setAppliedFilters(filterValues);
    onFilterChange?.(filterValues);
  };

  const clearFilters = () => {
    setFilterValues({});
    setAppliedFilters({});
    onFilterChange?.({});
  };

  // Bulk action handlers
  const handleBulkActionClick = (event: React.MouseEvent<HTMLElement>) => {
    setBulkActionAnchorEl(event.currentTarget);
  };

  const handleBulkActionClose = () => {
    setBulkActionAnchorEl(null);
  };

  // Bulk delete handler
  const handleBulkDeleteConfirm = async () => {
    if (!onBulkDelete || selectedItems.length === 0 || isBulkDeleting) return;

    setIsBulkDeleting(true);
    try {
      await onBulkDelete(selectedItems);
      setShowBulkDeleteModal(false);
      onSelectionChange([]);
      
      setSuccessMessage({
        title: "Success",
        message: `Successfully deleted ${selectedItems.length} item(s).`,
        type: "success",
      });
      setShowSuccessDialog(true);

      setTimeout(() => {
        setShowSuccessDialog(false);
      }, 3000);
    } catch (error) {
      setSuccessMessage({
        title: "Error",
        message: error instanceof Error ? error.message : "Failed to delete items",
        type: "danger",
      });
      setShowSuccessDialog(true);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div
        className="max-w-[98vw] w-full mx-auto rounded-md shadow-sm p-4 sm:p-6 md:p-8"
        style={{ background: "var(--color-card)" }}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className="max-w-[98vw] w-full mx-auto rounded-md shadow-sm p-4 sm:p-6 md:p-8"
        style={{ background: "var(--color-card)" }}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-500 mb-4">Error: {error}</p>
            {onRefresh && (
              <Button onClick={onRefresh}>
                Retry
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="w-full bg-white">
        <div className="px-6 py-4">
          {/* Title Row */}
          <div className="flex flex-col gap-1 lg:flex-row lg:items-center lg:justify-between">
            {/* Left: Title and Subtitle */}
            <div className="flex-1 min-w-0 flex flex-col">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-gray-900 truncate">
                  {title}
                </h1>
                {/* Filter Button */}
                {filters.length > 0 && (
                  <button
                    onClick={() => setIsFilterActive(!isFilterActive)}
                    className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm ml-4 ${
                      isFilterActive
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                    }`}
                    style={{ minWidth: 90 }}
                  >
                    <FilterList fontSize="small" />
                    <span>Filter</span>
                  </button>
                )}
              </div>
              {subtitle && (
                <p className="text-sm text-gray-600 truncate mt-1">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          
          {/* Controls Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 flex-shrink-0 mt-4">
            {/* Left: Info */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="text-sm text-gray-500">
                {data?.length || 0} items found
              </div>
              {selectedItems.length > 0 && (
                <div className="text-sm text-indigo-600">
                  {selectedItems.length} selected
                </div>
              )}
            </div>
            
            {/* Right: Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              {onRefresh && (
                <Button
                  onClick={onRefresh}
                  variant="outline"
                  size="sm"
                >
                  Refresh
                </Button>
              )}
              
              {/* Bulk Actions */}
              {selectedItems.length > 0 && (
                <div className="flex gap-2">
                  <Button
                    onClick={handleBulkActionClick}
                    variant="outline"
                    size="sm"
                    className="font-medium"
                  >
                    Bulk Actions
                  </Button>
                  <Menu
                    anchorEl={bulkActionAnchorEl}
                    open={Boolean(bulkActionAnchorEl)}
                    onClose={handleBulkActionClose}
                    PaperProps={{
                      style: {
                        minWidth: 160,
                      },
                    }}
                  >
                    {bulkActions.map((action, index) => (
                      <MenuItem
                        key={index}
                        onClick={() => {
                          if (action.requiresSelection !== false && selectedItems.length === 0) return;
                          action.action(selectedItems);
                          handleBulkActionClose();
                        }}
                        disabled={action.requiresSelection !== false && selectedItems.length === 0}
                      >
                        {action.label}
                      </MenuItem>
                    ))}
                    {onBulkDelete && (
                      <MenuItem
                        onClick={() => {
                          setShowBulkDeleteModal(true);
                          handleBulkActionClose();
                        }}
                        className="text-red-600"
                      >
                        Delete Selected
                      </MenuItem>
                    )}
                  </Menu>
                </div>
              )}
              
              <Button
                onClick={onCreateClick}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                size="sm"
              >
                <Add className="w-4 h-4 mr-1" />
                {createButtonText}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="max-w-[98vw] w-full mx-auto px-4 sm:px-6"
        style={{
          background: "var(--color-card)",
          color: "var(--color-card-foreground)",
        }}
      >
        {/* Filter Section */}
        {isFilterActive && filters.length > 0 && (
          <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filters.map((filter) => (
                <div key={filter.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {filter.label}
                  </label>
                  <select
                    value={filterValues[filter.key] || ""}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {filter.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                onClick={applyFilters}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                size="sm"
              >
                Apply Filters
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto rounded-lg shadow-lg border border-[var(--color-border)] mt-6">
          <table
            className="min-w-full divide-y rounded-lg overflow-hidden text-sm"
            style={{ borderColor: "var(--color-border)" }}
          >
            <thead
              className="sticky top-0 z-10"
              style={{ background: "var(--color-muted)" }}
            >
              <tr>
                <th scope="col" className="relative px-6 py-3 w-10">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                    checked={selectedItems.length === data.length && data.length > 0}
                    onChange={toggleAll}
                  />
                </th>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="px-4 py-4 text-left text-[10px] font-medium uppercase tracking-wider text-[var(--color-muted-foreground)]"
                  >
                    {column.header}
                  </th>
                ))}
                <th className="px-4 py-4 text-left text-[10px] font-medium uppercase tracking-wider rounded-tr-lg text-[var(--color-muted-foreground)]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody style={{ background: "var(--color-card)" }}>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 2} className="px-4 py-8 text-center text-gray-500">
                    {emptyStateMessage || "No items found"}
                  </td>
                </tr>
              ) : (
                data.map((item, idx) => {
                  const itemId = getItemId(item);
                  const isSelected = selectedItems.includes(itemId);
                  
                  return (
                    <tr
                      key={itemId}
                      className={`transition-colors border-b border-zinc-300 ${
                        isSelected
                          ? "bg-blue-50 border-blue-200"
                          : "bg-[var(--color-card)]"
                      } hover:bg-[var(--color-muted)]/60 text-sm`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                          checked={isSelected}
                          onChange={() => toggleItem(item)}
                        />
                      </td>

                      {columns.map((column) => (
                        <td key={column.key} className="px-4 py-4 whitespace-nowrap">
                          {column.render ? (
                            column.render(item, idx)
                          ) : (
                            <div className="text-sm text-[var(--color-muted-foreground)]">
                              {(item as any)[column.key] || "-"}
                            </div>
                          )}
                        </td>
                      ))}

                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
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

        {/* Confirmation Dialogs */}
        <ConfirmationDialog
          show={showBulkDeleteModal}
          title="Delete Multiple Items"
          message={`Are you sure you want to delete ${selectedItems.length} item(s)? This action cannot be undone.`}
          onConfirm={handleBulkDeleteConfirm}
          onCancel={() => setShowBulkDeleteModal(false)}
          confirmText={isBulkDeleting ? "Deleting..." : "Delete All"}
          cancelText="Cancel"
          type="danger"
          disableConfirm={isBulkDeleting}
          disableCancel={isBulkDeleting}
        />

        <ConfirmationDialog
          show={showSuccessDialog}
          title={successMessage.title}
          message={successMessage.message}
          onConfirm={() => setShowSuccessDialog(false)}
          onCancel={() => setShowSuccessDialog(false)}
          confirmText="OK"
          type={successMessage.type}
        />
      </div>
    </div>
  );
}

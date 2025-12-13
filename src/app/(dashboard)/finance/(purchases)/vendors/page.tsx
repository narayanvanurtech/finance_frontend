"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useVendorStore } from "@/stores/financeStore/useVendorStore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/ui/DataTable";
import ConfirmationDialog from "@/components/sales-crm/ConfirmationDialog";
import AddVendorModal from "@/components/finance/AddVendorModal";
import { useAuthStore } from "@/stores/salesCrmStore/useAuthStore";
import type { Vendor, CreateVendorPayload } from "@/api/finance/vendorApi";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Edit,
  Trash2,
  MoreHorizontal,
  Search,
  Plus,
  Download,
  Filter,
} from "lucide-react";

export default function VendorsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    vendors,
    loading: isLoading,
    error,
    fetchVendors,
    createVendor,
    updateVendor,
    deleteVendor,
    bulkDeleteVendors,
    clearError,
  } = useVendorStore();

  const [addVendorModalOpen, setAddVendorModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [selectedVendorIds, setSelectedVendorIds] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState<{
    title: string;
    message: string;
  }>({
    title: "",
    message: "",
  });

  // Filtering and search state
  const [searchTerm, setSearchTerm] = useState("");
  const [vendorTypeFilter, setVendorTypeFilter] = useState("all");
  const [industryFilter, setIndustryFilter] = useState("all");

  // Debounced fetch function
  const fetchVendorsWithFilters = useCallback(() => {
    if (!user?.companyId) return;

    const filters: any = {};

    // Add search term if present
    if (searchTerm.trim()) {
      filters.search = searchTerm.trim();
    }

    // Add vendor type filter if selected
    if (vendorTypeFilter !== "all") {
      filters.vendorType = vendorTypeFilter;
    }

    // Add industry filter if selected
    if (industryFilter !== "all") {
      filters.industry = industryFilter;
    }

    // Fetch with filters
    fetchVendors(filters);
  }, [
    user?.companyId,
    searchTerm,
    vendorTypeFilter,
    industryFilter,
    fetchVendors,
  ]);

  // Fetch vendors with debouncing for search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchVendorsWithFilters();
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [fetchVendorsWithFilters]);

  const handleEditVendor = (vendor: Vendor) => {
    // Navigate to edit page instead of opening modal
    router.push(`/finance/vendors/edit/${vendor._id}`);
  };

  const handleDeleteVendor = (vendor: Vendor) => {
    setVendorToDelete({
      id: vendor._id,
      name: vendor.name,
    });
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!vendorToDelete || isDeleting) return;

    setIsDeleting(true);
    try {
      await deleteVendor(vendorToDelete.id);
      setShowDeleteModal(false);
      setVendorToDelete(null);
      setSuccessMessage({
        title: "Success",
        message: `Vendor "${vendorToDelete.name}" has been successfully deleted.`,
      });
      setShowSuccessDialog(true);

      setTimeout(() => {
        setShowSuccessDialog(false);
      }, 3000);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete vendor";
      console.error("Error deleting vendor:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateVendor = () => {
    setEditingVendor(null);
    router.push("/finance/vendors/create");
  };

  const handleBulkDelete = async (selectedIds: string[]) => {
    await bulkDeleteVendors(selectedIds);
  };

  const handleRefresh = () => {
    fetchVendors();
  };

  // Custom render for action buttons
  const renderVendorActions = (vendor: Vendor) => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500"
            aria-label="Vendor actions"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>

          <DropdownMenuItem onClick={() => handleEditVendor(vendor)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="text-red-600"
            onClick={() => handleDeleteVendor(vendor)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  // Define table columns
  const columns = [
    {
      key: "name",
      header: "Name",
      render: (vendor: Vendor) => (
        <div className="text-sm font-medium text-[var(--color-card-foreground)]">
          {vendor?.name || "-"}
        </div>
      ),
    },
    {
      key: "displayName",
      header: "Display Name",
      render: (vendor: Vendor) => (
        <div className="text-sm text-[var(--color-muted-foreground)]">
          {vendor?.displayName || "-"}
        </div>
      ),
    },
    {
      key: "gstin",
      header: "GSTIN",
      render: (vendor: Vendor) => (
        <div className="text-sm text-[var(--color-muted-foreground)]">
          {vendor?.gstin || "-"}
        </div>
      ),
    },
    {
      key: "address",
      header: "Address",
      render: (vendor: Vendor) => (
        <div className="text-sm text-[var(--color-muted-foreground)]">
          {vendor?.address
            ? `${vendor.address.city || ""}, ${vendor.address.state || ""}, ${
                vendor.address.country || ""
              }`.replace(/^[, ]+|[, ]+$/g, "") || "-"
            : "-"}
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      render: (vendor: Vendor) => (
        <div className="text-sm text-[var(--color-muted-foreground)]">
          {vendor?.phone || vendor?.contact || "-"}
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (vendor: Vendor) => (
        <div className="text-sm text-[var(--color-muted-foreground)]">
          {vendor?.email || "-"}
        </div>
      ),
    },
  ];

  // Define bulk actions
  const bulkActions = [
    {
      label: "Export Selected",
      action: (selectedIds: string[]) => {
        console.log("Exporting vendors:", selectedIds);
        // Implement export functionality
      },
    },
    {
      label: "Archive Selected",
      action: (selectedIds: string[]) => {
        console.log("Archiving vendors:", selectedIds);
        // Implement archive functionality
      },
    },
    {
      label: "Send Email",
      action: (selectedIds: string[]) => {
        console.log("Sending email to vendors:", selectedIds);
        // Implement email functionality
      },
    },
  ];

  return (
    <>
      {/* Header Section */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Page Title and Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Vendor Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your vendor database and relationships
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 rounded-lg transition border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 shadow-sm flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </button>
            <button
              onClick={handleCreateVendor}
              className="px-4 py-2 rounded-lg transition bg-blue-600 text-white hover:bg-blue-700 shadow-sm flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Vendor
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                placeholder="Search vendors by name, email, GSTIN, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              />
            </div>
            <select
              value={vendorTypeFilter}
              onChange={(e) => setVendorTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-[160px]"
            >
              <option value="all">All Types</option>
              <option value="Company">Company</option>
              <option value="Individual">Individual</option>
            </select>
            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-[180px]"
            >
              <option value="all">All Industries</option>
              <option value="IT">IT</option>
              <option value="Finance">Finance</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Retail">Retail</option>
              <option value="Healthcare">Healthcare</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <DataTable
          data={vendors}
          columns={columns}
          loading={isLoading}
          error={error}
          title=""
          subtitle=""
          createButtonText=""
          selectedItems={selectedVendorIds}
          onSelectionChange={setSelectedVendorIds}
          getItemId={(vendor) => vendor?._id}
          onCreateClick={() => {}}
          onRowClick={(vendor) =>
            router.push(`/finance/vendors/edit/${vendor._id}`)
          }
          renderCustomActions={renderVendorActions}
          onBulkDelete={handleBulkDelete}
          bulkActions={bulkActions}
          emptyStateMessage="No vendors found. Click 'Create Vendor' to add your first vendor."
        />
      </div>

      <AddVendorModal
        open={addVendorModalOpen}
        onOpenChange={(open) => {
          setAddVendorModalOpen(open);
          if (!open) setEditingVendor(null);
        }}
        onSuccess={() => {
          setAddVendorModalOpen(false);
          setEditingVendor(null);
          fetchVendors();
        }}
      />

      <ConfirmationDialog
        show={showDeleteModal}
        title="Delete Vendor"
        message={`Are you sure you want to delete "${vendorToDelete?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteModal(false);
          setVendorToDelete(null);
        }}
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        type="danger"
        disableConfirm={isDeleting}
        disableCancel={isDeleting}
      />

      <ConfirmationDialog
        show={showSuccessDialog}
        title={successMessage.title}
        message={successMessage.message}
        onConfirm={() => setShowSuccessDialog(false)}
        onCancel={() => setShowSuccessDialog(false)}
        confirmText="OK"
        type="success"
      />
    </>
  );
}

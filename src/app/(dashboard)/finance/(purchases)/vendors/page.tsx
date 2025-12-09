"use client";
import React, { useState, useEffect } from "react";
import { useVendorStore } from "@/stores/financeStore/useVendorStore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/ui/DataTable";
import ConfirmationDialog from "@/components/sales-crm/ConfirmationDialog";
import AddVendorModal from "@/components/finance/AddVendorModal";
import { useAuthStore } from "@/stores/salesCrmStore/useAuthStore";
import type { Vendor, CreateVendorPayload } from "@/api/finance/vendorApi";

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

  // Filtering state
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  useEffect(() => {
    // Apply filters whenever vendors or activeFilters change
    let filtered = vendors;
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter((vendor) => {
          if (key === "industry" || key === "vendorType" || key === "taxTreatment") {
            return (vendor as any)[key] === value;
          }
          return true;
        });
      }
    });
    setFilteredVendors(filtered);
  }, [vendors, activeFilters]);

  const handleFilterChange = (filters: Record<string, string>) => {
    setActiveFilters(filters);
  };

  useEffect(() => {
    if (user?.companyId) {
      fetchVendors();
    }
  }, [user?.companyId, fetchVendors]);

  // Handlers
  const handleViewVendor = (vendor: Vendor) => {
    router.push(`/finance/vendors/view/${vendor._id}`);
  };

  const handleEditVendor = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setAddVendorModalOpen(true);
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
          {vendor?.address ? 
            `${vendor.address.city || ""}, ${vendor.address.state || ""}, ${vendor.address.country || ""}`.replace(/^[, ]+|[, ]+$/g, '') || "-"
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

  // Define filters
  const filters = [
    {
      key: "vendorType",
      label: "Vendor Type",
      options: [
        { value: "", label: "All Types" },
        { value: "Company", label: "Company" },
        { value: "Individual", label: "Individual" },
      ],
    },
    {
      key: "industry",
      label: "Industry",
      options: [
        { value: "", label: "All Industries" },
        { value: "IT", label: "IT" },
        { value: "Finance", label: "Finance" },
        { value: "Manufacturing", label: "Manufacturing" },
        { value: "Retail", label: "Retail" },
        { value: "Healthcare", label: "Healthcare" },
      ],
    },
    {
      key: "taxTreatment",
      label: "Tax Treatment",
      options: [
        { value: "", label: "All Treatments" },
        { value: "Registered Business", label: "Registered Business" },
        { value: "Unregistered Business", label: "Unregistered Business" },
        { value: "Consumer", label: "Consumer" },
        { value: "Overseas", label: "Overseas" },
      ],
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
      <DataTable
        data={filteredVendors}
        columns={columns}
        loading={isLoading}
        error={error}
        title="Vendor Management"
        subtitle="Manage your vendor database and relationships"
        createButtonText="Create Vendor"
        selectedItems={selectedVendorIds}
        onSelectionChange={setSelectedVendorIds}
        getItemId={(vendor) => vendor._id}
        onCreateClick={handleCreateVendor}
        onEditClick={handleEditVendor}
        onViewClick={handleViewVendor}
        onDeleteClick={handleDeleteVendor}
        onBulkDelete={handleBulkDelete}
        onRefresh={handleRefresh}
        filters={filters}
        onFilterChange={handleFilterChange}
        bulkActions={bulkActions}
        emptyStateMessage="No vendors found. Click 'Create Vendor' to add your first vendor."
      />

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

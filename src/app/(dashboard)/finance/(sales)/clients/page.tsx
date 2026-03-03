"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AddClientModal, {
  AddClientForm,
} from "@/components/finance/AddClientModal";
import { useClientStore, Client } from "@/stores/financeStore/useClientStore";
import { useAuthStore } from "@/stores/salesCrmStore/useAuthStore";
import { MoreHorizontal, Trash2, Edit, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { CreateClientPayload, ClientFilters } from "@/api/finance/clientApi";
import FinanceSubNav from "@/components/finance/SubNavbar";
import DeleteClientDialog from "@/components/finance/DeleteClientDialog";
import { FiTrash2, FiSearch, FiFilter, FiX } from "react-icons/fi";
import { getLogoUrl } from "@/lib/utils";
import { toast } from "sonner";

export default function ClientsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    clients,
    isLoading,
    error,
    fetchClients,
    createClient,
    updateClient,
    deleteClient,
    bulkDeleteClients,
  } = useClientStore();

  const [addClientModalOpen, setAddClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    search: "",
    clientType: "",
    industry: "",
    taxTreatment: "",
  });


  console.log("Clients5673890:83765nnbcbvdc :=>=>",clients)

  // Separate state for search input to prevent losing focus
  const [searchInput, setSearchInput] = useState("");
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize searchInput from filters.search on mount
  useEffect(() => {
    setSearchInput(filters.search);
  }, []); // Only run on mount
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    client: Client | null;
    loading: boolean;
  }>({
    open: false,
    client: null,
    loading: false,
  });
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState({
    open: false,
    loading: false,
  });
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState<{
    title: string;
    message: string;
  }>({
    title: "",
    message: "",
  });

  // Convert frontend filters to backend filters format
  const getBackendFilters = (): ClientFilters => {
    const backendFilters: ClientFilters = {};

    // Map search to businessName (only if not empty)
    if (filters.search && filters.search.trim() !== "") {
      backendFilters.businessName = filters.search.trim();
    }

    // Map other filters (only include if they have values)
    if (filters.clientType && filters.clientType !== "") {
      backendFilters.clientType = filters.clientType as "Company" | "Individual";
    }

    if (filters.industry && filters.industry !== "") {
      backendFilters.industry = filters.industry;
    }

    if (filters.taxTreatment && filters.taxTreatment !== "") {
      backendFilters.taxTreatment = filters.taxTreatment as
        | "Registered Business"
        | "Unregistered Business"
        | "Consumer"
        | "Overseas";
    }

    return backendFilters;
  };

  // Debounce search input
  useEffect(() => {
    // Clear existing timeout
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    // Set new timeout to update the filter after user stops typing
    searchDebounceRef.current = setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        search: searchInput,
      }));
    }, 800); // 500ms debounce delay

    // Cleanup on unmount
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [searchInput]);

  // Fetch clients with filters (exclude search from dependencies, use filters.search instead)
  useEffect(() => {
    if (user?.companyId) {
      const backendFilters = getBackendFilters();
      fetchClients(user.companyId, backendFilters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.companyId, filters.search, filters.clientType, filters.industry, filters.taxTreatment]);

  // Clear selections when clients change or become empty
  useEffect(() => {
    if (clients.length === 0 && selectedRows.length > 0) {
      setSelectedRows([]);
      setSelectedClientIds([]);
      return;
    }

    // Filter out invalid indices
    const validSelectedRows = selectedRows.filter(
      (index) => index >= 0 && index < clients.length
    );
    const validSelectedIds = validSelectedRows.map(
      (index) => clients[index]._id
    );

    // Update selections if any were invalid
    if (validSelectedRows.length !== selectedRows.length) {
      setSelectedRows(validSelectedRows);
      setSelectedClientIds(validSelectedIds);
    }
  }, [clients, selectedRows]);

  const handleViewClient = (clientId: string) => {
    router.push(`/finance/clients/${clientId}`);
  };

  const handleEditClientNavigation = (clientId: string,companyId:string) => {
    console.log("CompanyId....6ngfmn",companyId)
    router.push(`/finance/clients/${clientId}/${companyId}/edit`);
  };

  const handleAddClient = async (data: AddClientForm) => {
    if (!user?.companyId) return;

    try {
      // Sanitize blank fields
      const sanitize = (val: any) => (val === "" ? undefined : val);

      // accountDetails: always send as string
      const accountDetails =
        typeof data.accountDetails === "string" ? data.accountDetails : "";

      const clientData: CreateClientPayload = {
        businessName: sanitize(data.businessName),
        companyId: user.companyId,
        email: sanitize(data.email),
        phone: sanitize(data.phone),
        whatsappNo:sanitize(data.whatsappNo),
        industry: sanitize(data.industry),
        clientType: data.clientType as "Company" | "Individual",
        taxTreatment: data.taxTreatment as
          | "Registered Business"
          | "Unregistered Business"
          | "Consumer"
          | "Overseas",
        gstin: sanitize(data.gstin),
        pan: sanitize(data.pan),
        alias: sanitize(data.alias),
        showEmail: !!data.showEmail,
        showPhone: !!data.showPhone,
        phoneSameAsWhatsappNo:!!data.openSameAsWhatsappNo,
        gstType:
          typeof data.gstType === "boolean" ? data.gstType : !!data.gstType,
        address: {
          street: sanitize(data.street),
          city: sanitize(data.addressCity),
          state: sanitize(data.addressState),
          postalCode: sanitize(data.postalCode),
          country: sanitize(data.addressCountry) || "India",
        },
        accountDetails,
      };

      await createClient(clientData);
      setAddClientModalOpen(false);
    } catch (error: any) {
      if (
        error?.message?.includes(
          "Client with this email or phone already exists"
        ) ||
        error?.response?.data?.message?.includes(
          "Client with this email or phone already exists"
        )
      ) {
        if (typeof window !== "undefined") {
          // @ts-ignore
          import("sonner").then(({ toast }) => {
            toast.error("Client with this email or phone already exists");
          });
        }
      }
      console.error("Error creating client:", error);
    }
  };

  const handleEditClient = async (data: AddClientForm) => {
    if (!editingClient || !user?.companyId) return;

    try {
      const clientData: CreateClientPayload = {
        businessName: data.businessName,
        companyId: user.companyId,
        email: data.email,
        phone: data.phone,
        whatsappNo:data.whatsappNo,
        industry: data.industry,
        clientType: data.clientType as "Company" | "Individual",
        taxTreatment: data.taxTreatment as
          | "Registered Business"
          | "Unregistered Business"
          | "Consumer"
          | "Overseas",
        gstin: data.gstin,
        pan: data.pan,
        alias: data.alias,
        showEmail: data.showEmail || false,
        showPhone: data.showPhone || false,
        openSameAsWhatsappNo : data.openSameAsWhatsappNo || false,
        gstType: data.gstType || false,
        address: {
          street: data.street,
          city: data.addressCity,
          state: data.addressState,
          postalCode: data.postalCode,
          country: data.addressCountry || "India",
        },
        accountDetails: data.accountDetails,
      };

      await updateClient(user.companyId, editingClient._id, clientData);
      setEditingClient(null);
      setAddClientModalOpen(false);
    } catch (error) {
      console.error("Error updating client:", error);
    }
  };

  const handleDeleteClient = (client: Client) => {
   
    setDeleteDialog({
      open: true,
      client,
      loading: false,
    });
  };

  console.log("DeleteDialog",deleteDialog)
  const handleDeleteConfirm = async () => {
    if (!deleteDialog.client || !user?.companyId) return;




    setDeleteDialog((prev) => ({ ...prev, loading: true }));
    try {
      await deleteClient(deleteDialog?.client?.companyId?._id, deleteDialog.client._id);
      setDeleteDialog({ open: false, client: null, loading: false });
      setSuccessMessage({
        title: "Success",
        message: `Client "${deleteDialog.client.businessName}" has been successfully deleted.`,
      });

      toast.success("Client Deleted Successfully !")
      setShowSuccessDialog(true);

      // Auto hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccessDialog(false);
        setSuccessMessage({ title: "", message: "" });
      }, 3000);
    } catch (error) {
      console.error("Error deleting client:", error);
      setDeleteDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, client: null, loading: false });
    setDeleteError(null);
  };

  // Multiple selection handlers
  const toggleAll = () => {
    if (
      selectedRows.length === clients.length &&
      clients.length > 0
    ) {
      // Deselect all
      setSelectedRows([]);
      setSelectedClientIds([]);
    } else {
      // Select all clients
      const allRows = clients.map((_, index) => index);
      const allIds = clients.map((client) => client._id);
      setSelectedRows(allRows);
      setSelectedClientIds(allIds);
    }
  };

  const toggleRow = (index: number) => {
    const client = clients[index];
    const clientId = client._id;

    setSelectedRows((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      } else {
        return [...prev, index];
      }
    });

    setSelectedClientIds((prev) => {
      if (prev.includes(clientId)) {
        return prev.filter((id) => id !== clientId);
      } else {
        return [...prev, clientId];
      }
    });
  };

  // Bulk delete handlers
  const handleBulkDelete = () => {
    if (selectedClientIds.length === 0) return;
    setBulkDeleteDialog({ open: true, loading: false });
  };

  const handleBulkDeleteConfirm = async () => {
    if (!user?.companyId || selectedClientIds.length === 0) return;

    setBulkDeleteDialog((prev) => ({ ...prev, loading: true }));
    setDeleteError(null);

    try {
      await bulkDeleteClients(user.companyId, selectedClientIds);
      setBulkDeleteDialog({ open: false, loading: false });
      setSelectedRows([]);
      setSelectedClientIds([]);

      setSuccessMessage({
        title: "Success",
        message: `Successfully deleted ${selectedClientIds.length} client(s).`,
      });
      setShowSuccessDialog(true);

      // Auto hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccessDialog(false);
        setSuccessMessage({ title: "", message: "" });
      }, 3000);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete clients";
      setDeleteError(errorMessage);
      console.error("Error deleting clients:", error);
      setBulkDeleteDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleBulkDeleteCancel = () => {
    setBulkDeleteDialog({ open: false, loading: false });
    setDeleteError(null);
  };

  // Filter handlers
  const handleFilterChange = (key: string, value: string) => {
    if (key === "search") {
      // For search, update the input value directly (debouncing is handled in useEffect)
      setSearchInput(value);
    } else {
      // For other filters, update immediately
      setFilters((prev) => ({
        ...prev,
        [key]: value,
      }));
    }
  };

  // Handle search input change (immediate update for UI responsiveness)
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };

  const handleApplyFilters = () => {
    // Filters are applied automatically via useEffect
    // This function can be used for any additional logic if needed
    if (user?.companyId) {
      const backendFilters = getBackendFilters();
      fetchClients(user.companyId, backendFilters);
    }
  };

  const handleClearFilters = () => {
    setSearchInput(""); // Clear search input
    setFilters({
      search: "",
      clientType: "",
      industry: "",
      taxTreatment: "",
    });
    setIsFilterExpanded(false);
    // Clear debounce timeout
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
  };

  const hasActiveFilters = () => {
    return (
      (searchInput && searchInput.trim() !== "") ||
      filters.clientType ||
      filters.industry ||
      filters.taxTreatment
    );
  };

  const activeFilterCount = () => {
    let count = 0;
    if (searchInput && searchInput.trim() !== "") count++;
    if (filters.clientType) count++;
    if (filters.industry) count++;
    if (filters.taxTreatment) count++;
    return count;
  };

  if (isLoading) {
    return (
      <div
        className="max-w-[98vw] w-full mx-auto rounded-md shadow-sm p-4 sm:p-6 md:p-8"
        style={{ background: "var(--color-card)" }}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading clients...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="max-w-[98vw] w-full mx-auto rounded-md shadow-sm p-4 sm:p-6 md:p-8"
        style={{ background: "var(--color-card)" }}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-500 mb-4">Error: {error}</p>
            <Button
              onClick={() => user?.companyId && fetchClients(user.companyId)}
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  console.log("Clients...4567",clients)

  return (
    <div className="w-full">
      {/* SubNavbar */}
      <FinanceSubNav
        activeTab="clients"
        selectedItems={selectedClientIds}
        onClearSelection={() => {
          setSelectedRows([]);
          setSelectedClientIds([]);
        }}
      />

      <div
        className="max-w-[98vw] w-full mx-auto px-4 sm:px-6"
        style={{
          background: "var(--color-card)",
          color: "var(--color-card-foreground)",
        }}
      >
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Filter Section */}
        <Card className="p-4 mb-6">
          {/* Main Search Bar */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search clients by name, email, phone, or GSTIN..."
                  className="pl-10"
                  value={searchInput}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      // Clear debounce and apply immediately
                      if (searchDebounceRef.current) {
                        clearTimeout(searchDebounceRef.current);
                      }
                      setFilters((prev) => ({
                        ...prev,
                        search: searchInput,
                      }));
                      handleApplyFilters();
                    }
                  }}
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                className="flex items-center space-x-2"
              >
                <FiFilter className="w-4 h-4" />
                <span>Filters</span>
                {hasActiveFilters() && activeFilterCount() > 0 && (
                  <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    {activeFilterCount()}
                  </span>
                )}
              </Button>
              {hasActiveFilters() && (
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  className="flex items-center space-x-2"
                >
                  <FiX className="w-4 h-4" />
                  <span>Clear</span>
                </Button>
              )}
              <Button
                onClick={handleApplyFilters}
                disabled={isLoading}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <FiSearch className="w-4 h-4" />
                <span>Apply Filters</span>
              </Button>
            </div>

            {/* Expanded Filters */}
            {isFilterExpanded && (
              <div className="pt-4 border-t">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client Type
                    </label>
                    <Select
                      value={filters.clientType || "all"}
                      onValueChange={(value) =>
                        handleFilterChange(
                          "clientType",
                          value === "all" ? "" : value
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="Company">Company</SelectItem>
                        <SelectItem value="Individual">Individual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Industry
                    </label>
                    <Select
                      value={filters.industry || "all"}
                      onValueChange={(value) =>
                        handleFilterChange(
                          "industry",
                          value === "all" ? "" : value
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Industries" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Industries</SelectItem>
                        <SelectItem value="IT">IT</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Manufacturing">
                          Manufacturing
                        </SelectItem>
                        <SelectItem value="Retail">Retail</SelectItem>
                        <SelectItem value="Healthcare">Healthcare</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tax Treatment
                    </label>
                    <Select
                      value={filters.taxTreatment || "all"}
                      onValueChange={(value) =>
                        handleFilterChange(
                          "taxTreatment",
                          value === "all" ? "" : value
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Treatments" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Treatments</SelectItem>
                        <SelectItem value="Registered Business">
                          Registered Business
                        </SelectItem>
                        <SelectItem value="Unregistered Business">
                          Unregistered Business
                        </SelectItem>
                        <SelectItem value="Consumer">Consumer</SelectItem>
                        <SelectItem value="Overseas">Overseas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Apply Filters Button for Expanded Section */}
                <div className="flex justify-end space-x-2 pt-4 border-t mt-4">
                  <Button
                    variant="outline"
                    onClick={handleClearFilters}
                    className="flex items-center space-x-2"
                  >
                    <FiX className="w-4 h-4" />
                    <span>Clear All</span>
                  </Button>
                  <Button
                    onClick={handleApplyFilters}
                    disabled={isLoading}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <FiSearch className="w-4 h-4" />
                    <span>Apply Filters</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        <div className="overflow-x-auto rounded-lg shadow-lg border border-[var(--color-border)] mt-6">
          <table
            className="min-w-full divide-y rounded-lg overflow-hidden text-sm border-collapse"
            style={{ borderColor: "var(--color-border)" }}
          >
            <thead
              className="sticky top-0 z-10"
              style={{ background: "var(--color-muted)" }}
            >
              <tr>
                <th className="px-4 py-4 text-left text-[10px] font-medium uppercase tracking-wider text-[var(--color-muted-foreground)] w-10">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                    checked={
                      selectedRows.length === clients.length &&
                      clients.length > 0
                    }
                    onChange={toggleAll}
                  />
                </th>

                <th className="px-4 py-4 text-left text-[10px] font-medium uppercase tracking-wider text-[var(--color-muted-foreground)]">
                  Logo
                </th>

                <th className="px-4 py-4 text-left text-[10px] font-medium uppercase tracking-wider text-[var(--color-muted-foreground)]">
                  Business Name
                </th>

                <th className="px-4 py-4 text-left text-[10px] font-medium uppercase tracking-wider text-[var(--color-muted-foreground)]">
                  GSTIN
                </th>

                <th className="px-4 py-4 text-left text-[10px] font-medium uppercase tracking-wider text-[var(--color-muted-foreground)]">
                  Address
                </th>

                <th className="px-4 py-4 text-left text-[10px] font-medium uppercase tracking-wider text-[var(--color-muted-foreground)]">
                  Contact
                </th>

                <th className="px-4 py-4 text-left text-[10px] font-medium uppercase tracking-wider text-[var(--color-muted-foreground)]">
                  Email
                </th>

                <th className="px-4 py-4 text-left text-[10px] font-medium uppercase tracking-wider text-[var(--color-muted-foreground)] rounded-tr-lg">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody style={{ background: "var(--color-card)" }}>
              {clients?.map((client, idx) => (
                <tr
                  key={client?._id}
                  className={`transition-colors border-b border-zinc-300 ${
                    selectedRows.includes(idx)
                      ? "bg-blue-50 border-blue-200"
                      : "bg-[var(--color-card)]"
                  } hover:bg-[var(--color-muted)]/60 text-sm`}
                >
                  {/* Checkbox */}
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                      checked={selectedRows.includes(idx)}
                      onChange={() => toggleRow(idx)}
                    />
                  </td>

                  {/* Logo */}
                  <td
                    className="px-4 py-4 cursor-pointer"
                    onClick={() => handleEditClientNavigation(client._id)}
                  >
                    <div className="flex items-center justify-start">
                      {client?.logoUrl ? (
                        <img
                          src={client.logoUrl || ""}
                          alt={`${client.businessName} logo`}
                          className="w-8 h-8 rounded-full object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                          <span className="text-xs text-gray-500 font-medium">
                            {client?.businessName?.charAt(0)?.toUpperCase() ||
                              "?"}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Business Name */}
                  <td
                    className="px-4 py-4 font-medium text-blue-600 cursor-pointer hover:text-blue-800 hover:underline"
                    onClick={() => handleEditClientNavigation(client._id,client.companyId._id)}
                  >
                    {client?.businessName}
                  </td>

                  {/* GSTIN */}
                  <td
                    className="px-4 py-4 text-[var(--color-muted-foreground)] cursor-pointer"
                    onClick={() => handleEditClientNavigation(client._id,client.companyId._id)}
                  >
                    {client?.gstin || "-"}
                  </td>

                  {/* Address */}
                  <td
                    className="px-4 py-4 text-[var(--color-muted-foreground)] cursor-pointer"
                    onClick={() => handleEditClientNavigation(client._id,client.companyId._id)}
                  >
                    {client?.address
                      ? `${client?.address?.street || ""} ${
                          client?.address?.city || ""
                        } ${client?.address?.state || ""}`.trim() || "-"
                      : "-"}
                  </td>

                  {/* Contact */}
                  <td
                    className="px-4 py-4 text-[var(--color-muted-foreground)] cursor-pointer"
                    onClick={() => handleEditClientNavigation(client._id,client.companyId._id)}
                  >
                    {client?.phone || client?.whatsappNo}
                  </td>

                  {/* Email */}
                  <td
                    className="px-4 py-4 text-[var(--color-muted-foreground)] cursor-pointer"
                    onClick={() => handleEditClientNavigation(client._id,client.companyId._id)}
                  >
                    {client?.email}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4 text-left">
                    <Popover
                      open={openPopoverId === client._id}
                      onOpenChange={(isOpen) =>
                        setOpenPopoverId(isOpen ? client._id : null)
                      }
                    >
                      <PopoverTrigger asChild>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500"
                          aria-label="Client actions"
                        >
                          <MoreHorizontal size={16} />
                        </button>
                      </PopoverTrigger>

                      <PopoverContent className="w-44 p-2" align="end">
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClientNavigation(client._id,client.companyId._id);
                              setOpenPopoverId(null);
                            }}
                            className="px-3 py-2 rounded hover:bg-gray-100 text-gray-700 text-sm text-left"
                            aria-label="Edit Client"
                          >
                            Edit
                          </button>
                          {/* 
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewClient(client._id);
                              setOpenPopoverId(null);
                            }}
                            className="px-3 py-2 rounded hover:bg-gray-100 text-blue-600 text-sm text-left"
                            aria-label="View Client"
                          >
                            View
                          </button> */}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClient(client);
                              setOpenPopoverId(null);
                            }}
                            className="px-3 py-2 rounded hover:bg-gray-100 text-red-600 text-sm text-left flex items-center gap-2"
                            aria-label="Delete Client"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </td>
                </tr>
              ))}

              {!isLoading && clients?.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-[var(--color-muted-foreground)] text-xs"
                  >
                    {hasActiveFilters()
                      ? "No clients found matching the selected filters."
                      : "No clients found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Success Dialog */}
        {/* <ConfirmationDialog
          show={showSuccessDialog}
          title={successMessage.title}
          message={successMessage.message}
          onConfirm={() => setShowSuccessDialog(false)}
          onCancel={() => setShowSuccessDialog(false)}
          confirmText="OK"
          cancelText="Cancel"
          type="success"
        /> */}
      </div>

      {/* Delete Client Dialog */}
      <DeleteClientDialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        client={deleteDialog.client}
        loading={deleteDialog.loading}
      />

      {/* Bulk Delete Confirmation Dialog */}
      {bulkDeleteDialog.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Confirm Bulk Delete
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete {selectedClientIds.length} client
              {selectedClientIds.length > 1 ? "s" : ""}? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleBulkDeleteCancel}
                disabled={bulkDeleteDialog.loading}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDeleteConfirm}
                disabled={bulkDeleteDialog.loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {bulkDeleteDialog.loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <>
                    <FiTrash2 className="w-4 h-4" />
                    Delete {selectedClientIds.length} Client
                    {selectedClientIds.length > 1 ? "s" : ""}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { create } from "zustand";
import vendorApi, {
  type Vendor,
  type CreateVendorPayload,
  type UpdateVendorPayload,
  type GetVendorsFilters,
  type PaginationInfo,
} from "../../api/finance/vendorApi";

// Re-export Vendor type
export type { Vendor };

interface VendorStore {
  // State
  vendors: Vendor[];
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo | null;
  searchResults: Vendor[];
  selectedVendor: Vendor | null;

  // Actions
  fetchVendors: (filters?: GetVendorsFilters) => Promise<void>;
  createVendor: (vendorData: CreateVendorPayload) => Promise<Vendor>;
  updateVendor: (
    vendorId: string,
    vendorData: UpdateVendorPayload
  ) => Promise<Vendor>;
  deleteVendor: (vendorId: string) => Promise<void>;
  bulkDeleteVendors: (vendorIds: string[]) => Promise<{ deletedCount: number }>;
  searchVendors: (searchTerm: string) => Promise<void>;
  getVendorById: (vendorId: string) => Promise<void>;
  clearError: () => void;
  clearSearchResults: () => void;
  clearSelectedVendor: () => void;
}

export const useVendorStore = create<VendorStore>((set, get) => ({
  // Initial state
  vendors: [],
  loading: false,
  error: null,
  pagination: null,
  searchResults: [],
  selectedVendor: null,

  // Fetch all vendors with optional filters
  fetchVendors: async (filters?: GetVendorsFilters) => {
    set({ loading: true, error: null });
    try {
      const response = await vendorApi.getAllVendors(filters);
      set({
        vendors: response.result.vendors,
        pagination: response.result.pagination,
        loading: false,
      });
    } catch (error: any) {
      set({
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch vendors",
        loading: false,
      });
    }
  },

  // Create a new vendor
  createVendor: async (vendorData: CreateVendorPayload) => {
    set({ loading: true, error: null });
    try {
      const response = await vendorApi.createVendor(vendorData);
      const newVendor = response.result;

      set((state) => ({
        vendors: [newVendor, ...state.vendors],
        loading: false,
      }));

      return newVendor;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to create vendor";
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  // Update an existing vendor
  updateVendor: async (vendorId: string, vendorData: UpdateVendorPayload) => {
    set({ loading: true, error: null });
    try {
      const response = await vendorApi.updateVendor(vendorId, vendorData);
      const updatedVendor = response.result;

      set((state) => ({
        vendors: state.vendors.map((vendor) =>
          vendor._id === vendorId ? updatedVendor : vendor
        ),
        selectedVendor:
          state.selectedVendor?._id === vendorId
            ? updatedVendor
            : state.selectedVendor,
        loading: false,
      }));

      return updatedVendor;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update vendor";
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  // Delete a vendor
  deleteVendor: async (vendorId: string) => {
    set({ loading: true, error: null });
    try {
      await vendorApi.deleteVendor(vendorId);

      set((state) => ({
        vendors: state.vendors.filter((vendor) => vendor._id !== vendorId),
        selectedVendor:
          state.selectedVendor?._id === vendorId ? null : state.selectedVendor,
        loading: false,
      }));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete vendor";
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  // Bulk delete vendors
  bulkDeleteVendors: async (vendorIds: string[]) => {
    set({ loading: true, error: null });
    try {
      const response = await vendorApi.bulkDeleteVendors(vendorIds);

      set((state) => ({
        vendors: state.vendors.filter(
          (vendor) => !vendorIds.includes(vendor._id)
        ),
        loading: false,
      }));

      return response.result;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete vendors";
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  // Search vendors
  searchVendors: async (searchTerm: string) => {
    set({ loading: true, error: null });
    try {
      const response = await vendorApi.searchVendors(searchTerm);
      set({
        searchResults: response.result,
        loading: false,
      });
    } catch (error: any) {
      set({
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to search vendors",
        loading: false,
      });
    }
  },

  // Get vendor by ID
  getVendorById: async (vendorId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await vendorApi.getVendorById(vendorId);
      set({
        selectedVendor: response.result,
        loading: false,
      });
    } catch (error: any) {
      set({
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch vendor",
        loading: false,
      });
    }
  },

  // Clear error state
  clearError: () => set({ error: null }),

  // Clear search results
  clearSearchResults: () => set({ searchResults: [] }),

  // Clear selected vendor
  clearSelectedVendor: () => set({ selectedVendor: null }),
}));

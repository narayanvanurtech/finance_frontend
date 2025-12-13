import axios from "axios";
import axiosInstance from "../../utils/axios";

interface Company {
  _id: string;
  companyName: string;
}

interface BankAccount {
  accountHolderName?: string;
  bankName: string;
  accountNumber: string;
  ifsc: string;
  branch?: string;
  accountType: "Savings" | "Current" | "Other";
}

interface Attachment {
  name: string;
  url: string;
}

interface Address {
  country?: string;
  state?: string;
  city?: string;
  postalCode?: string;
  streetAddress?: string;
}

interface Vendor {
  _id: string;
  companyId: Company;
  name: string;
  displayName?: string;
  vendorType?: string;
  industry?: string;
  email?: string;
  showEmail: boolean;
  phone?: string;
  contact?: string;
  showPhone: boolean;
  gstin?: string;
  gstType?: string;
  panNumber?: string;
  taxTreatment?:
    | "Registered Business"
    | "Unregistered Business"
    | "Consumer"
    | "Overseas";
  address?: Address;
  vendorNo?: string;
  bankAccounts?: BankAccount[];
  attachments?: Attachment[];
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateVendorPayload {
  name: string;
  displayName?: string;
  vendorType?: string;
  industry?: string;
  email?: string;
  showEmail?: boolean;
  phone?: string;
  contact?: string;
  showPhone?: boolean;
  gstin?: string;
  gstType?: string;
  panNumber?: string;
  taxTreatment?:
    | "Registered Business"
    | "Unregistered Business"
    | "Consumer"
    | "Overseas";
  address?: Address;
  bankAccounts?: BankAccount[];
  attachments?: Attachment[];
}

interface UpdateVendorPayload {
  name?: string;
  displayName?: string;
  vendorType?: string;
  industry?: string;
  email?: string;
  showEmail?: boolean;
  phone?: string;
  contact?: string;
  showPhone?: boolean;
  gstin?: string;
  gstType?: string;
  panNumber?: string;
  taxTreatment?:
    | "Registered Business"
    | "Unregistered Business"
    | "Consumer"
    | "Overseas";
  address?: Address;
  bankAccounts?: BankAccount[];
  attachments?: Attachment[];
}

interface GetVendorsFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string; // Global search across multiple fields
  name?: string;
  email?: string;
  vendorType?: string;
  industry?: string;
  taxTreatment?: string;
  vendorNo?: string;
  phone?: string;
  gstin?: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalVendors: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface GetVendorsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  result: {
    vendors: Vendor[];
    pagination: PaginationInfo;
  };
}

interface SingleVendorResponse {
  success: boolean;
  statusCode: number;
  message: string;
  result: Vendor;
}

interface DeleteResponse {
  success: boolean;
  statusCode: number;
  message: string;
}

interface BulkDeleteResponse {
  success: boolean;
  statusCode: number;
  message: string;
  result: {
    deletedCount: number;
  };
}

const vendorApi = {
  // Create a new vendor
  createVendor: async (
    vendorData: CreateVendorPayload
  ): Promise<SingleVendorResponse> => {
    try {
      const response = await axiosInstance.post(
        "/api/v1/finance/purchases/vendor/createVendor",
        vendorData
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error;
      }
      throw new Error("Error creating vendor");
    }
  },

  // Get all vendors with optional filters and pagination
  getAllVendors: async (
    filters: GetVendorsFilters = {}
  ): Promise<GetVendorsResponse> => {
    try {
      const params = new URLSearchParams();

      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);
      if (filters.search) params.append("search", filters.search);
      if (filters.name) params.append("name", filters.name);
      if (filters.email) params.append("email", filters.email);
      if (filters.phone) params.append("phone", filters.phone);
      if (filters.gstin) params.append("gstin", filters.gstin);
      if (filters.vendorType) params.append("vendorType", filters.vendorType);
      if (filters.industry) params.append("industry", filters.industry);
      if (filters.taxTreatment)
        params.append("taxTreatment", filters.taxTreatment);
      if (filters.vendorNo) params.append("vendorNo", filters.vendorNo);

      const response = await axiosInstance.get(
        `/api/v1/finance/purchases/vendor/getAllVendors?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error;
      }
      throw new Error("Error fetching vendors");
    }
  },

  // Get vendor by ID
  getVendorById: async (vendorId: string): Promise<SingleVendorResponse> => {
    try {
      const response = await axiosInstance.get(
        `/api/v1/finance/purchases/vendor/vendorDetails/${vendorId}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error;
      }
      throw new Error("Error fetching vendor");
    }
  },

  // Search vendors by term (searches across name, email, phone, GSTIN)
  searchVendors: async (searchTerm: string): Promise<GetVendorsResponse> => {
    try {
      const params = new URLSearchParams();
      params.append("search", searchTerm);
      params.append("limit", "50"); // Limit search results

      const response = await axiosInstance.get(
        `/api/v1/finance/purchases/vendor/getAllVendors?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error;
      }
      throw new Error("Error searching vendors");
    }
  },

  // Update an existing vendor
  updateVendor: async (
    vendorId: string,
    vendorData: UpdateVendorPayload
  ): Promise<SingleVendorResponse> => {
    try {
      const response = await axiosInstance.put(
        `/api/v1/finance/purchases/vendor/updateVendorDetails/${vendorId}`,
        vendorData
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error;
      }
      throw new Error("Unexpected error while updating vendor");
    }
  },

  // Delete a vendor (soft delete)
  deleteVendor: async (vendorId: string): Promise<DeleteResponse> => {
    try {
      const response = await axiosInstance.delete(
        `/api/v1/finance/purchases/vendor/deleteVendor/${vendorId}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error;
      }
      throw new Error("Error deleting vendor");
    }
  },

  // Bulk delete vendors (soft delete)
  bulkDeleteVendors: async (
    vendorIds: string[]
  ): Promise<BulkDeleteResponse> => {
    try {
      const response = await axiosInstance.delete(
        "/api/v1/finance/purchases/vendor/bulkDeleteVendors",
        {
          data: { vendorIds },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error;
      }
      throw new Error("Error deleting vendors");
    }
  },
};

export default vendorApi;
export type {
  Vendor,
  CreateVendorPayload,
  UpdateVendorPayload,
  GetVendorsFilters,
  GetVendorsResponse,
  SingleVendorResponse,
  DeleteResponse,
  BulkDeleteResponse,
  PaginationInfo,
  Company,
  BankAccount,
  Attachment,
  Address,
};

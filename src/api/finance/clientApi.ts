import { toast } from "sonner";
import axios from "../../utils/axios";

// Address interface based on the model
export interface Address {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

// Account details can be stored as a simple string or as a structured object
export interface AccountDetails {
  accountHolderName?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  branchName?: string;
  accountType?: string;
}

// Client interface based on the model
export interface Client {
  _id: string;
  id: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  ownerId: {
    _id: string;
    name: string;
    email: string;
  };
  companyId: {
    _id: string;
    name: string;
  };
  leadId?: string;
  convertedAt?: string;
  businessName: string;
  alias?: string;
  industry?: string;
  logoUrl?: string;
  email: string;
  showEmail: boolean;
  phone?: string;
  whatsappNo?:string;
  showPhone: boolean;
  openSameAsWhatsappNo:boolean,
  gstin?: string;
  gstType: boolean;
  pan?: string;
  clientType: "Company" | "Individual";
  taxTreatment?:
    | "Registered Business"
    | "Unregistered Business"
    | "Consumer"
    | "Overseas";
  address: Address;
  uniqueKey?: string;
  accountDetails?: string | AccountDetails;
  accountHolderName?: string;
  bankName?: string;
  bankAccountNumber?: string;
  ifscCode?: string;
  branchName?: string;
  accountType?: string;
  createdAt: string;
  updatedAt: string;
}

// Create client payload interface
export interface CreateClientPayload {
  businessName: string;
  companyId: string;
  email: string;
  phone?: string;
  whatsappNo?:string;
  industry?: string;
  clientType?: "Company" | "Individual";
  taxTreatment?:
    | "Registered Business"
    | "Unregistered Business"
    | "Consumer"
    | "Overseas";
  gstin?: string;
  pan?: string;
  alias?: string;
  showEmail?: boolean;
  showPhone?: boolean;
  phoneSameAsWhatsappNo?:boolean;
  gstType?: boolean;
  address?: Address;
  // accountDetails can be either a simple string or a structured object
  accountDetails?: string | AccountDetails;
  // Optional owner and tags for assigning/labeling clients
  ownerId?: string;
  tags?: string[];
  bankAccountNumber?: string;
  accountHolderName?: string;
  bankName?: string;
  ifscCode?: string;
  branchName?: string;
  accountType?: string;
}

// Update client payload interface
export interface UpdateClientPayload extends Partial<CreateClientPayload> {}

// API Response interfaces
export interface ClientResponse {
  success: boolean;
  statusCode: number;
  message: string;
  result: Client;
}

export interface ClientFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  businessName?: string;
  email?: string;
  industry?: string;
  clientType?: "Company" | "Individual";
  taxTreatment?:
    | "Registered Business"
    | "Unregistered Business"
    | "Consumer"
    | "Overseas";
  city?: string;
  state?: string;
  country?: string;
  isActive?: boolean | "all" | "true" | "false";
}

export interface ClientsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  result: {
    clients: Client[];
    total: number;
    currentPage: number;
    totalPages: number;
    pagination?: {
      totalClients: number;
      totalPages: number;
      currentPage: number;
      limit: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export interface DeleteResponse {
  success: boolean;
  statusCode: number;
  message: string;
}



const clientApi = {
  // Create a new client
  createClient: async (
    clientData: CreateClientPayload,
 
  ): Promise<ClientResponse> => {
    try {
      const response = await axios.post<ClientResponse>(
        "/api/v1/finance/sales/client/createClient",
        clientData,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  
  // Get all clients by company
  getAllClients: async (
    companyId: string,
    filters?: ClientFilters,
  ): Promise<ClientsResponse> => {
    try {
      const queryParams = new URLSearchParams();

      if (filters) {
        // Add pagination parameters
        if (filters.page !== undefined) {
          queryParams.append("page", filters.page.toString());
        }
        if (filters.limit !== undefined) {
          queryParams.append("limit", filters.limit.toString());
        }
        if (filters.sortBy) {
          queryParams.append("sortBy", filters.sortBy);
        }
        if (filters.sortOrder) {
          queryParams.append("sortOrder", filters.sortOrder);
        }

        // Add filter parameters (only include if they have a value)
        if (filters.businessName && filters.businessName.trim() !== "") {
          queryParams.append("businessName", filters.businessName.trim());
        }
        if (filters.email && filters.email.trim() !== "") {
          queryParams.append("email", filters.email.trim());
        }
        if (filters.industry && filters.industry.trim() !== "") {
          queryParams.append("industry", filters.industry.trim());
        }
        if (filters.clientType) {
          queryParams.append("clientType", filters.clientType);
        }
        if (filters.taxTreatment) {
          queryParams.append("taxTreatment", filters.taxTreatment);
        }
        if (filters.city && filters.city.trim() !== "") {
          queryParams.append("city", filters.city.trim());
        }
        if (filters.state && filters.state.trim() !== "") {
          queryParams.append("state", filters.state.trim());
        }
        if (filters.country && filters.country.trim() !== "") {
          queryParams.append("country", filters.country.trim());
        }
        if (filters.isActive !== undefined) {
          queryParams.append("isActive", String(filters.isActive));
        }
      }

      const queryString = queryParams.toString();
      const url = `/api/v1/finance/sales/client/getAllClients/${companyId}${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await axios.get<ClientsResponse>(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all clients by user
  getAllClientsByUser: async (companyId: string): Promise<ClientsResponse> => {
    console.log("CompanyId user",companyId)
    try {
      const response = await axios.get<ClientsResponse>(
        `/api/v1/finance/sales/client/getAllClientsByUser/${companyId}`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get client details by ID
  getClientDetails: async (
    companyId: string,
    clientId: string,
  ): Promise<ClientResponse> => {
    try {
      const response = await axios.get<ClientResponse>(
        `/api/v1/finance/sales/client/clientDetails/${companyId}/${clientId}`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update client details
  updateClientDetails: async (
    companyId: string,
    clientId: string,
    clientData: UpdateClientPayload,
  ): Promise<ClientResponse> => {
    try {
      const response = await axios.put<ClientResponse>(
        `/api/v1/finance/sales/client/updateClientDetails/${companyId}/${clientId}`,
        clientData,
      );
      console.log("Client Updated SuccessFully ", response.data);
      if (response.data.message === "Client updated successfully") {
        setTimeout(() => {
          toast.success(response.data.message);
        }, 1000);
        return response.data;
      }
    } catch (error) {
      toast.error(error.response.data.message || response.data.message || "Failed to Updated Client")
      throw error;
    }
  },

  // Delete a client
  deleteClient: async (
    companyId: string,
    clientId: string,
  ): Promise<DeleteResponse> => {
    try {
      const response = await axios.delete<DeleteResponse>(
        `/api/v1/finance/sales/client/deleteClient/${companyId}/${clientId}`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  bulkDeleteClients: async (
    companyId: string,
    clientIds: string[],
  ): Promise<DeleteResponse> => {
    try {
      const response = await axios.delete<DeleteResponse>(
        `/api/v1/finance/sales/client/bulkDeleteClients/${companyId}`,
        {
          data: { clientIds },
        },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Convert lead to client
  convertLeadToClient: async (leadData: any): Promise<ClientResponse> => {
    try {
      const response = await axios.post<ClientResponse>(
        "/api/v1/finance/sales/client/convertLead",
        leadData,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Upload client logo
  uploadClientLogo: async (
    clientId: string,
    logoFile: File,
  ): Promise<ClientResponse> => {
    try {
      const formData = new FormData();
      formData.append("logo", logoFile);

      // Let axios automatically set Content-Type with boundary for FormData
      const response = await axios.post<ClientResponse>(
        `/api/v1/finance/sales/client/uploadLogo/${clientId}`,
        formData,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete client logo
  deleteClientLogo: async (clientId: string): Promise<DeleteResponse> => {
    try {
      const response = await axios.delete<DeleteResponse>(
        `/api/v1/finance/sales/client/deleteLogo/${clientId}`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default clientApi;

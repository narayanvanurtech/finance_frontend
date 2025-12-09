import axios from "../../utils/axios";

// Address interface based on the model
export interface Address {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
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
  showPhone: boolean;
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
  accountDetails?: string;
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
  gstType?: boolean;
  address?: Address;
  accountDetails?: string;
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

export interface ClientsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  result: {
    clients: Client[];
    total: number;
    currentPage: number;
    totalPages: number;
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
    clientData: CreateClientPayload
  ): Promise<ClientResponse> => {
    try {
      const response = await axios.post<ClientResponse>(
        "/api/v1/finance/sales/client/createClient",
        clientData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all clients by company
  getAllClients: async (companyId: string): Promise<ClientsResponse> => {
    try {
      const response = await axios.get<ClientsResponse>(
        `/api/v1/finance/sales/client/getAllClients/${companyId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all clients by user
  getAllClientsByUser: async (companyId: string): Promise<ClientsResponse> => {
    try {
      const response = await axios.get<ClientsResponse>(
        `/api/v1/finance/sales/client/getAllClientsByUser/${companyId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get client details by ID
  getClientDetails: async (
    companyId: string,
    clientId: string
  ): Promise<ClientResponse> => {
    try {
      const response = await axios.get<ClientResponse>(
        `/api/v1/finance/sales/client/clientDetails/${companyId}/${clientId}`
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
    clientData: UpdateClientPayload
  ): Promise<ClientResponse> => {
    try {
      const response = await axios.put<ClientResponse>(
        `/api/v1/finance/sales/client/updateClientDetails/${companyId}/${clientId}`,
        clientData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete a client
  deleteClient: async (
    companyId: string,
    clientId: string
  ): Promise<DeleteResponse> => {
    try {
      const response = await axios.delete<DeleteResponse>(
        `/api/v1/finance/sales/client/deleteClient/${companyId}/${clientId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  bulkDeleteClients: async (
    companyId: string,
    clientIds: string[]
  ): Promise<DeleteResponse> => {
    try {
      const response = await axios.delete<DeleteResponse>(
        `/api/v1/finance/sales/client/bulkDeleteClients/${companyId}`,
        {
          data: { clientIds },
        }
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
        leadData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Upload client logo
  uploadClientLogo: async (
    clientId: string,
    logoFile: File
  ): Promise<ClientResponse> => {
    try {
      const formData = new FormData();
      formData.append("logo", logoFile);

      const response = await axios.post<ClientResponse>(
        `/api/v1/finance/sales/client/uploadLogo/${clientId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
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
        `/api/v1/finance/sales/client/deleteLogo/${clientId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default clientApi;

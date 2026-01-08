import { create } from 'zustand';
import clientApi, { Client, CreateClientPayload, UpdateClientPayload, ClientResponse, ClientFilters } from '../../api/finance/clientApi';

interface ClientStore {
  clients: Client[];
  currentClient: Client | null;
  isLoading: boolean;
  error: string | null;
  totalClients: number;
  
  // Actions
  fetchClients: (companyId: string, filters?: ClientFilters) => Promise<void>;
  fetchClientsByUser: (companyId: string) => Promise<void>;
  getClientById: (companyId: string, clientId: string) => Promise<void>;
  createClient: (clientData: CreateClientPayload) => Promise<ClientResponse>;
  updateClient: (companyId: string, clientId: string, clientData: UpdateClientPayload) => Promise<void>;
  deleteClient: (companyId: string, clientId: string) => Promise<void>;
  bulkDeleteClients: (companyId: string, clientIds: string[]) => Promise<void>;
  convertLeadToClient: (leadData: any) => Promise<void>;
  uploadClientLogo: (clientId: string, logoFile: File) => Promise<void>;
  deleteClientLogo: (clientId: string) => Promise<void>;
  setError: (error: string | null) => void;
  clearCurrentClient: () => void;
}

export const useClientStore = create<ClientStore>((set, get) => ({
  clients: [],
  currentClient: null,
  isLoading: false,
  error: null,
  totalClients: 0,

  fetchClients: async (companyId: string, filters?: ClientFilters) => {
    try {
      set({ isLoading: true, error: null });
      const response = await clientApi.getAllClients(companyId, filters);
      set({ 
        clients: response.result.clients,
        totalClients: response.result.pagination?.totalClients || response.result.total || response.result.clients.length,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch clients',
        isLoading: false 
      });
    }
  },

  fetchClientsByUser: async (companyId: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await clientApi.getAllClientsByUser(companyId);
      set({ 
        clients: response.result.clients,
        totalClients: response.result.total,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch clients',
        isLoading: false 
      });
    }
  },

  getClientById: async (companyId: string, clientId: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await clientApi.getClientDetails(companyId, clientId);
      set({ 
        currentClient: response.result,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch client details',
        isLoading: false 
      });
    }
  },

  createClient: async (clientData: CreateClientPayload) => {
    try {
      set({ isLoading: true, error: null });
      const response = await clientApi.createClient(clientData);
      // Refresh the clients list after creating
      if (clientData.companyId) {
        await get().fetchClientsByUser(clientData.companyId);
      }
      set({ isLoading: false });
      return response; // Return the response so we can get the client ID
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create client',
        isLoading: false 
      });
      throw error;
    }
  },

  updateClient: async (companyId: string, clientId: string, clientData: UpdateClientPayload) => {
    try {
      set({ isLoading: true, error: null });
      const response = await clientApi.updateClientDetails(companyId, clientId, clientData);
      
      // Update the client in the local state
      const clients = get().clients.map(client =>
        client._id === clientId ? response.result : client
      );
      
      // Update current client if it matches
      const currentClient = get().currentClient;
      if (currentClient && currentClient._id === clientId) {
        set({ currentClient: response.result });
      }
      
      set({ clients, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update client',
        isLoading: false 
      });
      throw error;
    }
  },

  deleteClient: async (companyId: string, clientId: string) => {


    
    try {
      set({ isLoading: true, error: null });
      await clientApi.deleteClient(companyId, clientId);
      
      // Remove the client from local state
      const clients = get().clients.filter(client => client._id !== clientId);
      set({ 
        clients, 
        totalClients: clients.length,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete client',
        isLoading: false 
      });
      throw error;
    }
  },

  bulkDeleteClients: async (companyId: string, clientIds: string[]) => {
    try {
      set({ isLoading: true, error: null });
      await clientApi.bulkDeleteClients(companyId, clientIds);
      
      // Remove the clients from local state
      const clients = get().clients.filter(client => !clientIds.includes(client._id));
      set({ 
        clients, 
        totalClients: clients.length,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete clients',
        isLoading: false 
      });
      throw error;
    }
  },

  convertLeadToClient: async (leadData: any) => {
    try {
      set({ isLoading: true, error: null });
      await clientApi.convertLeadToClient(leadData);
      // Refresh the clients list after conversion
      if (leadData.companyId) {
        await get().fetchClientsByUser(leadData.companyId);
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to convert lead to client',
        isLoading: false 
      });
      throw error;
    }
  },

  uploadClientLogo: async (clientId: string, logoFile: File) => {
    try {
      set({ isLoading: true, error: null });
      const response = await clientApi.uploadClientLogo(clientId, logoFile);
      
      // Update the client in the local state
      const clients = get().clients.map(client =>
        client._id === clientId ? response.result : client
      );
      
      // Update current client if it matches
      const currentClient = get().currentClient;
      if (currentClient && currentClient._id === clientId) {
        set({ currentClient: response.result });
      }
      
      set({ clients, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to upload logo',
        isLoading: false 
      });
      throw error;
    }
  },

  deleteClientLogo: async (clientId: string) => {
    try {
      set({ isLoading: true, error: null });
      await clientApi.deleteClientLogo(clientId);
      
      // Update the client in the local state (remove logoUrl)
      const clients = get().clients.map(client =>
        client._id === clientId ? { ...client, logoUrl: undefined } : client
      );
      
      // Update current client if it matches
      const currentClient = get().currentClient;
      if (currentClient && currentClient._id === clientId) {
        set({ currentClient: { ...currentClient, logoUrl: undefined } });
      }
      
      set({ clients, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete logo',
        isLoading: false 
      });
      throw error;
    }
  },

  setError: (error: string | null) => set({ error }),
  
  clearCurrentClient: () => set({ currentClient: null }),
}));

// Export the Client type for use in components
export type { Client } from '../../api/finance/clientApi';

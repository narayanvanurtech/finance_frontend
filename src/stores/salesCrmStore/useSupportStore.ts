import { create } from 'zustand';
import { 
  createSupportTicket, 
  CreateSupportTicketRequest, 
  CreateSupportTicketResponse,
  SupportTicket,
  getAllSupportTicketsByCompany,
  getSupportTicketById,
  CompanySupportTicket
} from '@/api/supportApi';

interface SupportState {
  supportTickets: SupportTicket[];
  currentTicket: SupportTicket | null;
  selectedTicket: CompanySupportTicket | null;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
  companyTickets: CompanySupportTicket[];
}

interface SupportActions {
  createTicket: (ticketData: CreateSupportTicketRequest) => Promise<void>;
  setCurrentTicket: (ticket: SupportTicket | null) => void;
  fetchTicketById: (ticketId: string) => Promise<void>;
  resetError: () => void;
  resetSuccessMessage: () => void;
  clearState: () => void;
  fetchTicketsByCompany: (companyId: string) => Promise<void>;
}

type SupportStore = SupportState & SupportActions;

export const useSupportStore = create<SupportStore>((set, get) => ({
  // Initial state
  supportTickets: [],
  currentTicket: null,
  selectedTicket: null,
  isLoading: false,
  error: null,
  successMessage: null,
  companyTickets: [],

  // Actions
  createTicket: async (ticketData: CreateSupportTicketRequest) => {
    set({ isLoading: true, error: null, successMessage: null });
    try {
      const response: CreateSupportTicketResponse = await createSupportTicket(ticketData);
      
      // Add the new ticket to the list
      set((state) => ({
        supportTickets: [...state.supportTickets, response.data],
        currentTicket: response.data,
        isLoading: false,
        successMessage: response.message || 'Support ticket created successfully',
      }));
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to create support ticket',
        successMessage: null
      });
      throw error; // Re-throw to handle in the component
    }
  },

  fetchTicketsByCompany: async (companyId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getAllSupportTicketsByCompany(companyId);
      set({
        companyTickets: response.data.tickets,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch company tickets',
      });
    }
  },

  fetchTicketById: async (ticketId: string) => {
    // First check if the ticket already exists in the store
    const existingTicket = get().companyTickets.find(ticket => ticket._id === ticketId);
    
    if (existingTicket) {
      set({
        selectedTicket: existingTicket,
        isLoading: false,
        error: null,
      });
      return;
    }

    // If not found in store, fetch from API
    set({ isLoading: true, error: null });
    try {
      const response = await getSupportTicketById(ticketId);
      set({
        selectedTicket: response.data,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch ticket',
      });
    }
  },

  setCurrentTicket: (ticket: SupportTicket | null) => {
    set({ currentTicket: ticket });
  },

  resetError: () => {
    set({ error: null });
  },

  resetSuccessMessage: () => {
    set({ successMessage: null });
  },

  clearState: () => {
    set({
      supportTickets: [],
      currentTicket: null,
      selectedTicket: null,
      isLoading: false,
      error: null,
      successMessage: null,
      companyTickets: [],
    });
  },
}));

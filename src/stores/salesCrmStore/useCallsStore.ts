// src/stores/useCallsStore.ts
import { create } from "zustand";
import {
  Call,
  CallUser,
  CallDeal,
  CallCounts,
  CallDetails,
  CallFilters,
  CreateCallRequest,
  UpdateCallRequest,
  AddNoteRequest,
  getAllCalls,
  getCalls,
  getCallById,
  createCall,
  deleteCall,
  bulkCallDelete,
  addCallNote,
  updateCall,
  getLeadForAllCalls,
  getLeadForAllCloseCalls,
} from "@/api/callsApi";
import { useAuthStore } from "./useAuthStore";

interface CallsState {
  calls: Call[];
  currentCall: Call | null;
  currentCallDetails: CallDetails | null;
  totalCalls: number;
  currentPage: number;
  totalPages: number;
  limit: number;
  isLoading: boolean;
  error: string | null;
  filters: CallFilters;
}

interface CallsActions {
  fetchCalls: (filters?: CallFilters) => Promise<void>;
  fetchAllCalls: (filters?: CallFilters) => Promise<void>;
  fetchCallById: (id: string) => Promise<void>;
  addCall: (leadId: string, call: CreateCallRequest) => Promise<void>;
  updateCall: (id: string, data: UpdateCallRequest) => Promise<void>;
  removeCall: (id: string) => Promise<boolean>;
  bulkDeleteCalls: (callIds: string[]) => Promise<void>;
  setCurrentCall: (call: Call | null) => void;
  resetError: () => void;
  addNote: (callId: string, note: string) => Promise<void>;
  fetchLeadCalls: (leadId: string, filters?: CallFilters) => Promise<void>;
  fetchLeadCloseCalls: (leadId: string, filters?: CallFilters) => Promise<void>;
}

type CallsStore = CallsState & CallsActions;

export const useCallsStore = create<CallsStore>((set, get) => ({
  // Initial state
  calls: [],
  currentCall: null,
  currentCallDetails: null,
  totalCalls: 0,
  currentPage: 1,
  totalPages: 1,
  limit: 20,
  isLoading: false,
  error: null,
  filters: {},

  // Actions
  fetchCalls: async (filters?: CallFilters) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = useAuthStore.getState();
      const companyId = user?.companyId;
      
      if (!companyId) {
        throw new Error('Company ID not found');
      }
      
      const response = await getCalls(companyId, filters);
      const callsWithIds = response.result.calls.map(call => ({
        ...call,
        callId: call._id
      }));
      
      set({
        calls: callsWithIds,
        totalCalls: response.result.total,
        currentPage: response.result.currentPage,
        totalPages: response.result.totalPages,
        limit: filters?.limit || 20,
        isLoading: false,
        filters: filters || {},
      });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch calls' 
      });
    }
  },

  fetchAllCalls: async (filters?: CallFilters) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = useAuthStore.getState();
      const companyId = user?.companyId;
      
      if (!companyId) {
        throw new Error('Company ID not found');
      }
      
      const response = await getAllCalls(companyId, filters);
      const callsWithIds = response.result.calls.map(call => ({
        ...call,
        callId: call._id
      }));
      
      set({
        calls: callsWithIds,
        totalCalls: response.result.total,
        currentPage: response.result.currentPage,
        totalPages: response.result.totalPages,
        limit: filters?.limit || 20,
        isLoading: false,
        filters: filters || {},
      });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch all calls' 
      });
    }
  },

  fetchCallById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getCallById(id);
      const callWithId = {
        ...response.result,
        callId: response.result._id
      };
      set({
        currentCall: callWithId,
        currentCallDetails: response.result,
        isLoading: false,
      });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch call details' 
      });
    }
  },

  addCall: async (leadId: string, callData: CreateCallRequest) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = useAuthStore.getState();
      const companyId = user?.companyId;
      
      if (!companyId) {
        throw new Error('Company ID not found');
      }
      
      await createCall(leadId, companyId, callData);
      // Refresh calls list after adding
      const filters = get().filters;
      await get().fetchCalls(filters);
      set({ isLoading: false });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to add call' 
      });
    }
  },

  updateCall: async (id: string, callData: UpdateCallRequest) => {
    set({ isLoading: true, error: null });
    try {
      const currentCall = get().currentCall;
      if (!currentCall) {
        throw new Error("Cannot update call: call not found");
      }
      
      const response = await updateCall(id, callData);
      
      // Update current call if it's the one being edited
      if (currentCall && (currentCall.callId === id || currentCall._id === id)) {
        const updatedCall = {
          ...response.result,
          callId: response.result._id
        };
        set({ currentCall: updatedCall });
      }
      
      set({ isLoading: false });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to update call' 
      });
    }
  },

  removeCall: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      // First validate that the call exists
      const callToDelete = get().calls.find((call) => call.callId === id);
      if (!callToDelete) {
        throw new Error("Call not found. It may have been already deleted.");
      }

      await deleteCall(id);

      // Only update state if API call was successful
      set((state) => ({
        calls: state.calls.filter((call) => call.callId !== id),
        currentCall: state.currentCall?.callId === id ? null : state.currentCall,
        currentCallDetails: state.currentCall?.callId === id ? null : state.currentCallDetails,
        totalCalls: state.totalCalls - 1,
        isLoading: false,
        error: null,
      }));

      return true; // Indicate successful deletion
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while deleting the call. Please try again.";

      set({
        error: errorMessage,
        isLoading: false,
      });

      throw new Error(errorMessage); // Re-throw to handle in the component
    }
  },

  bulkDeleteCalls: async (callIds: string[]) => {
    set({ isLoading: true, error: null });
    try {
      // Validate calls exist
      const callsToDelete = get().calls.filter((call) => callIds.includes(call.callId));
      if (callsToDelete.length !== callIds.length) {
        throw new Error(
          "Some calls were not found. They may have been already deleted."
        );
      }

      // Update state optimistically
      set((state) => ({
        calls: state.calls.filter((call) => !callIds.includes(call.callId)),
        totalCalls: Math.max(0, state.totalCalls - callIds.length),
        currentCall:
          state.currentCall && callIds.includes(state.currentCall.callId)
            ? null
            : state.currentCall,
        currentCallDetails:
          state.currentCall && callIds.includes(state.currentCall.callId)
            ? null
            : state.currentCallDetails,
        isLoading: false,
        error: null,
      }));

      // Make API call
      await bulkCallDelete({ callIds });

      // Fetch fresh data in background
      // setTimeout(() => {
      //   window.location.reload();
      // }, 1000);
    } catch (error) {
      // Revert optimistic update
      get().fetchCalls();

      const errorMessage =
        error instanceof Error ? error.message : "Failed to bulk delete calls";
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  addNote: async (callId: string, note: string) => {
    set({ isLoading: true, error: null });
    try {
      await addCallNote(callId, { note });
      // Refresh call details after adding note
      await get().fetchCallById(callId);
      set({ isLoading: false });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to add note' 
      });
    }
  },

  setCurrentCall: (call: Call | null) => {
    set({ currentCall: call });
  },

  resetError: () => {
    set({ error: null });
  },

  fetchLeadCalls: async (leadId: string, filters?: CallFilters) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = useAuthStore.getState();
      const companyId = user?.companyId;
      
      if (!companyId) {
        throw new Error('Company ID not found');
      }
      
      const response = await getLeadForAllCalls(leadId, companyId, filters);
      const callsWithIds = response.result.calls.map(call => ({
        ...call,
        callId: call._id
      }));
      
      set({
        calls: callsWithIds,
        totalCalls: response.result.total,
        currentPage: response.result.currentPage,
        totalPages: response.result.totalPages,
        limit: filters?.limit || 20,
        isLoading: false,
        filters: filters || {},
      });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch lead calls' 
      });
    }
  },

  fetchLeadCloseCalls: async (leadId: string, filters?: CallFilters) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = useAuthStore.getState();
      const companyId = user?.companyId;
      
      if (!companyId) {
        throw new Error('Company ID not found');
      }
      
      const response = await getLeadForAllCloseCalls(leadId, companyId, filters);
      const callsWithIds = response.result.calls.map(call => ({
        ...call,
        callId: call._id
      }));
      
      set({
        calls: callsWithIds,
        totalCalls: response.result.total,
        currentPage: response.result.currentPage,
        totalPages: response.result.totalPages,
        limit: filters?.limit || 20,
        isLoading: false,
        filters: filters || {},
      });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch lead close calls' 
      });
    }
  },
}));

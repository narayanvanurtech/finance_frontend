import { create } from "zustand";
import {
  getAllDeleteLeads,
  restoreLeads,
  deleteLead,
  bulkDeleteLead,
} from "../../api/leadsApi";

// Define the lead type based on the actual API response
interface DeletedLead {
  _id: string;
  ownerId: string;
  company: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  website: string;
  title: string;
  industry: string;
  leadSource: string;
  leadStatus: string;
  priority: string;
  status: string;
  followUpDate: string;
  lastStatusChange: string;
  convertedDate: string | null;
  attachments: any;
  notes: string | null;
  attachment: string[];
  isConverted: boolean;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  openTasks: any[];
  openMeetings: any[];
  openCalls: any[];
  closeTasks: any[];
  closeMeetings: any[];
  closeCalls: any[];
  __v: number;
}

interface RecycleBinStore {
  deletedLeads: DeletedLead[];
  isLoading: boolean;
  error: string | null;
  fetchDeletedLeads: () => Promise<void>;
  restoreLead: (id: string) => Promise<void>;
  permanentlyDeleteLead: (id: string, companyId: string) => Promise<void>;
  bulkDeleteLeads: (leadIds: string[], companyId: string) => Promise<void>;
  clearError: () => void;
}

export const useRecycleBinStore = create<RecycleBinStore>((set) => ({
  deletedLeads: [],
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchDeletedLeads: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await getAllDeleteLeads();
      console.log("API Response:", response); // Debug log

      // Handle both response structures
      if (response && response.data) {
        if (Array.isArray(response.data)) {
          // Empty response: data is an empty array
          set({ deletedLeads: [], isLoading: false });
        } else if (response.data.leads && Array.isArray(response.data.leads)) {
          // Response with leads: data is an object with leads array
          set({ deletedLeads: response.data.leads, isLoading: false });
        } else {
          console.error("Unexpected response structure:", response);
          set({
            error: "Invalid response structure from server",
            isLoading: false,
          });
        }
      } else {
        console.error("Unexpected response structure:", response);
        set({
          error: "Invalid response structure from server",
          isLoading: false,
        });
      }
    } catch (error) {
      console.error("Error fetching deleted leads:", error);
      set({ error: "Failed to fetch deleted leads", isLoading: false });
    }
  },

  restoreLead: async (id: string) => {
    try {
      set({ isLoading: true });
      await restoreLeads({ leadIds: [id] });
      set((state) => ({
        deletedLeads: state.deletedLeads.filter((lead) => lead._id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  permanentlyDeleteLead: async (id: string, companyId: string) => {
    try {
      set({ isLoading: true });
      await deleteLead(id, companyId);
      set((state) => ({
        deletedLeads: state.deletedLeads.filter((lead) => lead._id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  bulkDeleteLeads: async (leadIds: string[], companyId: string) => {
    try {
      set({ isLoading: true });
      await bulkDeleteLead({ leadIds }, companyId);
      set((state) => ({
        deletedLeads: state.deletedLeads.filter(
          (lead) => !leadIds.includes(lead._id)
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
}));

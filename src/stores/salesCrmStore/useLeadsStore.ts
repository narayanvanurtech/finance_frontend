import { create } from "zustand";
import {
  CreateLeadRequest,
  Lead,
  LeadFilters,
  createLead,
  getAllLeads,
  getLeadById,
  assignSingleLead,
  bulkLeadAssign,
  deleteLead,
  bulkDeleteLead,
  updateLead,
  getUserLeads,
  addNote,
  updateNote,
  uploadFile,
  deleteAttachment,
} from "@/api/leadsApi";

interface LeadsState {
  leads: Lead[];
  currentLead: Lead | null;
  totalLeads: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  filters: LeadFilters;
}

interface LeadsActions {
  fetchLeads: (companyId: string, filters?: LeadFilters) => Promise<void>;
  fetchUserLeads: (userId: string, filters?: LeadFilters) => Promise<void>;
  fetchLeadById: (id: string, companyId?: string) => Promise<void>;
  addLead: (lead: CreateLeadRequest) => Promise<void>;
  updateLead: (id: string, data: Partial<CreateLeadRequest>, companyId?: string) => Promise<void>;
  setCurrentLead: (lead: Lead | null) => void;
  resetError: () => void;
  assignLead: (leadId: string, email: string) => Promise<void>;
  bulkAssignLeads: (leadIds: string[], email: string) => Promise<void>;
  deleteLead: (leadId: string, companyId: string) => Promise<boolean>;
  bulkDeleteLeads: (leadIds: string[], companyId: string) => Promise<void>;
  addNote: (leadId: string, note: string) => Promise<void>;
  updateNote: (leadId: string, noteId: string, content: string) => Promise<void>;
  uploadFile: (leadId: string, file: File) => Promise<void>;
  deleteAttachment: (leadId: string, attachmentId: string) => Promise<void>;
}

type LeadsStore = LeadsState & LeadsActions;

export const useLeadsStore = create<LeadsStore>((set, get) => ({
  // Initial state
  leads: [],
  currentLead: null,
  totalLeads: 0,
  currentPage: 1,
  totalPages: 1,
  isLoading: false,
  error: null,
  filters: {},

  // Actions
  fetchLeads: async (companyId: string, filters?: LeadFilters) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getAllLeads(companyId);
      console.log(response);
      // Convert response data to Lead type
      const leads = response.data.response.map((item: any) => ({
        _id: item._id, // Use _id from response
        leadId: item.leadId || item._id, // Add leadId mapping from API response
        ownerId: {
          _id: item.ownerId || "",
          email: item.ownerEmail || item.leadOwner || "",
          name: item.ownerName || item.leadOwner || "",
        },
        assignedTo: item.assignedTo || null,
        companyName: item.companyName,
        companyId: item.companyId || "",
        firstName: item.firstName,
        lastName: item.lastName,
        fullName: item.fullName,
        leadOwner: item.leadOwner || "",
        email: item.email,
        phone: item.phone,
        mobile: item.mobile || null,
        website: item.website,
        title: item.title,
        industry: item.industry,
        leadSource: item.leadSource,
        leadStatus: item.leadStatus,
        priority: item.priority,
        status: item.status,
        followUpDate: item.followUpDate,
        lastStatusChange: item.lastStatusChange,
        convertedDate: item.convertedDate,
        address: {
          street: item.street || "",
          city: item.city || "",
          state: item.state || "",
          postalCode: item.postalCode || "",
          country: item.country || "",
          full: `${item.street || ""}, ${item.city || ""}, ${
            item.state || ""
          } ${item.postalCode || ""}, ${item.country || ""}`,
        },
        attachments: item.attachments || null,
        attachment: item.attachment || [],
        inviteMeeting: item.inviteMeeting || null,
        notes: item.notes || null,
        socialMedia: {
          facebook: item.facebook || null,
          instagram: item.instagram || null,
          linkedIn: item.linkedIn || null,
          twitter: item.twitter || null,
        },
        createdBy: item.createdBy || null,
        updatedBy: item.updatedBy || null,
        isDeleted: item.isDeleted ?? false,
        isConverted: !!item.convertedDate,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        source: item.source || "",
        temperature: item.temperature || "",
        expectedCloseDate: item.expectedCloseDate || "",
        annualRevenue: item.annualRevenue || 0,
        numberOfEmployees: item.numberOfEmployees || 0,
        description: item.description || "",
        tags: item.tags || [],
        rating: item.rating || 0,
        websiteDomain: item.websiteDomain || "",
        ownerName: item.ownerName || "",
        // Add missing Lead properties with default values if not present
        actualCloseDate: item.actualCloseDate || null,
        openTasks: item.openTasks || [],
        closeTasks: item.closeTasks || [],
        openMeetings: item.openMeetings || [],
        closeMeetings: item.closeMeetings || [],
        openCalls: item.openCalls || [],
        closeCalls: item.closeCalls || [],
        openNotes: item.openNotes || [],
        closeNotes: item.closeNotes || [],
        openEmails: item.openEmails || [],
        closeEmails: item.closeEmails || [],
        // Add missing Lead properties
        socialProfiles: item.socialProfiles || {},
        emailCount: item.emailCount ?? 0,
        lastEmailSentAt: item.lastEmailSentAt || null,
      }));

      set({
        leads,
        totalLeads: response.data.total,
        currentPage: response.data.page,
        totalPages: response.data.totalPages,
        filters: filters || {},
      });
    } catch (error: any) {
      set({ error: error?.message || "Failed to fetch leads" });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchUserLeads: async (userId: string, filters?: LeadFilters) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getUserLeads(userId, filters);
      console.log(response);
      // Convert response data to Lead type
      const leads = response.data.data.map((item: any) => ({
        _id: item.id,
        ownerId: { _id: "", email: "", name: "" }, // Set default or get from response
        assignedTo: null,
        companyName: item.companyName,
        firstName: item.firstName,
        lastName: item.lastName,
        fullName: item.fullName,
        email: item.email,
        phone: item.phone,
        mobile: null,
        website: item.website,
        title: item.title,
        industry: item.industry,
        leadSource: item.leadSource,
        leadStatus: item.leadStatus,
        priority: item.priority,
        status: item.status,
        followUpDate: item.followUpDate,
        lastStatusChange: item.lastStatusChange,
        convertedDate: null,
        ownerName: item.ownerName || "",
        isConverted: !!item.convertedDate,

        address: {
          ...item.address,
          full: item.address?.full || "",
        },
        attachments: null,
        inviteMeeting: null,
        notes: null,
        socialMedia: {
          facebook: null,
          instagram: null,
          linkedIn: null,
          twitter: null,
        },
        createdBy: null,
        updatedBy: null,
        isDeleted: false,
        createdAt: "",
        updatedAt: "",
      }));

      set({
        leads,
        totalLeads: response.data.total,
        currentPage: response.data.page,
        totalPages: response.data.pages,
        filters: filters || {},
      });
      console.log(leads);
    } catch (error: any) {
      set({ error: error?.message || "Failed to fetch user leads" });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchLeadById: async (id: string, companyId?: string) => {
    set({ isLoading: true, error: null });
    try {
      if (!companyId) {
        throw new Error("Company ID is required to fetch lead details");
      }
      const response = await getLeadById(id, companyId);
      set({ currentLead: response.result, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch lead",
        isLoading: false,
      });
    }
  },

  addLead: async (leadData: CreateLeadRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await createLead(leadData);
      set((state) => ({
        leads: [...state.leads, response.result],
        totalLeads: state.totalLeads + 1,
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to create lead",
        isLoading: false,
      });
    }
  },

  updateLead: async (id: string, data: Partial<CreateLeadRequest>, companyId?: string) => {
    set({ isLoading: true, error: null });
    try {      
      const response = await updateLead(id, data, companyId);
      if (response.result) {
        set((state) => ({
          currentLead: response.result,
          leads: state.leads.map((lead) =>
            lead._id === response.result._id ? response.result : lead
          ),
        }));
      }
    } catch (error: any) {
      set({ error: error?.message || "Failed to update lead" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  setCurrentLead: (lead: Lead | null) => {
    set({ currentLead: lead });
  },

  resetError: () => {
    set({ error: null });
  },

  assignLead: async (leadId: string, email: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await assignSingleLead(leadId, email);
      // Update the lead in both leads array and currentLead if it matches
      set((state) => {
        const updatedLeads = state.leads.map((lead) =>
          lead._id === leadId ? response.data : lead
        );
        return {
          leads: updatedLeads,
          currentLead:
            state.currentLead?._id === leadId
              ? response.data
              : state.currentLead,
          isLoading: false,
        };
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to assign lead",
        isLoading: false,
      });
    }
  },

  bulkAssignLeads: async (leadIds: string[], email: string) => {
    set({ isLoading: true, error: null });
    try {
      // Validate leads exist
      const leadsToAssign = get().leads.filter((lead) =>
        leadIds.includes(lead._id)
      );
      if (leadsToAssign.length !== leadIds.length) {
        throw new Error(
          "Some leads were not found. They may have been already deleted or modified."
        );
      }

      // Update state optimistically
      set((state) => ({
        leads: state.leads.map((lead) => {
          if (leadIds.includes(lead._id)) {
            return {
              ...lead,
              ownerId: typeof lead.ownerId === 'string' 
                ? { _id: lead.ownerId, email: email, name: '' }
                : { ...lead.ownerId, email: email },
            };
          }
          return lead;
        }),
        isLoading: false,
        error: null,
      }));

      // Make API call
      await bulkLeadAssign({ leadIds, email });

      // Fetch fresh data in background
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      // Revert optimistic update
      get().fetchLeads("defaultCompanyId", {});

      const errorMessage =
        error instanceof Error ? error.message : "Failed to bulk assign leads";
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  deleteLead: async (leadId: string, companyId: string) => {
    set({ isLoading: true, error: null });
    try {
      // First validate that the lead exists
      const leadToDelete = get().leads.find((lead) => lead._id === leadId);
      if (!leadToDelete) {
        throw new Error("Lead not found. It may have been already deleted.");
      }

      if (!companyId) {
        throw new Error("Company ID is required to delete lead");
      }

      await deleteLead(leadId, companyId);

      // Only update state if API call was successful
      set((state) => ({
        leads: state.leads.filter((lead) => lead._id !== leadId),
        currentLead:
          state.currentLead?._id === leadId ? null : state.currentLead,
        totalLeads: state.totalLeads - 1,
        isLoading: false,
        error: null,
      }));

      return true; // Indicate successful deletion
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while deleting the lead. Please try again.";

      set({
        error: errorMessage,
        isLoading: false,
      });

      throw new Error(errorMessage); // Re-throw to handle in the component
    }
  },

  bulkDeleteLeads: async (leadIds: string[], companyId: string) => {
    set({ isLoading: true, error: null });
    try {
      // Validate leads exist
      const leadsToDelete = get().leads.filter((lead) =>
        leadIds.includes(lead._id)
      );
      if (leadsToDelete.length !== leadIds.length) {
        throw new Error(
          "Some leads were not found. They may have been already deleted."
        );
      }

      if (!companyId) {
        throw new Error("Company ID is required to delete leads");
      }

      // Update state optimistically
      set((state) => ({
        leads: state.leads.filter((lead) => !leadIds.includes(lead._id)),
        totalLeads: Math.max(0, state.totalLeads - leadIds.length),
        currentLead:
          state.currentLead && leadIds.includes(state.currentLead._id)
            ? null
            : state.currentLead,
        isLoading: false,
        error: null,
      }));

      // Make API call
      await bulkDeleteLead({ leadIds }, companyId);

      // Refresh data to ensure consistency
      setTimeout(() => {
        get().fetchLeads(companyId, get().filters);
      }, 500);
    } catch (error) {
      // Revert optimistic update
      get().fetchLeads(companyId, {});

      const errorMessage =
        error instanceof Error ? error.message : "Failed to bulk delete leads";
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  addNote: async (leadId: string, note: string) => {
    try {
      await addNote(leadId, { content: note }); // Changed from 'note' to 'content'
      // Refresh the lead data after adding the note
      const state = get();
      const companyId = state.leads.find(lead => lead._id === leadId)?.companyId || 
                        state.currentLead?.companyId;
      
      if (!companyId) {
        throw new Error("Company ID is required to get lead details");
      }
      
      const response = await getLeadById(leadId, companyId);
      set({ currentLead: response.result });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to add note",
      });
    }
  },

  updateNote: async (leadId: string, noteId: string, content: string) => {
    try {
      await updateNote(leadId, noteId, { content });
      // Refresh the lead data after updating the note
      const state = get();
      const companyId = state.leads.find(lead => lead._id === leadId)?.companyId || 
                        state.currentLead?.companyId;
      
      if (!companyId) {
        throw new Error("Company ID is required to get lead details");
      }
      
      const response = await getLeadById(leadId, companyId);
      set({ currentLead: response.result });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to update note",
      });
    }
  },

  uploadFile: async (leadId: string, file: File) => {
    set({ isLoading: true, error: null });
    try {
      await uploadFile(leadId, file);
      // Refresh the lead data after uploading the file
      const state = get();
      const companyId = state.leads.find(lead => lead._id === leadId)?.companyId || 
                        state.currentLead?.companyId;
      
      if (!companyId) {
        throw new Error("Company ID is required to get lead details");
      }
      
      const response = await getLeadById(leadId, companyId);
      set({ currentLead: response.result });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to upload file",
        isLoading: false,
      });
    }
  },

  deleteAttachment: async (leadId: string, attachmentId: string) => {
    set({ isLoading: true, error: null });
    try {
      await deleteAttachment(leadId, attachmentId);
      // Refresh the lead data after deleting the attachment
      const state = get();
      const companyId = state.leads.find(lead => lead._id === leadId)?.companyId || 
                        state.currentLead?.companyId;
      
      if (!companyId) {
        throw new Error("Company ID is required to get lead details");
      }
      
      const response = await getLeadById(leadId, companyId);
      set({ currentLead: response.result, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to delete attachment",
        isLoading: false,
      });
    }
  },
}));

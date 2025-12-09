// src/stores/useMeetingsStore.ts
import { create } from "zustand";
import {
  CreateMeetingRequest,
  Meeting,
  MeetingFilters,
  createMeeting,
  getAllMeetings,
  getMeetingById,
  updateMeeting,
  deleteMeeting,
  deleteAllMeetings,
  bulkDeleteMeetings,
  getUserMeetings,
  addNote,
  uploadFile,
} from "@/api/meetingsApi";

// API response types
interface MeetingUser {
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  _id: string;
  email: string;
  name: string;
  mobile: string;
  companyName: string;
  userType: string;
  isActive: boolean;
  companySize: string;
  profilePic?: string;
}

interface MeetingDeal {
  _id: string;
  dealName: string;
  amount: number;
  stage: string;
  probability: number;
  expectedRevenue: number;
  [key: string]: any;
}

interface MeetingCounts {
  tasks: number;
  calls: number;
  meetings: number;
}

interface MeetingDetails {
  user: MeetingUser;
  deal: MeetingDeal[];
  counts: MeetingCounts;
}

interface MeetingsState {
  meetings: Meeting[];
  currentMeeting: Meeting | null;
  currentMeetingDetails: MeetingDetails | null;
  totalMeetings: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  filters: MeetingFilters;
  uploadProgress: { [key: string]: number };
}

interface MeetingsActions {
  fetchMeetings: (filters?: MeetingFilters) => Promise<void>;
  fetchUserMeetings: (filters?: MeetingFilters) => Promise<void>;
  fetchMeetingById: (id: string) => Promise<void>;
  addMeeting: (meeting: CreateMeetingRequest) => Promise<void>;
  updateMeeting: (id: string, data: CreateMeetingRequest) => Promise<void>;
  setCurrentMeeting: (meeting: Meeting | null) => void;
  resetError: () => void;
  deleteMeeting: (meetingId: string) => Promise<boolean>;
  deleteAllMeetings: () => Promise<boolean>;
  bulkDeleteMeetings: (meetingIds: string[]) => Promise<void>;
  addNote: (meetingId: string, note: string) => Promise<void>;
  uploadFile: (meetingId: string, file: File) => Promise<void>;
}

type MeetingsStore = MeetingsState & MeetingsActions;

export const useMeetingsStore = create<MeetingsStore>((set, get) => ({
  // Initial state
  meetings: [],
  currentMeeting: null,
  currentMeetingDetails: null,
  totalMeetings: 0,
  currentPage: 1,
  totalPages: 1,
  isLoading: false,
  error: null,
  filters: {},
  uploadProgress: {},

  // Actions
  fetchMeetings: async (filters?: MeetingFilters) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getAllMeetings(filters);
      console.log("Full API response in store:", response);

      if (response?.result && Array.isArray(response.result.meetings)) {
        set({
          meetings: response.result.meetings,
          totalMeetings: response.result.total,
          currentPage: response.result.currentPage,
          totalPages: response.result.totalPages,
          filters: filters || {},
          isLoading: false,
        });
      } else {
        console.error("Unexpected API response structure:", response);
        set({
          error: "Invalid API response structure",
          isLoading: false,
        });
      }
    } catch (error: any) {
      console.error("Error fetching meetings:", error);
      set({
        error: error?.message || "Failed to fetch meetings",
        isLoading: false,
      });
    }
  },

  fetchUserMeetings: async (filters?: MeetingFilters) => {
    set({ isLoading: true, error: null });
    try {
      // Validate required parameters
      if (!filters?.leadId || !filters?.companyId) {
        throw new Error('Lead ID and Company ID are required for fetching user meetings');
      }
      
      const response = await getUserMeetings(filters);
      console.log("User meetings API response:", response);

      if (response && response.result && Array.isArray(response.result.meetings)) {
        console.log("Setting user meetings from response.result.meetings");
        set({
          meetings: response.result.meetings,
          totalMeetings: response.result.total,
          currentPage: response.result.currentPage,
          totalPages: response.result.totalPages,
          filters: filters || {},
          isLoading: false,
        });
      } else {
        console.error("Unexpected API response structure:", response);
        set({
          error: "Invalid API response structure",
          isLoading: false,
        });
      }
    } catch (error: any) {
      console.error("Error fetching user meetings:", error);
      set({
        error: error?.message || "Failed to fetch user meetings",
        isLoading: false,
      });
    }
  },

  fetchMeetingById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getMeetingById(id);
      const meetingData = response.result;
      
      // Convert the response result to match the Meeting interface
      const meeting: Meeting = {
        ...meetingData,
        id: meetingData._id,
        meetingId: meetingData._id,
        attachments: meetingData.attachment || []
      };

      // Create meeting details structure from the meeting data
      const meetingDetails = {
        user: {
          _id: typeof meetingData.leadId === 'object' ? meetingData.leadId._id : '',
          email: typeof meetingData.leadId === 'object' ? meetingData.leadId.email : '',
          name: typeof meetingData.leadId === 'object' ? meetingData.leadId.fullName : '',
          mobile: typeof meetingData.leadId === 'object' ? meetingData.leadId.phone || '' : '',
          address: {
            street: '',
            city: '',
            state: '',
            pincode: '',
            country: '',
          },
          companyName: '',
          userType: '',
          isActive: true,
          companySize: '',
        },
        deal: [], // Set as empty array as this data isn't in the new API response
        counts: {
          tasks: 0,
          calls: 0,
          meetings: 0
        }
      };

      set({
        currentMeeting: meeting,
        currentMeetingDetails: meetingDetails,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error fetching meeting:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch meeting",
        isLoading: false,
      });
    }
  },

  addMeeting: async (meetingData: CreateMeetingRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await createMeeting(meetingData);
      if (response?.result) {
        // Convert the response result to match the Meeting interface
        const newMeeting: Meeting = {
          ...response.result,
          meetingId: response.result._id,
          id: response.result._id,
          attachments: response.result.attachment || []
        };
        
        set((state) => ({
          meetings: [...state.meetings, newMeeting],
          totalMeetings: state.totalMeetings + 1,
          isLoading: false,
        }));
      }
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to create meeting",
        isLoading: false,
      });
      throw error;
    }
  },

  updateMeeting: async (id: string, data: CreateMeetingRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await updateMeeting(id, data);
      if (response?.result) {
        // Convert to Meeting interface format
        const updatedMeeting: Meeting = {
          ...response.result,
          id: response.result._id,
          meetingId: response.result._id,
          attachments: response.result.attachment || []
        };
        
        set((state) => ({
          currentMeeting: updatedMeeting,
          meetings: state.meetings.map((meeting) =>
            meeting._id === updatedMeeting._id
              ? updatedMeeting
              : meeting
          ),
          isLoading: false,
        }));
      }
    } catch (error: any) {
      set({
        error: error?.message || "Failed to update meeting",
        isLoading: false,
      });
      throw error;
    }
  },

  setCurrentMeeting: (meeting: Meeting | null) => {
    set({ currentMeeting: meeting });
  },

  resetError: () => {
    set({ error: null });
  },

  // Update the deleteMeeting action in the store

  deleteMeeting: async (meetingId: string) => {
    set({ isLoading: true, error: null });
    try {
      const meetingToDelete = get().meetings.find(
        (meeting) => meeting._id === meetingId || meeting.id === meetingId || meeting.meetingId === meetingId
      );
      if (!meetingToDelete) {
        throw new Error("Meeting not found. It may have been already deleted.");
      }

      await deleteMeeting(meetingId);

      set((state) => ({
        meetings: state.meetings.filter(
          (meeting) => meeting._id !== meetingId && meeting.id !== meetingId && meeting.meetingId !== meetingId
        ),
        currentMeeting:
          (state.currentMeeting?._id === meetingId || 
           state.currentMeeting?.id === meetingId ||
           state.currentMeeting?.meetingId === meetingId)
            ? null
            : state.currentMeeting,
        currentMeetingDetails:
          (state.currentMeeting?._id === meetingId ||
           state.currentMeeting?.id === meetingId ||
           state.currentMeeting?.meetingId === meetingId)
            ? null
            : state.currentMeetingDetails,
        totalMeetings: state.totalMeetings - 1,
        isLoading: false,
        error: null,
      }));

      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while deleting the meeting. Please try again.";
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw new Error(errorMessage);
    }
  },

  deleteAllMeetings: async () => {
  set({ isLoading: true, error: null });
  try {
    console.log('Attempting to delete all meetings...');
    const response = await deleteAllMeetings();
    console.log('Delete all meetings response:', response);

    if (response.success && response.statusCode === 200) {
      setTimeout(() => {
        window.location.reload();
      }, 1500); 
      set({
        meetings: [],
        currentMeeting: null,
        currentMeetingDetails: null,
        totalMeetings: 0,
        isLoading: false,
        error: null,
      });
      return true;
    } else {
      throw new Error(response.message || 'Failed to delete all meetings');
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'An unexpected error occurred while deleting all meetings';
    console.error('Error deleting all meetings:', errorMessage);
    set({
      error: errorMessage,
      isLoading: false,
    });
    return false;
  }
},

bulkDeleteMeetings: async (meetingIds: string[]) => {
  if (!meetingIds || meetingIds.length === 0) {
    set({ 
      error: "Please select at least one meeting to delete",
      isLoading: false 
    });
    return;
  }

  set({ isLoading: true, error: null });
  try {
    console.log('Starting bulk delete for meetings:', meetingIds);
    
    // Call the bulk delete API endpoint with updated implementation
    const response = await bulkDeleteMeetings(meetingIds);
    console.log('Bulk delete response:', response);

    if (response.success) {
      // Update state first (for immediate feedback)
      set((state) => ({
        meetings: state.meetings.filter(
          (meeting) => {
            const id = meeting._id || meeting.id || meeting.meetingId;
            return !meetingIds.includes(id as string);
          }
        ),
        totalMeetings: Math.max(0, state.totalMeetings - meetingIds.length),
        currentMeeting:
          state.currentMeeting &&
          meetingIds.includes(state.currentMeeting._id)
            ? null
            : state.currentMeeting,
        currentMeetingDetails:
          state.currentMeeting &&
          meetingIds.includes(state.currentMeeting._id)
            ? null
            : state.currentMeetingDetails,
        isLoading: false,
        error: null,
      }));

      // Refresh the page after successful deletion
      setTimeout(() => {
        window.location.reload();
      }, 500); // Small delay to show immediate UI update before refresh

    } else {
      throw new Error(response.message || 'Failed to delete meetings');
    }
  } catch (error) {
    console.error('Error in bulkDeleteMeetings:', error);
    const errorMessage = error instanceof Error ? error.message : "Failed to delete meetings";
    
    // Set error state
    set({ 
      error: errorMessage, 
      isLoading: false 
    });
    
    // Refresh meetings to ensure UI is in sync with server
    await get().fetchMeetings();
    
    throw error;
  }
},

  addNote: async (meetingId: string, note: string) => {
    set({ isLoading: true, error: null });
    try {
      await addNote(meetingId, { note });
      // Refresh meeting details after adding note
      await get().fetchMeetingById(meetingId);
      set({ isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to add note",
        isLoading: false,
      });
      throw error;
    }
  },

  uploadFile: async (meetingId: string, file: File) => {
    set((state) => ({
      uploadProgress: { ...state.uploadProgress, [file.name]: 0 },
      error: null,
    }));

    try {
      const response = await uploadFile(meetingId, file);
      set((state) => ({
        uploadProgress: { ...state.uploadProgress, [file.name]: 100 },
      }));
      // Refresh meeting details after file upload
      await get().fetchMeetingById(meetingId);
    } catch (error) {
      set((state) => ({
        error: error instanceof Error ? error.message : "Failed to upload file",
        uploadProgress: { ...state.uploadProgress, [file.name]: 0 },
      }));
      throw error;
    }
  },
}));

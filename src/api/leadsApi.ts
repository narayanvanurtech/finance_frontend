// src/api/leadsApi.ts
import axiosInstance from "@/utils/axios";

interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface SocialMedia {
  facebook: string | null;
  instagram: string | null;
  linkedIn: string | null;
  twitter: string | null;
}

export interface CreateLeadRequest {
  firstName: string;
  lastName: string;
  email: string;
  companyName?: string;
  phone: string;
  mobile?: string;
  website?: string;
  title?: string;
  industry?: string;
  source?: string; // Changed from leadSource
  status?: string; // Changed from leadStatus
  priority?: string;
  temperature?: string; // Added temperature field
  followUpDate?: string;
  address?: Address;
  socialProfiles?: SocialMedia; // Changed from socialMedia to socialProfiles
}

interface Owner {
  _id: string;
  email: string;
  name: string;
}

export interface Lead {
  _id: string;
  id?: string; // Added id field
  leadId?: string; // Added leadId field from API response
  ownerId: string | Owner;
  companyId: string | null;
  firstName: string;
  companyName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  mobile: string | null;
  website: string | null;
  title: string | null;
  industry: string;
  source: string; // Changed from leadSource
  status: string; // Changed from leadStatus
  priority: string;
  temperature: string; // Added temperature field
  lostReason?: string; // Added lostReason
  leadOwner?: string;
  expectedCloseDate: string | null;
  actualCloseDate: string | null;
  followUpDate: string | null;
  lastStatusChange: string | null;
  convertedDate: string | null;
  address: Address & { full: string };
  attachments: any[];
  openTasks: any[];
  closeTasks: any[];
  openMeetings: any[];
  closeMeetings: any[];
  openCalls: any[];
  closeCalls: any[];
  socialProfiles: SocialMedia; // Changed from socialMedia to socialProfiles
  notes: any[]; // Changed from string to array
  emailCount: number;
  lastEmailSentAt: string | null;
  isDeleted?: boolean;
  isConverted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetAllLeadsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  result: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    leads: Array<Lead>;
  };
}

interface GetLeadResponse {
  success: boolean;
  statusCode: number;
  message: string;
  result: Lead;
}

interface BaseResponse {
  success: boolean;
  statusCode: number;
  message: string;
}

interface ImportLeadsResponse extends BaseResponse {
  duplicateCount?: number;
  data?: {
    message?: string;
    duplicateCount?: number;
  };
}

interface AssignLeadResponse extends BaseResponse {
  data: Lead;
}

interface BulkAssignLeadRequest {
  leadIds: string[];
  email: string;
}

interface BulkDeleteLeadRequest {
  leadIds: string[];
}

interface BulkRestoreLeadRequest {
  leadIds: string[];
}

export interface LeadFilters {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  companyName?: string;
  companyId?: string; // Added companyId for filtering
  status?: string;
  source?: string; // Changed from leadSource
  priority?: string;
  temperature?: string; // Added temperature
  "address.street"?: string;
  "address.city"?: string;
  "address.state"?: string;
  page?: number;
  limit?: number;
}

export const createLead = async (
  data: CreateLeadRequest
): Promise<{
  success: boolean;
  statusCode: number;
  message: string;
  result: Lead;
}> => {
  const response = await axiosInstance.post<{
    success: boolean;
    statusCode: number;
    message: string;
    result: Lead;
  }>("/api/v1/lead/createNewLead", data);
  return response.data;
};

export const getAllLeads = async (
  companyId: string,
  filters?: LeadFilters
): Promise<{
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    response: Array<Lead>;
  };
}> => {
  const queryParams = new URLSearchParams();

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });
  }

  const url = `/api/v1/lead/getAllLeads/${companyId}${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  const response = await axiosInstance.get(url);

  // Map API response to our expected format
  return {
    success: response.data.success,
    statusCode: response.data.statusCode,
    message: response.data.message,
    data: {
      total: response.data.result.total,
      page: response.data.result.page,
      limit: response.data.result.limit,
      totalPages: response.data.result.totalPages,
      response: response.data.result.leads.map((lead: any) => ({
        ...lead,
        leadId: lead.leadId || lead._id, // Ensure leadId is available
      })),
    },
  };
};

export const getAllDeleteLeads = async (): Promise<any> => {
  const response = await axiosInstance.get<any>(
    "/api/v1/lead/getAllDeleteLeads"
  );
  return response.data;
};

export const getLeadById = async (
  id: string,
  companyId: string
): Promise<GetLeadResponse> => {
  if (!companyId) {
    throw new Error("Company ID is required to fetch lead details");
  }

  const response = await axiosInstance.get<GetLeadResponse>(
    `/api/v1/lead/leadDetails/${companyId}/${id}`
  );
  return response.data;
};

export const updateLead = async (
  id: string,
  data: Partial<CreateLeadRequest>,
  companyId?: string
): Promise<GetLeadResponse> => {
  if (!companyId) {
    throw new Error("Company ID is required to update lead details");
  }

  const response = await axiosInstance.put<GetLeadResponse>(
    `/api/v1/lead/updateLeadDetails/${companyId}/${id}`,
    data
  );
  return response.data;
};

export const assignSingleLead = async (
  leadId: string,
  email: string
): Promise<AssignLeadResponse> => {
  const response = await axiosInstance.get<AssignLeadResponse>(
    `/api/v1/lead/assignSingleLead/${leadId}/status/${email}`
  );
  return response.data;
};

export const bulkLeadAssign = async (
  data: BulkAssignLeadRequest
): Promise<BaseResponse> => {
  const response = await axiosInstance.post<BaseResponse>(
    "/api/v1/lead/bulkLeadAssign",
    data
  );
  return response.data;
};

export const deleteLead = async (
  leadId: string,
  companyId: string
): Promise<BaseResponse> => {
  const response = await axiosInstance.delete<BaseResponse>(
    `/api/v1/lead/deleteLead/${companyId}/${leadId}`
  );
  return response.data;
};

export const bulkDeleteLead = async (
  data: BulkDeleteLeadRequest,
  companyId: string
): Promise<BaseResponse> => {
  const response = await axiosInstance.delete<BaseResponse>(
    `/api/v1/lead/bulkDeleteLeads/${companyId}`,
    { data }
  );
  return response.data;
};

export const restoreLeads = async (
  data: BulkRestoreLeadRequest
): Promise<BaseResponse> => {
  const response = await axiosInstance.post<BaseResponse>(
    "/api/v1/lead/restoreLeads",
    data
  );
  return response.data;
};

interface GetUserLeadsResponse extends GetAllLeadsResponse {}

export const getUserLeads = async (
  userId: string,
  filters?: LeadFilters
): Promise<any> => {
  const queryParams = new URLSearchParams();

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        queryParams.append(key, value);
      }
    });
  }

  const url = `/api/v1/lead/getUserLeads/${userId}${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;
  const response = await axiosInstance.get<GetUserLeadsResponse>(url);
  return response.data;
};

export const importLeads = async (file: File): Promise<ImportLeadsResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axiosInstance.post<ImportLeadsResponse>(
    "/api/v1/lead/import",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

export interface CreateTaskPayload {
  subject: string;
  dueDate: string;
  priority: string;
  reminder: boolean;
  description: string;
  lead?: string;
}

export interface CreateMeetingRequest {
  meetingVenue: string;
  location: string;
  allDay: boolean;
  lead?: string; // Added lead field
  fromDateTime: string;
  toDateTime: string;
  host: string;
  title: string;
  participants: string[];
}

export interface CreateCallRequest {
  callType: "inbound" | "outbound";
  outgoingCallStatus: "scheduled" | "completed" | "cancelled";
  callStartTime: string;
  callPurpose: string;
  callAgenda: string;
  subject: string;
  reminder: boolean;
  notes: string;
  leadEmail?: string;
}

export interface Task {
  _id: string;
  id: string;
  taskId?: string;
  taskOwner: string;
  leadFirstName: string;
  leadEmail: string;
  leadId: string;
  subject: string;
  dueDate: string;
  status: string;
  priority: string;
  reminder: boolean;
  description: string;
  completionDate: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TaskListResponse extends BaseResponse {
  data: {
    total: number;
    data: Task[];
  };
}

interface CallListResponse extends BaseResponse {
  data: {
    total: number;
    data: Call[];
  };
}

export interface Call {
  _id: string;
  id: string;
  callId: string; // Added callId field
  callOwner: string;
  leadId: string;
  leadEmail: string;
  callType: "inbound" | "outbound";
  outgoingCallStatus: string;
  callStartTime: string;
  callPurpose: string;
  callAgenda: string;
  callResult: string | null;
  notes: string;
  description: string | null;
  subject: string;
  reminder: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Meeting {
  _id: string;
  id: string;
  meetingId?: string;
  taskId?: string;
  meetingOwner: string;
  leadId: string;
  leadEmail: string;
  title: string;
  meetingVenue: string;
  location: string;
  status: string | null;
  allDay: boolean;
  fromDateTime: string;
  toDateTime: string;
  host: string;
  participants: string[];
  participantsReminder: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface MeetingListResponse extends BaseResponse {
  data: {
    total: number;
    data: Meeting[];
  };
}

export interface AddNoteRequest {
  content: string; // Changed from 'note' to 'content' to match API
}

export interface AddNoteResponse extends BaseResponse {
  data: {
    content: string;
    _id: string;
    leadId: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface UpdateNoteRequest {
  content: string;
}

export interface UpdateNoteResponse extends BaseResponse {
  data: {
    content: string;
    _id: string;
    leadId: string;
    createdAt: string;
    updatedAt: string;
  };
}

export const addNote = async (
  leadId: string,
  data: AddNoteRequest
): Promise<AddNoteResponse> => {
  const response = await axiosInstance.post<AddNoteResponse>(
    `/api/v1/lead/addNotes/${leadId}`,
    data
  );
  return response.data;
};

export const updateNote = async (
  leadId: string,
  noteId: string,
  data: UpdateNoteRequest
): Promise<UpdateNoteResponse> => {
  const response = await axiosInstance.put<UpdateNoteResponse>(
    `/api/v1/lead/updateNotes/${leadId}/${noteId}`,
    data
  );
  return response.data;
};

export const uploadFile = async (
  leadId: string,
  file: File
): Promise<GetLeadResponse> => {
  const formData = new FormData();
  formData.append("files", file); // Changed from "file" to "files" to match backend

  const response = await axiosInstance.post<GetLeadResponse>(
    `/api/v1/lead/uploadAttachment/${leadId}`, // Updated endpoint
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

export const deleteAttachment = async (
  leadId: string,
  attachmentId: string
): Promise<GetLeadResponse> => {
  const response = await axiosInstance.delete<GetLeadResponse>(
    `/api/v1/lead/deleteAttachment/${leadId}/${attachmentId}`
  );
  return response.data;
};

const leadsApi = {
  createTask: async (leadId: string, taskData: CreateTaskPayload) => {
    try {
      const response = await axiosInstance.post(
        `/api/v1/lead/addTask/${leadId}`,
        taskData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createMeeting: async (leadId: string, meetingData: CreateMeetingRequest) => {
    try {
      const response = await axiosInstance.post(
        `/api/v1/lead/addMeeting/${leadId}`,
        meetingData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createCall: async (leadId: string, callData: CreateCallRequest) => {
    try {
      const response = await axiosInstance.post(
        `/api/v1/lead/addCall/${leadId}`,
        callData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getTask: async (
    leadId: string,
    taskId: string,
    type?: string
  ): Promise<{ data: Task }> => {
    try {
      const url = type
        ? `/api/v1/lead/getTask/${leadId}/${taskId}?type=${type}`
        : `/api/v1/lead/getTask/${leadId}/${taskId}`;
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getTaskList: async (
    leadId: string,
    type?: string
  ): Promise<TaskListResponse> => {
    try {
      const url =
        type === "close"
          ? `/api/v1/lead/closeTaskList/${leadId}`
          : `/api/v1/lead/taskList/${leadId}`;
      const response = await axiosInstance.get<TaskListResponse>(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getCallList: async (
    leadId: string,
    type?: string
  ): Promise<CallListResponse> => {
    try {
      const url =
        type === "close"
          ? `/api/v1/lead/closeCallList/${leadId}`
          : `/api/v1/lead/callList/${leadId}`;
      const response = await axiosInstance.get<CallListResponse>(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getMeetingList: async (
    leadId: string,
    type?: string
  ): Promise<MeetingListResponse> => {
    try {
      const url =
        type === "close"
          ? `/api/v1/lead/closeMeetingList/${leadId}`
          : `/api/v1/lead/meetingList/${leadId}`;
      const response = await axiosInstance.get<MeetingListResponse>(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getClosedTaskList: async (leadId: string): Promise<TaskListResponse> => {
    try {
      const response = await axiosInstance.get<TaskListResponse>(
        `/api/v1/lead/closeTaskList/${leadId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getClosedCallList: async (leadId: string): Promise<CallListResponse> => {
    try {
      const response = await axiosInstance.get<CallListResponse>(
        `/api/v1/lead/closeCallList/${leadId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getClosedMeetingList: async (
    leadId: string
  ): Promise<MeetingListResponse> => {
    try {
      const response = await axiosInstance.get<MeetingListResponse>(
        `/api/v1/lead/closeMeetingList/${leadId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateLeadsTask: async (
    leadId: string,
    taskId: string,
    taskData: Partial<CreateTaskPayload>
  ) => {
    try {
      console.log("Updating task with leadId:", leadId);
      console.log("Updating task with taskId:", taskId);
      console.log("Task data being sent:", taskData);

      const response = await axiosInstance.put(
        `/api/v1/lead/editTask/${leadId}/${taskId}`,
        taskData
      );
      return response.data;
    } catch (error) {
      console.error("Error in updateLeadsTask:", error);
      throw error;
    }
  },

  updateTaskStatus: async (leadId: string, taskId: string) => {
    try {
      const response = await axiosInstance.put(
        `/api/v1/lead/completedTask/${leadId}/${taskId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getMeeting: async (
    leadId: string,
    meetingId: string,
    type?: string
  ): Promise<{ data: Meeting }> => {
    try {
      // Using meetingId (UUID format) instead of _id (MongoDB ObjectId)
      const url = type
        ? `/api/v1/lead/getMeeting/${leadId}/${meetingId}?type=${type}`
        : `/api/v1/lead/getMeeting/${leadId}/${meetingId}`;
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching meeting:", error);
      throw error;
    }
  },

  updateMeeting: async (
    leadId: string,
    meetingId: string,
    meetingData: Partial<CreateMeetingRequest>
  ) => {
    try {
      // Using meetingId (UUID format) instead of _id (MongoDB ObjectId)
      const response = await axiosInstance.put(
        `/api/v1/lead/editMeeting/${leadId}/${meetingId}`,
        meetingData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating meeting:", error);
      throw error;
    }
  },

  completedMeeting: async (leadId: string, meetingId: string) => {
    try {
      const response = await axiosInstance.put(
        `/api/v1/lead/completedMeeting/${leadId}/${meetingId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getCall: async (
    leadId: string,
    callId: string,
    type?: string
  ): Promise<{ data: Call }> => {
    try {
      const url = type
        ? `/api/v1/lead/getCall/${leadId}/${callId}?type=${type}`
        : `/api/v1/lead/getCall/${leadId}/${callId}`;
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  editCall: async (
    leadId: string,
    callId: string,
    callData: Partial<CreateCallRequest>
  ) => {
    try {
      const response = await axiosInstance.put(
        `/api/v1/lead/editCall/${leadId}/${callId}`,
        callData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  completeCall: async (leadId: string, callId: string) => {
    try {
      const response = await axiosInstance.put(
        `/api/v1/lead/completedCall/${leadId}/${callId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  cancelCall: async (leadId: string, callId: string) => {
    try {
      const response = await axiosInstance.put(
        `/api/v1/lead/cancelCall/${leadId}/${callId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteMeeting: async (meetingId: string) => {
    try {
      const response = await axiosInstance.delete<BaseResponse>(
        `/api/v1/meeting/deleteMeeting/${meetingId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  rescheduleCall: async (
    leadId: string,
    callId: string,
    data: { callStartTime: string; notes: string }
  ) => {
    try {
      const response = await axiosInstance.put(
        `/api/v1/lead/rescheduledCall/${leadId}/${callId}`,
        data
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteTask: async (taskId: string) => {
    try {
      const response = await axiosInstance.delete(
        `/api/v1/task/deleteTask/${taskId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default leadsApi;

// src/api/callsApi.ts
import axiosInstance from "@/utils/axios";
export const dynamic = "force-dynamic";
// Types
export interface Call {
  _id: string;
  callId: string;
  callOwner:
    | {
        _id: string;
        email: string;
        name: string;
      }
    | string;
  companyId: string;
  leadId:
    | {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
        fullName: string;
        address: {
          full: string;
        };
        id: string;
      }
    | string;
  callType: "outbound" | "inbound";
  outgoingCallStatus: "scheduled" | "completed" | "missed" | "cancel";
  callStartTime: string;
  callPurpose: string;
  callAgenda: string;
  callResult: string | null;
  notes: string | null;
  description: string | null;
  reminder?: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CallUser {
  _id: string;
  email: string;
  name: string;
  phone?: string;
  fullName: string;
  address: {
    full: string;
  };
  id: string;
}

export interface CallDeal {
  _id: string;
  dealName: string;
  amount: number;
  stage: string;
  probability: number;
  expectedRevenue: number;
  dealOwner: string;
  accountName: string;
  type: string;
  nextStep: string;
  leadSource: string;
  closingDate: string;
}

export interface CallCounts {
  tasks: number;
  calls: number;
  meetings: number;
}

export interface CallDetails {
  _id: string;
  callId: string;
  callOwner: {
    _id: string;
    email: string;
    name: string;
  };
  companyId: string;
  leadId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    fullName: string;
    address: {
      full: string;
    };
    id: string;
  };
  callType: "outbound" | "inbound";
  outgoingCallStatus: "scheduled" | "completed" | "missed" | "cancel";
  callStartTime: string;
  callPurpose: string;
  callAgenda: string;
  callResult: string | null;
  notes: string | null;
  description: string | null;
  reminder?: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CreateCallRequest {
  callType: "outbound" | "inbound";
  outgoingCallStatus: "scheduled" | "completed" | "missed" | "cancel";
  callStartTime: string;
  callPurpose: string;
  callAgenda: string;
  callResult?: string;
  notes?: string;
  description?: string;
  reminder?: boolean;
}

export interface UpdateCallRequest {
  callType?: "outbound" | "inbound";
  outgoingCallStatus?: "scheduled" | "completed" | "missed" | "cancel";
  callStartTime?: string;
  callPurpose?: string;
  callAgenda?: string;
  callResult?: string;
  notes?: string;
  description?: string;
  reminder?: boolean;
}

export interface CallsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  result: {
    total: number;
    currentPage: number;
    totalPages: number;
    calls: Call[];
  };
}

export interface CallResponse {
  success: boolean;
  statusCode: number;
  message: string;
  result: CallDetails;
}

export interface CreateCallResponse {
  success: boolean;
  statusCode: number;
  message: string;
  result: Call;
}

export interface BulkDeleteCallRequest {
  callIds: string[];
}

export interface CallFilters {
  page?: number;
  limit?: number;
  search?: string;
  callType?: "outgoing" | "incoming";
}

export interface AddNoteRequest {
  note: string;
}

// API functions
export const getAllCalls = async (
  companyId: string,
  filters?: CallFilters
): Promise<CallsResponse> => {
  const params = new URLSearchParams();
  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.limit) params.append("limit", filters.limit.toString());
  if (filters?.search) params.append("search", filters.search);
  if (filters?.callType) params.append("callType", filters.callType);

  const queryString = params.toString();
  const url = `/api/v1/call/getAllCall/${companyId}${
    queryString ? `?${queryString}` : ""
  }`;

  const response = await axiosInstance.get(url);
  return response.data;
};

export const getCalls = async (
  companyId: string,
  filters?: CallFilters
): Promise<CallsResponse> => {
  const params = new URLSearchParams();
  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.limit) params.append("limit", filters.limit.toString());
  if (filters?.search) params.append("search", filters.search);
  if (filters?.callType) params.append("callType", filters.callType);

  const queryString = params.toString();
  const url = `/api/v1/call/getAllCall/${companyId}${
    queryString ? `?${queryString}` : ""
  }`;

  const response = await axiosInstance.get(url);
  return response.data;
};

export const getCallById = async (callId: string): Promise<CallResponse> => {
  const response = await axiosInstance.get(
    `/api/v1/call/getCallbById/${callId}`
  );
  return response.data;
};

export const createCall = async (
  leadId: string,
  companyId: string,
  callData: CreateCallRequest
): Promise<CreateCallResponse> => {
  const response = await axiosInstance.post(
    `/api/v1/call/addCall/${leadId}/${companyId}`,
    callData
  );
  return response.data;
};

export const updateCall = async (
  callId: string,
  callData: UpdateCallRequest
): Promise<CreateCallResponse> => {
  const response = await axiosInstance.put(
    `/api/v1/call/updateCall/${callId}`,
    callData
  );
  return response.data;
};

export const deleteCall = async (
  callId: string
): Promise<{ success: boolean }> => {
  const response = await axiosInstance.delete(
    `/api/v1/call/deleteCall/${callId}`
  );
  return { success: true };
};

export const bulkCallDelete = async (data: {
  callIds: string[];
}): Promise<{ success: boolean }> => {
  const response = await axiosInstance.delete("/api/v1/call/bulkDeleteCalls", {
    data,
  });
  return { success: true };
};

export const getLeadForAllCalls = async (
  leadId: string,
  companyId: string,
  filters?: CallFilters
): Promise<CallsResponse> => {
  const params = new URLSearchParams();
  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.limit) params.append("limit", filters.limit.toString());

  const queryString = params.toString();
  const url = `/api/v1/call/getLeadForAllCalls/${leadId}/${companyId}${
    queryString ? `?${queryString}` : ""
  }`;

  const response = await axiosInstance.get(url);
  return response.data;
};

export const getLeadForAllCloseCalls = async (
  leadId: string,
  companyId: string,
  filters?: CallFilters
): Promise<CallsResponse> => {
  const params = new URLSearchParams();
  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.limit) params.append("limit", filters.limit.toString());

  const queryString = params.toString();
  const url = `/api/v1/call/getLeadForAllCloseCalls/${leadId}/${companyId}${
    queryString ? `?${queryString}` : ""
  }`;

  const response = await axiosInstance.get(url);
  return response.data;
};

export const addCallNote = async (
  callId: string,
  noteData: AddNoteRequest
): Promise<{ data: Call }> => {
  const response = await axiosInstance.put(
    `/api/v1/call/addNotes/${callId}`,
    noteData
  );
  return response.data;
};

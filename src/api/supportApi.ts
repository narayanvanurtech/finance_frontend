import axiosInstance from "@/utils/axios";

// Request interface for creating a support ticket
export interface CreateSupportTicketRequest {
  category: string;
  subject: string;
  priority: "low" | "medium" | "high";
  description: string;
}

// Response interface for support ticket
export interface SupportTicket {
  user: string;
  category: string;
  subject: string;
  priority: string;
  status: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  _id: string;
  __v: number;
}

// API response interface
export interface CreateSupportTicketResponse {
  statusCode: number;
  status: string;
  message: string;
  data: SupportTicket;
}

// Response interface for nested user in ticket
export interface SupportTicketUser {
  _id: string;
  email: string;
  name: string;
  mobile: string;
}

// Updated SupportTicket interface for getAllSupportTicketByCompany
export interface CompanySupportTicket {
  _id: string;
  user: SupportTicketUser;
  category: string;
  subject: string;
  ticket: string;
  companyId: string;
  priority: string;
  status: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface GetAllSupportTicketsByCompanyData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  tickets: CompanySupportTicket[];
}

export interface GetAllSupportTicketsByCompanyResponse {
  statusCode: number;
  status: string;
  message: string;
  data: GetAllSupportTicketsByCompanyData;
}

export interface GetSupportTicketByIdResponse {
  statusCode: number;
  status: string;
  message: string;
  data: CompanySupportTicket;
}

/**
 * Create a new support ticket
 * @param data - Support ticket data
 * @returns Promise with the created support ticket response
 */
export const createSupportTicket = async (
  data: CreateSupportTicketRequest
): Promise<CreateSupportTicketResponse> => {
  console.log(data)
  const response = await axiosInstance.post<CreateSupportTicketResponse>(
    "/api/v1/support/createSupport",
    data
  );
  console.log(response.data)
  return response.data;
};

/**
 * Fetch all support tickets by company ID
 * @param companyId - The company ID
 * @returns Promise with the tickets response
 */
export const getAllSupportTicketsByCompany = async (
  companyId: string
): Promise<GetAllSupportTicketsByCompanyResponse> => {
  console.log(companyId)
  const response =
    await axiosInstance.get<GetAllSupportTicketsByCompanyResponse>(
      `/api/v1/support/getSupportsByCompany/${companyId}`
    );
    
  return response.data;
};

/**
 * Fetch a single support ticket by ID
 * @param ticketId - The ticket ID
 * @returns Promise with the ticket response
 */
export const getSupportTicketById = async (
  ticketId: string
): Promise<GetSupportTicketByIdResponse> => {
  const response = await axiosInstance.get<GetSupportTicketByIdResponse>(
    `/api/v1/users/getSupportTicket/${ticketId}`
  );
  return response.data;
};

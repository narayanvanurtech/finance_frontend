import axios from "axios";

export interface ContactUsRequest {
  name: string;
  email: string;
  mobile: string;
  message: string;
  status?: string; // Added optional status field
}

export interface ContactUsResponse {
  message: string;
  data: ContactUsRequest;
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://vanurmedia.in/api/v1',
  headers: {
    'Content-Type': 'application/json',
  }
});

export const contactUs = async (
  data: ContactUsRequest
): Promise<ContactUsResponse> => {
  // Add default status if not provided
  const requestData = {
    ...data,
    status: data.status || 'new'
  };

  const response = await api.post<ContactUsResponse>(
    "/api/v1/user/createContact", // Fixed: Changed from "users" to "user"
    requestData
  );
  return response.data;
};
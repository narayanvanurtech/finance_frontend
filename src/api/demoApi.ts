// src/api/demoApi.ts
import axios from 'axios';

export interface BookDemoRequest {
  name: string;
  email: string;
  mobile: string;
  scheduledAt: string;
}

export interface BookDemoResponse {
  message: string;
  data: BookDemoRequest;
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://vanurmedia.in/api/v1'
});

export const bookDemo = async (data: BookDemoRequest): Promise<BookDemoResponse> => {
  try {
    const response = await api.post<BookDemoResponse>('/api/v1/user/createBooking', data);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
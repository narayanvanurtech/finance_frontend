import axiosInstance from '@/utils/axios';

export interface AddTemplateRequest {
  name: string;
  subject: string;
  html: string;
  templateId?: string;
}

export const addTemplate = async (data: AddTemplateRequest) => {
  const response = await axiosInstance.post('/api/v1/email/createEmailTemplate', data);
  return response.data;
};

export interface Template {
  _id: string;
  name: string;
  subject: string;
  html?: string;
  templateId?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface GetAllTemplatesResponse {
  success: boolean;
  statusCode: number;
  message: string;
  result: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    templates: Template[];
  };
}

export const getAllTemplates = async (): Promise<GetAllTemplatesResponse> => {
  const response = await axiosInstance.get('/api/v1/email/getAllEmailTemplates');
  return response.data;
};

export interface GetTemplateByIdResponse {
  success: boolean;
  statusCode: number;
  message: string;
  result: Template;
}

export const getTemplateById = async (templateId: string): Promise<GetTemplateByIdResponse> => {
  try {
    console.log(`API: Fetching template with ID ${templateId}`);
    const response = await axiosInstance.get(`/api/v1/email/getEmailTemplateById/${templateId}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch template');
    }
    
    return response.data;
  } catch (error: any) {
    console.error(`API error fetching template with ID ${templateId}:`, error);
    throw error?.response?.data || error;
  }
};

export const updateTemplate = async (templateId: string, data: Partial<AddTemplateRequest>) => {
  const response = await axiosInstance.put(`/api/v1/email/updateEmailTemplate/${templateId}`, data);
  return response.data;
};

export const deleteTemplate = async (templateId: string) => {
  const response = await axiosInstance.delete(`/api/v1/email/deleteEmailTemplate/${templateId}`);
  return response.data;
};

import axiosInstance from "@/utils/axios";

export interface SendEmailRequest {
  email: string;
  subject: string;
  message: string;
}

export interface SendBulkEmailRequest {
  emails: string[];
  subject: string;
  message: string;
}

export interface SendEmailResponse {
  success: boolean;
  message: string;
}

export const sendEmailToLead = async (
  data: SendEmailRequest
): Promise<SendEmailResponse> => {
  try {
    const response = await axiosInstance.post("/api/v1/lead/sendEmail", data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to send email");
  }
};

export const sendBulkEmailsToLeads = async (
  data: SendBulkEmailRequest
): Promise<SendEmailResponse> => {
  try {
    const response = await axiosInstance.post(
      "/api/v1/lead/sendBulkEmails",
      data
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to send bulk emails"
    );
  }
};

// src/api/companyApi.ts
import axiosInstance from "@/utils/axios";

export interface CreateCompanyRequest {
  companyName: string;
  industry: string;
  size: string;
}

export interface CompanyUser {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export interface CompanyDetails {
  _id: string;
  companyId: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: string;
  companyName: string;
  companyUniqueId: string;
  industry: string;
  size: string;
  managers: CompanyUser[];
  users: CompanyUser[];
}

export interface CreateCompanyResponse {
  success: boolean;
  statusCode: number;
  message: string;
  result: CompanyDetails;
}

export interface GetCompanyResponse {
  success: boolean;
  statusCode: number;
  message: string;
  result: CompanyDetails;
}

export const createCompany = async (
  userId: string,
  data: CreateCompanyRequest
): Promise<CreateCompanyResponse> => {
  const response = await axiosInstance.post<CreateCompanyResponse>(
    `/api/v1/admin/createCompany/${userId}`,
    data
  );
  return response.data;
};

export const getCompanyDetails = async (
  companyId: string
): Promise<GetCompanyResponse> => {
  const response = await axiosInstance.get<GetCompanyResponse>(
    `/api/v1/admin/getCompanyDetails/${companyId}`
  );
  return response.data;
};

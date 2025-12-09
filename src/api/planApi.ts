import axiosInstance from '@/utils/axios';

// Type definitions based on your API response
export interface Module {
  _id: string;
  name: string;
  description: string;
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface BillingCycle {
  monthly: {
    price: number;
  };
  yearly: {
    price: number;
  };
}

export interface Plan {
  _id: string;
  name: string;
  description: string;
  isActive: boolean;
  maxUsers: number;
  maxManagers: number;
  billingCycle: BillingCycle;
  modules: Module[];
  __v: number;
}


export interface PlansResponse {
  success: boolean;
  statusCode: number;
  message: string;
  result: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    plans: Plan[];
  };
}

export interface GetAllPlansParams {
  page?: number;
  limit?: number;
}

export const getAllPlans = async (params: GetAllPlansParams = {}): Promise<PlansResponse> => {
  const { page = 1, limit = 10 } = params;
  
  const response = await axiosInstance.get<PlansResponse>(
    `/api/v1/plan/getAllPlans`,
    {
      params: {
        page,
        limit
      }
    }
  );
  
  return response.data;
};
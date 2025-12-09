// src/api/upgradePlan.ts
import axiosInstance from "@/utils/axios";

export interface UpgradePlanRequest {
  userId: string;
  planId: string;
  billingCycle: "monthly" | "yearly";
}

export interface UpgradePlanResponse {
  success: boolean;
  statusCode: number;
  message: string;
  result: {
    subscription: {
      _id: string;
      user: string;
      plan: string;
      billingCycle: string;
      subscriptionStatus: string;
      startedAt: string;
      expiresAt: string;
      price: number;
      transactionId: string;
      paymentStatus: string;
      reminder: boolean;
      createdAt: string;
      updatedAt: string;
      __v: number;
      merchantOrderId?: string;
      redirectUrl?: string;
      paymentUrl?: string;
    };
  };
}

export const upgradePlan = async (data: UpgradePlanRequest): Promise<UpgradePlanResponse> => {
  try {
    const response = await axiosInstance.post<UpgradePlanResponse>(
      "/api/v1/subscription/upgradePlan",
      data
    );
    return response.data;
  } catch (error) {
    console.error('Upgrade Plan API Error:', error);
    throw error;
  }
};

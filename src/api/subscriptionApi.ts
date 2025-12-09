import axiosInstance from "@/utils/axios";

export interface GetSubscriptionRequest {
  userId: string;
  planId: string;
  billingCycle: "monthly" | "yearly" | string;
}

export interface GetSubscriptionResponse {
  success: boolean;
  message: string;
  subscriptionId: string;
  paymentUrl: string;
  gstAmount: string;
  totalAmount: string;
}

/**
 * Fetch subscription details for a user and plan
 * @param data - Subscription request data
 * @returns Promise with the subscription response
 */
export const getSubscription = async (
  data: GetSubscriptionRequest
): Promise<GetSubscriptionResponse> => {
  const response = await axiosInstance.post<GetSubscriptionResponse>(
    "/api/v1/users/getSubscription",
    data
  );
  return response.data;
};

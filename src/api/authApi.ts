// src/api/authApi.ts
import axiosInstance from "@/utils/axios";

interface Address {
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  name: string;
  mobile: string;
  companyName: string;
  role: string;
  isActive: boolean;
  companySize: string;
  industry: string;
}

export const defaultRegisterFormValues: RegisterFormData = {
  email: "",
  password: "",
  name: "",
  mobile: "",
  companyName: "",
  role: "admin",
  isActive: true,
  companySize: "11-50",
  industry: "",
};

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  mobile: string;
  role: string;
}

export const companySizeOptions = ["small", "medium", "large"] as const;

export const industryOptions = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Retail",
  "Manufacturing",
  "Real Estate",
  "Consulting",
  "Marketing",
  "Other",
] as const;

interface RegisterResponse {
  success: boolean;
  statusCode: number;
  message: string;
  result: {
    _id: string;
    email: string;
    name: string;
    mobile: string;
    role: string;
    manager: string | null;
    company: string | null;
    isActive: boolean;
    deviceTokens: string[];
    profilePic: string | null;
    lastLoginDate: string | null;
    tokens: string | null;
    refreshTokens: string | null;
    tempTokens: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
}

interface LoginResponse {
  success: boolean;
  statusCode: number;
  message: string;
  result: {
    user: {
      _id: string;
      email: string;
      name: string;
      mobile: string;
      role: string;
      manager: string | null;
      company: string | null;
      isActive: boolean;
      deviceTokens: string[];
      profilePic: string | null;
      lastLoginDate: string;
      tokens: string;
      refreshTokens: string;
      tempTokens: string | null;
      createdAt: string;
      updatedAt: string;
      __v: number;
    };
    subscription?: {
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
    } | null;
  };
}

interface RefreshTokenResponse {
  success: boolean;
  statusCode: number;
  message: string;
  result: {
    tokens: string;
    refreshTokens: string;
  };
}

export async function login(
  email: string,
  password: string,
  deviceToken: string
) {
  const response = await axiosInstance.post<LoginResponse>("/api/v1/user/login", {
    email,
    password,
    deviceToken,
  });

  return response.data;
}

export const register = async (
  data: RegisterRequest
): Promise<RegisterResponse> => {
  const response = await axiosInstance.post<RegisterResponse>(
    "/api/v1/user/register",
    {
      name: data.name,
      email: data.email,
      password: data.password,
      mobile: data.mobile,
      role: data.role,
    }
  );
  return response.data;
};

export const logout = async (userId: string, deviceToken: string) => {
  const response = await axiosInstance.post(`/api/v1/user/logout`, {
    userId,
    deviceToken,
  });
  return response.data;
};

export const generateNewTokens = async (refresh_token: string) => {
  try {
    const response = await axiosInstance.post<RefreshTokenResponse>(
      "/api/v1/user/generatedAuthNewToken",
      {
        refresh_token,
      }
    );
    return response.data.result;
  } catch (error) {
    throw error;
  }
};

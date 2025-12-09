// ... existing code ...

import axiosInstance from "@/utils/axios";

export interface User {
  _id: string;
  email: string;
  name: string;
  mobile: string;
  userType: string;
  isActive: boolean;
  deviceTokens: string[];
  status: number;
  signupStatus: number;
  tokens: string | null;
  refreshTokens: string | null;
  tempTokens: string | null;
  createdAt: string;
  updatedAt: string;
  profilePic: string | null;
  companyName?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
}

export interface GetAllUsersResponse {
  statusCode: number;
  status: string;
  message: string;
  data: {
    totalPages: number;
    currentPage: number;
    totalUsers: number;
    users: User[];
  };
}

export async function getAllUsers(
  userType: string,
  page: number = 1,
  limit: number = 10
) {
  const response = await axiosInstance.get<GetAllUsersResponse>(
    "/api/v1/users/getAllUsers",
    {
      params: { userType, page, limit },
    }
  );
  return response.data.data.users;
}

export async function getUserById(id: string) {
  const response = await axiosInstance.get(`/api/v1/users/${id}`);
  return response.data;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  mobile: string;
  password: string;
  userType: string;
}

export async function createUser(userData: CreateUserRequest) {
  const response = await axiosInstance.post("/api/v1/users/addUsers", userData);
  return response.data;
}

export async function updateUser(id: string, userData: Partial<User>) {
  const response = await axiosInstance.put(`/api/v1/users/${id}`, userData);
  return response.data;
}

export async function deleteUser(id: string) {
  const response = await axiosInstance.delete(`/api/v1/users/deleteUser/${id}`);
  return response.data;
}

export async function toggleUserActiveStatus(id: string, isActive: boolean) {
  const response = await axiosInstance.put(
    `/api/v1/users/UserActiveOrDeactive/${id}/status/${isActive}`
  );
  return response.data;
}

export async function getProfile(id: string) {
  const response = await axiosInstance.get(`/api/v1/users/getProfile/${id}`);
  return response.data;
}

export async function updateProfile(
  id: string,
  profileData: {
    name: string;
    email: string;
    mobile: string;
    companyName?: string;
    address?: {
      street: string;
      city: string;
      state: string;
      pincode: string;
      country: string;
    };
  }
) {
  const response = await axiosInstance.put(
    `/api/v1/users/updateProfile/${id}`,
    profileData
  );
  return response.data;
}

export async function uploadProfilePic(file: File) {
  const formData = new FormData();
  formData.append("image", file);

  const response = await axiosInstance.post(
    `/api/v1/users/uploadProfilePic`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
}

// ... existing code ...

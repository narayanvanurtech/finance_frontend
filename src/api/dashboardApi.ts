import axiosInstance from "@/utils/axios";

// Fetch admin dashboard data
export const getAdminDashboard = async () => {
  const response = await axiosInstance.get("/api/v1/dashboard/getDashboard");
  return response.data;
};

// Fetch general dashboard data
export const getUserDashboard = async () => {
  const response = await axiosInstance.get("/api/v1/dashboard/getDashboard");
  return response.data;
};

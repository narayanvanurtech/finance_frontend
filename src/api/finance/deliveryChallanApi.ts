import axiosInstance from "@/utils/axios";

export const deliveryChallanApi = {
  createChallan: async (payload: any, companyId: string) => {
    const res = await axiosInstance.post(
      `/api/v1/finance/sales/delivery-challans/create?companyId=${companyId}`,
      payload
    );
    return res.data;
  },

  getChallans: async (companyId: string) => {
    const res = await axiosInstance.get(
      `/api/v1/finance/sales/delivery-challans/getAll?companyId=${companyId}`
    );
    return res.data;
  },

  // 🔥 GET BY ID
  getChallanById: async (id: string, companyId: string) => {
    const res = await axiosInstance.get(
      `/api/v1/finance/sales/delivery-challans/${id}?companyId=${companyId}`
    );
    return res.data;
  },

  // 🔥 UPDATE Challan
  updateChallan: async (id: string, payload: any, companyId: string) => {
    const res = await axiosInstance.put(
      `/api/v1/finance/sales/delivery-challans/${id}?companyId=${companyId}`,
      payload
    );
    return res.data;
  },

  // 🔥 STATUS UPDATE
  updateStatus: async (id: string, status: string, companyId: string) => {
    const res = await axiosInstance.patch(
      `/api/v1/finance/sales/delivery-challans/${id}/status?companyId=${companyId}`,
      { status }
    );
    return res.data;
  },

  // 🔥 DELETE
  deleteChallan: async (id: string, companyId: string) => {
    const res = await axiosInstance.delete(
      `/api/v1/finance/sales/delivery-challans/${id}?companyId=${companyId}`
    );
    return res.data;
  },

  // 🔥 DUPLICATE
  duplicateChallan: async (id: string, companyId: string) => {
    const res = await axiosInstance.post(
      `/api/v1/finance/sales/delivery-challans/${id}/duplicate?companyId=${companyId}`
    );
    return res.data;
  },

  // 🔥 BULK ACTIONS
  bulkAction: async (body: any, companyId: string) => {
    console.log("Bulk action body:", body);
    const payload = {
      action: body.action,
      deliveryChallanIds: body.ids,
    };
    const res = await axiosInstance.post(
      `/api/v1/finance/sales/delivery-challans/bulk-actions?companyId=${companyId}`,
      payload
    );
    return res.data;
  },

  // 🔥 STATS
  getStats: async (companyId: string) => {
    const res = await axiosInstance.get(
      `/api/v1/finance/sales/delivery-challans/stats?companyId=${companyId}`
    );
    return res.data;
  },

  // 🔥 NEXT NUMBER PREVIEW
  previewNumber: async (companyId: string) => {
    const res = await axiosInstance.get(
      `/api/v1/finance/sales/delivery-challans/preview-number?companyId=${companyId}`
    );
    return res.data;
  },

  // 🔥 SEARCH
  searchChallan: async (query: string, companyId: string) => {
    const res = await axiosInstance.get(
      `/api/v1/finance/sales/delivery-challans/search?companyId=${companyId}&query=${query}`
    );
    return res.data;
  },
};

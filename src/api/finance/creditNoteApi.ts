import axiosInstance from "@/utils/axios";

export const creditNoteApi = {
  create: async (payload: any, companyId: string) => {
    const res = await axiosInstance.post(
      `/api/v1/finance/sales/credit-notes`,
      { ...payload, companyId }
    );
    return res.data;
  },

  getAll: async (companyId: string) => {
    const res = await axiosInstance.get(
      `/api/v1/finance/purchases/credit-notes?companyId=${companyId}`
    );
    return res.data;
  },

  getSingle: async (id: string, companyId: string) => {
    const res = await axiosInstance.get(
      `/api/v1/finance/purchases/credit-notes/${id}?companyId=${companyId}`
    );
    return res.data;
  },

  update: async (id: string, payload: any, companyId: string) => {
    const res = await axiosInstance.put(
      `/api/v1/finance/purchases/credit-notes/${id}?companyId=${companyId}`,
      payload
    );
    return res.data;
  },

  delete: async (id: string, companyId: string) => {
    const res = await axiosInstance.delete(
      `/api/v1/finance/purchases/credit-notes/${id}?companyId=${companyId}`
    );
    return res.data;
  },
};

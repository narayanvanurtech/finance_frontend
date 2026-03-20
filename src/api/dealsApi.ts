import axios from "../utils/axios";

export interface Deal {
  _id: string;
  dealName: string;
  accountName: string;
  dealOwner: string;
  amount: string;
  rawAmount: number;
  closingDate: string;
  rawDate: string;
  probability: number;
  expectedRevenue: number;
  type: string;
  leadSource: string;
}

export interface DealStage {
  stage: string;
  totalAmount: number;
  deals: Deal[];
}

export interface DealsResponse {
  statusCode: number;
  status: string;
  message: string;
  data: DealStage[];
}

export interface CreateDealPayload {
  dealName: string;
  accountName: string;
  amount: string;
  closingDate: string;
  probability: number;
  type: string;
  leadSource: string;
  stage?: string; // Made optional since API only uses type
  expectedRevenue: number; // Required as a number
  nextStep?: string;
  dealOwner?: string; // Optional field
}

export interface UpdateDealStagePayload {
  newStage: string;
}

export interface DealFilters {
  dealName?: string;
  type?: string;
  leadSource?: string;
  stage?: string;
  minAmount?: number;
  maxAmount?: number;
  startDate?: string;
  endDate?: string;
}

const dealApi = {
  getAllDeals: async (filters?: DealFilters) => {
    try {
      const queryParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== "") {
            queryParams.append(key, value.toString());
          }
        });
      }
      const queryString = queryParams.toString();
      const url = queryString
        ? `/api/v1/deal/getAllDeals?${queryString}`
        : "/api/v1/deal/getAllDeals";
      //console.log("API URL:", url);
      const response = await axios.get<DealsResponse>(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getDeals: async (filters?: DealFilters) => {
    try {
      const queryParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== "") {
            queryParams.append(key, value.toString());
          }
        });
      }
      const queryString = queryParams.toString();
      const url = queryString
        ? `/api/v1/deal/getDeals?${queryString}`
        : "/api/v1/deal/getDeals";
      //console.log("API URL:", url);
      const response = await axios.get<DealsResponse>(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getDealById: async (id: string) => {
    try {
      const response = await axios.get(`/api/v1/deal/getDeal/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createDeal: async (dealData: CreateDealPayload) => {
    try {
      const response = await axios.post("/api/v1/deal/addDeal", dealData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateDeal: async (dealId: string, dealData: CreateDealPayload) => {
    try {
      const response = await axios.put(
        `/api/v1/deal/updateDeal/${dealId}`,
        dealData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateDealStage: async (
    dealId: string,
    stageData: UpdateDealStagePayload
  ) => {
    try {
      const response = await axios.put(
        `/api/v1/deal/updateDealStage/${dealId}`,
        stageData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteDeal: async (dealId: string) => {
    try {
      const response = await axios.delete(`/api/v1/deal/deleteDeal/${dealId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  bulkDeleteDeals: async (dealIds: string[]) => {
    try {
      const response = await axios.delete("/api/v1/deal/deleteAllDeals", {
        data: { dealIds },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default dealApi;

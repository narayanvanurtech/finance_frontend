// src/stores/salesCrmStore/useUpgradePlanStore.ts
import { create } from "zustand";
import { upgradePlan, UpgradePlanRequest, UpgradePlanResponse } from "@/api/upgradePlan";

interface UpgradePlanState {
  loading: boolean;
  error: string | null;
  upgradeResponse: UpgradePlanResponse | null;
}

interface UpgradePlanActions {
  upgradePlan: (data: UpgradePlanRequest) => Promise<UpgradePlanResponse>;
  clearError: () => void;
  clearUpgradeResponse: () => void;
}

type UpgradePlanStore = UpgradePlanState & UpgradePlanActions;

export const useUpgradePlanStore = create<UpgradePlanStore>()((set, get) => ({
  // Initial state
  loading: false,
  error: null,
  upgradeResponse: null,

  // Actions
  upgradePlan: async (data: UpgradePlanRequest) => {
    set({ loading: true, error: null });
    
    try {
      const response = await upgradePlan(data);
      
      if (!response.success) {
        throw new Error(response.message || "Plan upgrade failed");
      }
      
      set({ 
        loading: false, 
        upgradeResponse: response, 
        error: null 
      });
      
      return response;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || "Failed to upgrade plan";
      set({ 
        loading: false, 
        error: errorMessage, 
        upgradeResponse: null 
      });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },

  clearUpgradeResponse: () => {
    set({ upgradeResponse: null });
  },
}));

import { create } from 'zustand';
import dealApi, { Deal, DealStage, CreateDealPayload, UpdateDealStagePayload, DealFilters } from '@/api/dealsApi';

interface DealsState {
  dealStages: DealStage[];
  currentDeal: Deal | null;
  totalDeals: number;
  isLoading: boolean;
  error: string | null;
  filters: DealFilters;
  fetchDeals: (filters?: DealFilters) => Promise<void>;
  fetchUserDeals: (filters?: DealFilters) => Promise<void>;
  setFilters: (filters: DealFilters) => void;
  clearFilters: () => void;
  addDeal: (deal: CreateDealPayload) => Promise<void>;
  getDealById: (dealId: string) => Deal | undefined;
  updateDeal: (dealId: string, data: CreateDealPayload) => Promise<void>;
  updateDealStage: (dealId: string, stageData: UpdateDealStagePayload) => Promise<void>;
  deleteDeal: (dealId: string) => Promise<void>;
  bulkDeleteDeals: (dealIds: string[]) => Promise<void>;
}

export const useDealsStore = create<DealsState>((set, get) => ({
  dealStages: [],
  currentDeal: null,
  totalDeals: 0,
  isLoading: false,
  error: null,
  filters: {},

  setFilters: (newFilters: DealFilters) => {
    set(state => ({ filters: { ...state.filters, ...newFilters } }));
    get().fetchDeals(newFilters);
  },

  clearFilters: () => {
    set({ filters: {} });
    get().fetchDeals();
  },

  fetchDeals: async (filters?: DealFilters) => {
    try {
      set({ isLoading: true, error: null });
      const response = await dealApi.getAllDeals(filters);

      if (response.statusCode === 200 && Array.isArray(response.data)) {
        set({ 
          dealStages: response.data,
          totalDeals: response.data.reduce((total, stage) => total + stage.deals.length, 0),
          isLoading: false 
        });
      } else {
        console.error("Unexpected API response structure:", response);
        set({ 
          error: "Invalid API response structure",
          isLoading: false 
        });
      }
    } catch (error) {
      console.error("Error fetching deals:", error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch deals',
        isLoading: false 
      });
    }
  },

  fetchUserDeals: async (filters?: DealFilters) => {
    try {
      set({ isLoading: true, error: null });
      const response = await dealApi.getDeals(filters);

      if (response.statusCode === 200 && Array.isArray(response.data)) {
        set({ 
          dealStages: response.data,
          totalDeals: response.data.reduce((total, stage) => total + stage.deals.length, 0),
          isLoading: false 
        });
      } else {
        console.error("Unexpected API response structure:", response);
        set({ 
          error: "Invalid API response structure",
          isLoading: false 
        });
      }
    } catch (error) {
      console.error("Error fetching deals:", error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch deals',
        isLoading: false 
      });
    }
  },

  addDeal: async (dealData: CreateDealPayload) => {
    try {
      set({ isLoading: true, error: null });
      const response = await dealApi.createDeal(dealData);
      // Refresh the deals list after adding
      await get().fetchDeals();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add deal',
        isLoading: false 
      });
      throw error;
    }
  },

  getDealById: (dealId: string) => {
    const { dealStages } = get();
    for (const stage of dealStages) {
      const deal = stage.deals.find(d => d._id === dealId);
      if (deal) return deal;
    }
    return undefined;
  },

  updateDeal: async (dealId: string, data: CreateDealPayload) => {
    try {
      set({ isLoading: true, error: null });
      const response = await dealApi.updateDeal(dealId, data);
      if (response.data) {
        await get().fetchDeals();
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update deal',
        isLoading: false 
      });
      throw error;
    }
  },

  updateDealStage: async (dealId: string, stageData: UpdateDealStagePayload) => {
    try {
      set({ isLoading: true, error: null });
      const response = await dealApi.updateDealStage(dealId, stageData);
      
      if (response.statusCode === 200) {
        // Refresh the deals list after successful update
        await get().fetchDeals();
      } else {
        set({ 
          error: response.message || 'Failed to update deal stage',
          isLoading: false 
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update deal stage';
      set({ 
        error: errorMessage,
        isLoading: false 
      });
      throw new Error(errorMessage);
    }
  },

  deleteDeal: async (dealId: string) => {
    try {
      set({ isLoading: true, error: null });
      await dealApi.deleteDeal(dealId);
      await get().fetchDeals();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete deal',
        isLoading: false 
      });
      throw error;
    }
  },

  bulkDeleteDeals: async (dealIds: string[]) => {
    try {
      set({ isLoading: true, error: null });
      await dealApi.bulkDeleteDeals(dealIds);
      await get().fetchDeals();

            setTimeout(() => {
        window.location.reload();
      }, 1000);

      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete deals',
        isLoading: false 
      });
      throw error;
    }
  }
}));

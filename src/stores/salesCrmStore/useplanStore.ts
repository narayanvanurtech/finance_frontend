import { create } from 'zustand';
import { getAllPlans } from '@/api/planApi';
import { persist } from 'zustand/middleware';

export type Module = {
  _id: string;
  name: string;
  description: string;
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

export type BillingCycle = {
  monthly: {
    price: number;
  };
  yearly: {
    price: number;
  };
};

export type Plan = {
  _id: string;
  name: string;
  description: string;
  isActive: boolean;
  maxUsers: number;
  maxManagers: number;
  billingCycle: BillingCycle;
  modules: Module[];
  __v: number;
};

interface PlanStore {
  plans: Plan[];
  loading: boolean;
  error: string | null;
  fetchPlans: () => Promise<void>;
}

export const usePlanStore = create<PlanStore>()(
  persist(
    (set) => ({
      plans: [],
      loading: false,
      error: null,
      fetchPlans: async () => {
        set({ loading: true, error: null });
        try {
          const res = await getAllPlans();
          if (res.success && res.statusCode === 200) {
            set({ plans: res.result.plans, loading: false });
          } else {
            set({ error: res.message || 'Failed to fetch plans', loading: false });
          }
        } catch (error: any) {
          set({ error: error?.message || 'Failed to fetch plans', loading: false });
        }
      },
    }),
    {
      name: 'plan-store',
      partialize: (state) => ({ plans: state.plans }),
    }
  )
);

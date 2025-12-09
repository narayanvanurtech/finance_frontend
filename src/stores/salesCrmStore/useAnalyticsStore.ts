import { create } from 'zustand';
import { getallanalytics, getUserAnalytics, UserAnalyticsData } from '@/api/analyticsApi';

interface Last3MonthsData {
  months: string[];
  leadsCreated: number[];
  dealsCreated: number[];
  dealsWon: number[];
  revenueWon: number[];
  openAmount: number[];
}

interface LeadsBySource {
  labels: string[];
  data: number[];
}

interface AnalyticsData {
  leadsThisMonth: number;
  revenueThisMonth: number;
  dealsInPipeline: number;
  accountsThisMonth: number;
  last3Months: Last3MonthsData;
  leadsBySource: LeadsBySource;
  topSalesReps: any[];
}

interface AnalyticsStore {
  analytics: AnalyticsData | null;
  isLoading: boolean;
  error: string | null;
  userAnalytics: UserAnalyticsData | null;
  isUserAnalyticsLoading: boolean;
  userAnalyticsError: string | null;
  fetchAnalytics: () => Promise<void>;
  fetchUserAnalytics: () => Promise<void>;
}

// User analytics in this store is fully typed and matches the backend response structure (see UserAnalyticsData in analyticsApi.ts)
// It is used in /user/analytics/page.tsx for the user analytics dashboard UI
const useAnalyticsStore = create<AnalyticsStore>((set) => ({
  analytics: null,
  isLoading: false,
  error: null,
  userAnalytics: null,
  isUserAnalyticsLoading: false,
  userAnalyticsError: null,
  fetchAnalytics: async () => {
    try {
      set({ isLoading: true, error: null });
      const data = await getallanalytics();
      set({ analytics: data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch analytics', 
        isLoading: false 
      });
    }
  },
  fetchUserAnalytics: async () => {
    try {
      set({ isUserAnalyticsLoading: true, userAnalyticsError: null });
      const response = await getUserAnalytics();
      set({ userAnalytics: response.data, isUserAnalyticsLoading: false });
    } catch (error) {
      set({
        userAnalyticsError: error instanceof Error ? error.message : 'Failed to fetch user analytics',
        isUserAnalyticsLoading: false
      });
    }
  },
}));

export default useAnalyticsStore;

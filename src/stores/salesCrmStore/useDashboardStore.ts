import { create } from 'zustand';
import { getUserDashboard, getAdminDashboard } from '@/api/dashboardApi';

// Types based on new API response
export interface KPIValue {
  count?: number;
  amount?: number;
  percentage?: string;
  growth: string;
  target: number;
  completion: string;
}

export interface TopKPIs {
  totalLeads: KPIValue;
  totalDeals: KPIValue;
  conversionRate: KPIValue;
  activeUsers: KPIValue;
  revenueClosed: KPIValue;
}

export interface TeamPerformance {
  name: string;
  role: string;
  leads: number;
  deals: number;
  revenue: number;
  score: number;
}

export interface LeadsFunnelStage {
  stage: string;
  count: number;
  percentage: string;
}

export interface LeadsFunnel {
  totalLeads: number;
  stages: LeadsFunnelStage[];
}

export interface DealsFunnelStage {
  stage: string;
  count: number;
  amount: number;
  percentage: string;
}

export interface DealsFunnel {
  totalDeals: number;
  stages: DealsFunnelStage[];
}

export interface TaskPipelineStage {
  stage: string;
  count: number;
}

export interface TaskPipeline {
  totalTasks: number;
  stages: TaskPipelineStage[];
}

export interface LeadFunnelChartItem {
  label: string;
  count: number;
}

export interface ActivityHeatmap {
  [day: string]: {
    calls: number;
    meetings: number;
  };
}

export interface UpcomingMeeting {
  time: string;
  title: string;
  attendees: string[];
  type: string;
}

// For user dashboard API response
export interface UserDashboardKPI {
  count: number;
  trend?: string;
  trendValue?: string;
}

export interface UserDashboardKPIs {
  leads: UserDashboardKPI;
  deals: UserDashboardKPI;
  tasksDueToday: UserDashboardKPI;
  meetingsToday: { count: number };
  followUps: { count: number };
}

export interface UserDashboardCharts {
  dealsClosed: {
    labels: string[];
    data: number[];
  };
  conversionFunnel: {
    labels: string[];
    data: number[];
  };
}

export interface UserDashboardData {
  kpis: UserDashboardKPIs;
  charts: UserDashboardCharts;
}

export interface DashboardData {
  filter: string;
  teamPerformance: TeamPerformance[];
  leadsFunnel: LeadsFunnel;
  dealsFunnel: DealsFunnel;
  taskPipeline: TaskPipeline;
  leadFunnelChart: LeadFunnelChartItem[];
  ActivityHeatmap: ActivityHeatmap;
  upcomingMeetings: UpcomingMeeting[];
  topKPIs: TopKPIs;
}

interface DashboardStore {
  adminData: DashboardData | null;
  userData: UserDashboardData | null;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  fetchAdminDashboard: (force?: boolean) => Promise<void>;
  fetchUserDashboard: () => Promise<void>;
  exportDashboard: () => void;
}

// Cache duration in milliseconds (15 minutes)
const CACHE_DURATION = 15 * 60 * 1000;

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  adminData: null,
  userData: null,
  loading: false,
  error: null,
  lastFetched: null,
  fetchAdminDashboard: async (force = false) => {
    const now = Date.now();
    const { lastFetched, adminData } = get();
    
    // Return cached data if available and not expired
    if (!force && lastFetched && adminData && (now - lastFetched < CACHE_DURATION)) {
      return;
    }

    set({ loading: true, error: null });
    try {
      const res = await getAdminDashboard();
      set({ 
        adminData: res.data, 
        loading: false,
        lastFetched: Date.now()
      });
    } catch (error: any) {
      set({ error: error?.message || 'Failed to fetch admin dashboard', loading: false });
    }
  },
  fetchUserDashboard: async () => {
    set({ loading: true, error: null });
    try {
      const res = await getUserDashboard();
      set({ userData: res.data, loading: false });
    } catch (error: any) {
      set({ error: error?.message || 'Failed to fetch user dashboard', loading: false });
    }
  },
  exportDashboard: () => {
    const { adminData } = get();
    if (!adminData) return;
    const json = JSON.stringify(adminData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dashboard-export.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
}));

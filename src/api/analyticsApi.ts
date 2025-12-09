import axiosInstance from "@/utils/axios";

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

export async function getallanalytics(): Promise<any> {
  const response = await axiosInstance.get<any>(
    "/api/v1/dashboard/getAnalytics"
  );
  return response.data;
}

// User Analytics Types
export interface KPI {
  title: string;
  value: number | string;
  icon: string;
  change: string;
}

export interface ConversionFunnel {
  labels: string[];
  data: number[];
}

export interface ActivityDataset {
  label: string;
  data: number[];
}

export interface ActivityOverTime {
  labels: string[];
  datasets: ActivityDataset[];
}

export interface DealProgress {
  labels: string[];
  data: number[];
}

export interface SmartInsight {
  type: string;
  message: string;
}

export interface UserAnalyticsData {
  kpis: KPI[];
  conversionFunnel: ConversionFunnel;
  activityOverTime: ActivityOverTime;
  dealProgress: DealProgress;
  pendingTasks: any[];
  smartInsights: SmartInsight[];
}

export interface UserAnalyticsResponse {
  statusCode: number;
  status: string;
  message: string;
  data: UserAnalyticsData;
}

export async function getUserAnalytics(): Promise<UserAnalyticsResponse> {
  const response = await axiosInstance.get<UserAnalyticsResponse>(
    "/api/v1/dashboard/getUserAnalytics"
  );
  return response.data;
}

"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  DollarSign,
  Target,
  TrendingUp,
  RefreshCw,
  Download,
  ArrowRight,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { useAuthStore } from "@/stores/salesCrmStore/useAuthStore";
import { useDashboardStore } from '@/stores/salesCrmStore/useDashboardStore';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);


export default function AdminCRMDashboard() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("month");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const { user } = useAuthStore();

  // Dashboard store
  const {adminData, loading, error, fetchAdminDashboard, exportDashboard } = useDashboardStore();

  useEffect(() => {
    if (user) {
      fetchAdminDashboard(false); // false means use cache if available
    }
  }, [user, fetchAdminDashboard]);

  const refreshData = async () => {
    setIsRefreshing(true);
    await fetchAdminDashboard(true); // true means force refresh
    setIsRefreshing(false);
  };

  // KPI Cards from topKPIs
  const kpiCards = adminData ? [
    {
      title: 'Total Leads',
      value: adminData.topKPIs.totalLeads.count,
      icon: <Users className="h-6 w-6 text-indigo-600" />,
      growth: adminData.topKPIs.totalLeads.growth,
      target: adminData.topKPIs.totalLeads.target,
      completion: adminData.topKPIs.totalLeads.completion,
    },
    {
      title: 'Total Deals',
      value: adminData.topKPIs.totalDeals.count,
      icon: <Target className="h-6 w-6 text-indigo-600" />,
      growth: adminData.topKPIs.totalDeals.growth,
      target: adminData.topKPIs.totalDeals.target,
      completion: adminData.topKPIs.totalDeals.completion,
    },
    {
      title: 'Conversion Rate',
      value: adminData.topKPIs.conversionRate.percentage + '%',
      icon: <TrendingUp className="h-6 w-6 text-indigo-600" />,
      growth: adminData.topKPIs.conversionRate.growth,
      target: adminData.topKPIs.conversionRate.target,
      completion: adminData.topKPIs.conversionRate.completion,
    },
    {
      title: 'Active Users',
      value: adminData.topKPIs.activeUsers.count,
      icon: <Users className="h-6 w-6 text-indigo-600" />,
      growth: adminData.topKPIs.activeUsers.growth,
      target: adminData.topKPIs.activeUsers.target,
      completion: adminData.topKPIs.activeUsers.completion,
    },
    {
      title: 'Revenue Closed',
      value: adminData.topKPIs.revenueClosed.amount,
      icon: <DollarSign className="h-6 w-6 text-indigo-600" />,
      growth: adminData.topKPIs.revenueClosed.growth,
      target: adminData.topKPIs.revenueClosed.target,
      completion: adminData.topKPIs.revenueClosed.completion,
    },
  ] : [];

  // Leads Funnel Chart (use real API stages)
  const funnelData = adminData ? {
    labels: adminData.leadsFunnel.stages.map((item:any) => item.stage),
    datasets: [
      {
        label: 'Leads',
        data: adminData.leadsFunnel.stages.map((item:any) => item.count),
        backgroundColor: [
          '#4F46E5', '#6366F1', '#7C3AED', '#8B5CF6', '#A855F7', '#C084FC', '#10B981', '#F59E42', '#EF4444'
        ],
        borderRadius: 6,
        borderWidth: 0,
      },
    ],
  } : { labels: [], datasets: [] };

  // Activity Heatmap days
  const weekDays = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Error State */}
      {error && <div className="p-8 text-lg text-red-600">Error: {error}</div>}
      <div className="p-8 space-y-10">
        {/* Header (always visible) */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
            <p className="text-slate-500 text-base font-medium">
              Company-wide metrics & team performance
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={refreshData}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition shadow-sm"
            >
              <RefreshCw className={`h-4 w-4 text-slate-600 ${isRefreshing ? "animate-spin" : ""}`} />
              <span className="text-slate-700 font-medium">Refresh</span>
            </button>
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="px-5 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none text-slate-700 font-medium shadow-sm"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            <button
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition shadow"
              onClick={exportDashboard}
            >
              <Download className="h-4 w-4" />
              <span className="font-medium">Export</span>
            </button>
          </div>
        </div>
        {/* Content Loader or Dashboard Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <span className="block w-12 h-12 border-4 border-indigo-500 border-t-transparent border-solid rounded-full animate-spin"></span>
            <span className="text-lg text-indigo-700 font-semibold">Loading dashboard...</span>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {kpiCards.map((kpi, index) => (
                <Card key={index} className="bg-white border border-slate-200 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-slate-100 rounded-lg">{kpi.icon}</div>
                      <div className={`text-xs px-3 py-1.5 rounded-full font-semibold ${parseFloat(kpi.growth) > 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                        {parseFloat(kpi.growth) > 0 ? "+" : ""}{kpi.growth}%
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-slate-800">{kpi.value}</h3>
                      <p className="text-sm font-semibold text-slate-600">{kpi.title}</p>
                      <p className="text-xs text-slate-400">Target: {kpi.target}</p>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div className="bg-slate-400 h-2 rounded-full" style={{ width: `${parseFloat(kpi.completion)}%` }}></div>
                      </div>
                      <p className="text-xs text-slate-400 font-medium">{kpi.completion}% of target</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Leads Funnel Chart */}
            <Card className="bg-white border border-slate-200 shadow-sm">
              <CardContent className="p-8">
                <h3 className="text-lg font-bold mb-6 text-slate-800">Leads Funnel</h3>
                <div className="h-80">
                  <Bar data={funnelData} options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      title: { display: false },
                      tooltip: {
                        backgroundColor: "#1F2937",
                        titleColor: "#F9FAFB",
                        bodyColor: "#F9FAFB",
                        borderColor: "#4F46E5",
                        borderWidth: 1,
                        cornerRadius: 8,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: { color: "#F3F4F6" },
                        ticks: { color: "#6B7280" },
                      },
                      x: {
                        grid: { display: false },
                        ticks: { color: "#6B7280" },
                      },
                    },
                  }} />
                </div>
              </CardContent>
            </Card>

            {/* Deals Funnel Table */}
            <Card className="bg-white border border-slate-200 shadow-sm"> 
              <CardContent className="p-8">
                <h3 className="text-lg font-bold mb-6 text-slate-800">Deals Funnel</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Stage</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Count</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Amount</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Percentage</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                      {adminData?.dealsFunnel.stages.map((stage:any, idx:number) => (
                        <tr key={idx}>
                          <td className="px-4 py-2 whitespace-nowrap">{stage.stage}</td>
                          <td className="px-4 py-2 whitespace-nowrap">{stage.count}</td>
                          <td className="px-4 py-2 whitespace-nowrap">{stage.amount}</td>
                          <td className="px-4 py-2 whitespace-nowrap">{stage.percentage}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Team Performance Table */}
            <Card className="bg-white border border-slate-200 shadow-sm">
              <CardContent className="p-8">
                <h3 className="text-lg font-bold mb-6 text-slate-800">Team Performance</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Role</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Leads</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Deals</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Revenue</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Score</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                      {adminData?.teamPerformance.map((member:any, idx:number) => (
                        <tr key={idx}>
                          <td className="px-4 py-2 whitespace-nowrap">{member.name}</td>
                          <td className="px-4 py-2 whitespace-nowrap">{member.role}</td>
                          <td className="px-4 py-2 whitespace-nowrap">{member.leads}</td>
                          <td className="px-4 py-2 whitespace-nowrap">{member.deals}</td>
                          <td className="px-4 py-2 whitespace-nowrap">{member.revenue}</td>
                          <td className="px-4 py-2 whitespace-nowrap">{member.score}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Task Pipeline */}
            <Card className="bg-white border border-slate-200 shadow-sm">
              <CardContent className="p-8">
                <h3 className="text-lg font-bold mb-6 text-slate-800">Task Pipeline</h3>
                <div className="space-y-4">
                  {adminData?.taskPipeline.stages.map((stage:any, idx:number) => (
                    <div key={idx} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-semibold text-slate-800">{stage.stage}</p>
                          <p className="text-sm font-bold text-slate-800">{stage.count}</p>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div className="bg-indigo-400 h-2 rounded-full" style={{ width: `${(stage.count / Math.max(...adminData.taskPipeline.stages.map((t:any) => t.count))) * 100}%` }}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-slate-200 text-center">
                  <p className="text-2xl font-bold text-slate-800">{adminData?.taskPipeline.totalTasks}</p>
                  <p className="text-sm text-slate-500 font-medium mt-1">Total Tasks</p>
                </div>
              </CardContent>
            </Card>

            {/* Activity Heatmap */}
            <Card className="bg-white border border-slate-200 shadow-sm">
              <CardContent className="p-8">
                <h3 className="text-lg font-bold mb-6 text-slate-800">Weekly Activity</h3>
                <div className="space-y-4">
                  {weekDays.map((day, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="w-20 text-sm font-bold text-indigo-600">{day}</div>
                      <div className="flex-1 flex gap-2">
                        <div className="flex-1 bg-indigo-50 rounded-lg h-8 flex items-center justify-center relative overflow-hidden">
                          <div className="bg-indigo-600 h-full rounded-lg" style={{ width: `${((adminData?.ActivityHeatmap[day]?.calls || 0) / 10) * 100}%` }}></div>
                          <span className="absolute text-xs font-bold text-indigo-700">{adminData?.ActivityHeatmap[day]?.calls || 0}</span>
                        </div>
                        <div className="flex-1 bg-indigo-50 rounded-lg h-8 flex items-center justify-center relative overflow-hidden">
                          <div className="bg-indigo-300 h-full rounded-lg" style={{ width: `${((adminData?.ActivityHeatmap[day]?.meetings || 0) / 10) * 100}%` }}></div>
                          <span className="absolute text-xs font-bold text-indigo-700">{adminData?.ActivityHeatmap[day]?.meetings || 0}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-slate-200 flex justify-center gap-8">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-indigo-600 rounded"></div>
                    <span className="text-sm text-indigo-700 font-medium">Calls</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-indigo-300 rounded"></div>
                    <span className="text-sm text-indigo-700 font-medium">Meetings</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Meetings */}
            <Card className="bg-white border border-slate-200 shadow-sm">
              <CardContent className="p-8">
                <h3 className="text-lg font-bold mb-6 text-slate-800">Upcoming Meetings</h3>
                <div className="space-y-3">
                  {adminData?.upcomingMeetings.map((meeting:any, idx:number) => (
                    <div key={idx} className="flex items-center gap-4 p-4 rounded-lg border bg-slate-50 border-slate-200">
                      <div className="text-sm font-mono font-bold text-slate-700 w-32 text-center">{new Date(meeting.time).toLocaleString()}</div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-800">{meeting.title}</p>
                        <p className="text-xs text-slate-500 font-medium">{meeting.attendees.length} attendees</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-400" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

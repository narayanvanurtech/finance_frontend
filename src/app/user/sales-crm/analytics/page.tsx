'use client';

import { useEffect } from 'react';
import useAnalyticsStore from '@/stores/salesCrmStore/useAnalyticsStore';
import { Card } from "@/components/ui/card";
import { 
  Users, 
  Briefcase, 
  TrendingUp, 
  CheckCircle, 
  PhoneCall 
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
);

const iconMap: Record<string, any> = {
  users: Users,
  briefcase: Briefcase,
  trendingUp: TrendingUp,
  checkCircle: CheckCircle,
  phoneCall: PhoneCall,
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
  },
};

export default function AnalyticsPage() {
  const {
    userAnalytics,
    isUserAnalyticsLoading,
    userAnalyticsError,
    fetchUserAnalytics
  } = useAnalyticsStore();

  useEffect(() => {
    fetchUserAnalytics();
  }, [fetchUserAnalytics]);

  if (isUserAnalyticsLoading) {
    return <div className="p-6">Loading analytics...</div>;
  }

  if (userAnalyticsError) {
    return <div className="p-6 text-red-600">{userAnalyticsError}</div>;
  }

  if (!userAnalytics) {
    return <div className="p-6">No analytics data available.</div>;
  }

  // Prepare chart data from userAnalytics
  const kpiData = userAnalytics.kpis.map(kpi => ({
    ...kpi,
    icon: iconMap[kpi.icon] || Users,
  }));

  const funnelData = {
    labels: userAnalytics.conversionFunnel.labels,
    datasets: [{
      data: userAnalytics.conversionFunnel.data,
      backgroundColor: [
        '#818cf8',
        '#6366f1',
        '#4f46e5',
        '#4338ca',
        '#3730a3',
      ],
    }],
  };

  const activityData = {
    labels: userAnalytics.activityOverTime.labels,
    datasets: userAnalytics.activityOverTime.datasets.map((ds, i) => ({
      ...ds,
      borderColor: ['#818cf8', '#6366f1', '#4f46e5', '#3730a3'][i % 4],
      backgroundColor: ['#818cf8', '#6366f1', '#4f46e5', '#3730a3'][i % 4],
      tension: 0.4,
    })),
  };

  const dealProgressData = {
    labels: userAnalytics.dealProgress.labels,
    datasets: [{
      label: 'Deals',
      data: userAnalytics.dealProgress.data,
      backgroundColor: '#818cf8',
    }],
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpiData.map((kpi, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{kpi.title}</p>
                <p className="text-2xl font-semibold text-indigo-600">{kpi.value}</p>
              </div>
              <kpi.icon className="h-8 w-8 text-indigo-500" />
            </div>
            <p className="text-sm text-green-600 mt-2">{kpi.change}</p>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Funnel */}
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">My Conversion Funnel</h2>
          <div className="h-[300px]">
            <Doughnut 
              data={funnelData}
              options={{
                ...chartOptions,
                cutout: '70%',
                plugins: {
                  ...chartOptions.plugins,
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const label = context.label || '';
                        const value = context.raw as number;
                        const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                        const percentage = Math.round((value / total) * 100);
                        return `${label}: ${value} (${percentage}%)`;
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </Card>

        {/* Activity Over Time */}
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">Activity Over Time</h2>
          <div className="h-[300px]">
            <Line 
              data={activityData}
              options={{
                ...chartOptions,
                scales: {
                  y: {
                    beginAtZero: true,
                  }
                }
              }}
            />
          </div>
        </Card>

        {/* Deal Progress */}
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">Deal Progress</h2>
          <div className="h-[300px]">
            <Bar 
              data={dealProgressData}
              options={{
                ...chartOptions,
                scales: {
                  y: {
                    beginAtZero: true,
                  }
                }
              }}
            />
          </div>
        </Card>

        {/* Tasks and Follow-ups */}
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">Pending Tasks & Follow-ups</h2>
          <div className="space-y-4">
            {userAnalytics.pendingTasks.length === 0 ? (
              <div className="text-gray-500">No pending tasks.</div>
            ) : (
              userAnalytics.pendingTasks.map((task: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-sm text-gray-600">{task.due}</p>
                  </div>
                  <span className="text-indigo-600">{task.priority}</span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Smart Insights */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">Smart Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userAnalytics.smartInsights.length === 0 ? (
            <div className="text-gray-500">No insights available.</div>
          ) : (
            userAnalytics.smartInsights.map((insight, idx) => (
              <div key={idx} className={`p-3 rounded-lg ${
                insight.type === 'success' ? 'bg-green-50 text-green-800' :
                insight.type === 'warning' ? 'bg-yellow-50 text-yellow-800' :
                insight.type === 'error' ? 'bg-red-50 text-red-800' :
                'bg-gray-50 text-gray-800'
              }`}>
                <p>{insight.message}</p>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

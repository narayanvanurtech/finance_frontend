'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, Pie, Doughnut, Line } from 'react-chartjs-2';
import { DollarSign, Briefcase, TrendingUp, ArrowUpRight, ArrowDownRight, Target, Users } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

interface DealsProps {
  data: {
    revenueThisMonth: number;
    dealsCreated: number;
    dealsInPipeline: number;
    revenueLost: number;
    revenueByUsers: Array<{
      name: string;
      amount: number;
      percentage: number;
    }>;
    dealsByStages: Array<{
      stage: string;
      count: number;
    }>;
    openAmountByUsers: Array<{
      name: string;
      amount: number;
      percentage: number;
    }>;
    amountByStage: Array<{
      stage: string;
      amount: number;
    }>;
    amountByLeadSource: Array<{
      source: string;
      amount: number;
    }>;
  };
}

const Deals = ({ data }: DealsProps) => {
  // Calculate key metrics
  const totalRevenue = data.revenueThisMonth;
  const totalDeals = data.dealsCreated;
  const avgDealSize = totalRevenue / totalDeals;
  const winRate = ((data.dealsCreated / (data.dealsCreated + data.dealsInPipeline)) * 100).toFixed(1);

  // Prepare data for visualizations
  const dealsByStagesData = {
    labels: data.dealsByStages.map(item => item.stage),
    datasets: [{
      data: data.dealsByStages.map(item => item.count),
      backgroundColor: [
        'rgba(79, 70, 229, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(236, 72, 153, 0.8)',
      ],
    }],
  };

  const amountByStageData = {
    labels: data.amountByStage.map(item => item.stage),
    datasets: [{
      label: 'Amount by Stage',
      data: data.amountByStage.map(item => item.amount),
      backgroundColor: 'rgba(79, 70, 229, 0.8)',
      borderRadius: 6,
    }],
  };

  const amountByLeadSourceData = {
    labels: data.amountByLeadSource.map(item => item.source),
    datasets: [{
      data: data.amountByLeadSource.map(item => item.amount),
      backgroundColor: [
        'rgba(79, 70, 229, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(236, 72, 153, 0.8)',
      ],
    }],
  };

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <DollarSign className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">REVENUE THIS MONTH</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">${data.revenueThisMonth.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-green-50 rounded-lg">
                <Target className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">WIN RATE</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{winRate}%</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-amber-50 rounded-lg">
                <Briefcase className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">AVG DEAL SIZE</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">${avgDealSize.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-red-50 rounded-lg">
                <ArrowDownRight className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">REVENUE LOST</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">${data.revenueLost.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Deals by Stages */}
        <Card className="bg-white border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">DEALS BY STAGES</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <Doughnut
                data={dealsByStagesData}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                    title: {
                      display: true,
                      text: 'Distribution of Deals',
                      padding: {
                        bottom: 10
                      }
                    }
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Amount by Stage */}
        <Card className="bg-white border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">AMOUNT BY STAGE</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <Bar
                data={amountByStageData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          return `$${context.parsed.y.toLocaleString()}`;
                        }
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Amount ($)',
                      },
                      ticks: {
                        callback: function(value) {
                          return `$${(Number(value) / 1000).toLocaleString()}k`;
                        }
                      }
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue by Users */}
        <Card className="bg-white border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">TOP PERFORMING SALES REPS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              {data.revenueByUsers.map((user) => (
                <div key={user.name} className="p-4 rounded-lg border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/10 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-indigo-50 rounded-full">
                        <Users className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">Sales Representative</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${user.amount.toLocaleString()}</p>
                      <p className="text-sm text-green-500">{user.percentage}% of total</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Amount by Lead Source */}
        <Card className="bg-white border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">REVENUE BY LEAD SOURCE</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <Pie
                data={amountByLeadSourceData}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          return `$${context.parsed.toLocaleString()}`;
                        }
                      }
                    }
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Open Pipeline */}
      <Card className="bg-white border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">OPEN PIPELINE BY SALES REP</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            {data.openAmountByUsers.map((user) => (
              <div key={user.name} className="p-4 rounded-lg border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/10 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-indigo-50 rounded-full">
                      <Users className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">Open Deals</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${user.amount.toLocaleString()}</p>
                    <p className="text-sm text-amber-500">{user.percentage}% of pipeline</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Deals;

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Users, DollarSign, Briefcase, Building2, TrendingUp, Target } from 'lucide-react';

interface OverviewProps {
  data: {
    leadsThisMonth: number;
    revenueThisMonth: number;
    dealsInPipeline: number;
    accountsThisMonth: number;
    last3Months: {
      months: string[];
      leadsCreated: number[];
      dealsCreated: number[];
      dealsWon: number[];
      revenueWon: number[];
      openAmount: number[];
    };
    leadsBySource: {
      labels: string[];
      data: number[];
    };
    topSalesReps: Array<{
      name: string;
      amount: number;
    }>;
  };
}

const Overview = ({ data }: OverviewProps) => {
  // Calculate KPIs
  const totalLeads = data.last3Months.leadsCreated.reduce((a, b) => a + b, 0);
  const totalDealsWon = data.last3Months.dealsWon.reduce((a, b) => a + b, 0);
  const conversionRate = totalLeads > 0 ? ((totalDealsWon / totalLeads) * 100).toFixed(1) : '0';
  const totalRevenue = data.last3Months.revenueWon.reduce((a, b) => a + b, 0);
  const avgDealSize = totalDealsWon > 0 ? (totalRevenue / totalDealsWon).toFixed(0) : '0';

  return (
    <div className="space-y-8">
      {/* Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-gray-50 rounded-lg">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">LEADS THIS MONTH</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{data.leadsThisMonth}</p>
              <p className="text-sm text-gray-500 mt-2">Total: {totalLeads} leads</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-gray-50 rounded-lg">
                <DollarSign className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">REVENUE THIS MONTH</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">${typeof data.revenueThisMonth === 'number' ? data.revenueThisMonth.toLocaleString() : '0'}</p>
              <p className="text-sm text-gray-500 mt-2">Avg Deal: ${typeof avgDealSize === 'string' || typeof avgDealSize === 'number' ? Number(avgDealSize).toLocaleString() : '0'}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-gray-50 rounded-lg">
                <Target className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">CONVERSION RATE</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{conversionRate}%</p>
              <p className="text-sm text-gray-500 mt-2">{totalDealsWon} deals won</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-gray-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">PIPELINE VALUE</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">${typeof data.last3Months.openAmount?.[data.last3Months.openAmount.length - 1] === 'number'
  ? data.last3Months.openAmount[data.last3Months.openAmount.length - 1].toLocaleString()
  : '0'}</p>
              <p className="text-sm text-gray-500 mt-2">{data.dealsInPipeline} active deals</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">REVENUE TREND</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <Line
                data={{
                  labels: data.last3Months.months,
                  datasets: [
                    {
                      label: 'Revenue',
                      data: data.last3Months.revenueWon,
                      borderColor: 'rgba(79, 70, 229, 1)',
                      backgroundColor: 'rgba(79, 70, 229, 0.1)',
                      fill: true,
                      tension: 0.4,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      callbacks: {
                        label: (context) => `Revenue: $${context.parsed.y.toLocaleString()}`,
                      },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: (value) => `$${(Number(value) / 1000).toLocaleString()}k`,
                      },
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">SALES FUNNEL</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <Bar
                data={{
                  labels: data.last3Months.months,
                  datasets: [
                    {
                      label: 'Leads Created',
                      data: data.last3Months.leadsCreated,
                      backgroundColor: 'rgba(79, 70, 229, 0.8)',
                      borderRadius: 6,
                    },
                    {
                      label: 'Deals Created',
                      data: data.last3Months.dealsCreated,
                      backgroundColor: 'rgba(16, 185, 129, 0.8)',
                      borderRadius: 6,
                    },
                    {
                      label: 'Deals Won',
                      data: data.last3Months.dealsWon,
                      backgroundColor: 'rgba(245, 158, 11, 0.8)',
                      borderRadius: 6,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Count',
                      },
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leads by Source and Top Sales Reps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">LEADS BY SOURCE</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full flex items-center justify-center">
              <Pie 
                data={{
                  labels: data.leadsBySource.labels,
                  datasets: [{
                    data: data.leadsBySource.data,
                    backgroundColor: [
                      'rgba(79, 70, 229, 0.8)',
                      'rgba(16, 185, 129, 0.8)',
                      'rgba(245, 158, 11, 0.8)',
                      'rgba(139, 92, 246, 0.8)',
                      'rgba(236, 72, 153, 0.8)',
                    ],
                  }],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">TOP PERFORMING SALES REPS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topSalesReps.map((rep, index) => (
                <div key={rep.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 flex items-center justify-center bg-indigo-600 text-white rounded-full">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{rep.name}</p>
                      <p className="text-sm text-gray-500">${typeof rep.amount === 'number' ? rep.amount.toLocaleString() : '0'}</p>
                    </div>
                  </div>
                  <div className="text-indigo-600">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Overview;
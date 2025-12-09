'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Users, TrendingUp, ArrowUpRight, ArrowDownRight, Target, Filter } from 'lucide-react';
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

interface LeadsProps {
  data: {
    todayLeads: number;
    topLeadSources: Array<{
      source: string;
      count: number;
    }>;
    salesFunnel: {
      totalLeads: number;
      conversionRate: number;
      funnelData: Array<{
        source: string;
        leadsCreated: number;
        leadsToContactsRate: number;
        contacts: number;
        contactsToCustomersRate: number;
        customers: number;
        conversionRate: number;
      }>;
    };
    thisWeekLeads: {
      count: number;
      lastWeekRelative: number;
      percentageChange: number;
    };
    topLeadOwners: Array<{
      name: string;
      count: number;
      percentage: number;
    }>;
    junkLeadsBySource: Array<{
      source: string;
      count: number;
    }>;
    leadsByIndustry: Array<{
      industry: string;
      count: number;
    }>;
    monthlyLeadCreation: Array<{
      month: string;
      count: number;
    }>;
  };
}

const Leads = ({ data }: LeadsProps) => {
  // Calculate key metrics
  const totalLeadsCreated = data.salesFunnel.totalLeads;
  const totalContacts = data.salesFunnel.funnelData.reduce((sum, item) => sum + item.contacts, 0);
  const totalCustomers = data.salesFunnel.funnelData.reduce((sum, item) => sum + item.customers, 0);
  const overallConversionRate = ((totalCustomers / totalLeadsCreated) * 100).toFixed(1);

  // Prepare funnel data for visualization
  const funnelData = {
    labels: ['Leads Created', 'Converted to Contacts', 'Customers'],
    datasets: [
      {
        label: 'Conversion Flow',
        data: [totalLeadsCreated, totalContacts, totalCustomers],
        backgroundColor: [
          'rgba(79, 70, 229, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
        ],
        borderColor: [
          'rgba(79, 70, 229, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare conversion rate trend data
  const conversionTrendData = {
    labels: data.monthlyLeadCreation.map(item => item.month),
    datasets: [
      {
        label: 'Lead Creation',
        data: data.monthlyLeadCreation.map(item => item.count),
        borderColor: 'rgba(79, 70, 229, 1)',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">TODAY'S LEADS</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{data.todayLeads}</p>
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
              <p className="text-sm text-gray-500">CONVERSION RATE</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{overallConversionRate}%</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-amber-50 rounded-lg">
                <Filter className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">QUALIFIED LEADS</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalContacts}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-purple-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">CUSTOMERS WON</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalCustomers}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lead Generation Trend */}
      <Card className="bg-white border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">LEAD GENERATION TREND</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <Line
              data={conversionTrendData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: false,
                  },
                  tooltip: {
                    mode: 'index',
                    intersect: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Number of Leads',
                    },
                  },
                },
                interaction: {
                  mode: 'nearest',
                  axis: 'x',
                  intersect: false,
                },
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sales Funnel */}
      <Card className="bg-white border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">SALES FUNNEL</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="text-3xl font-bold text-gray-900">{data.salesFunnel.totalLeads}</div>
            <div className="text-sm text-gray-500">Overall Conversion Rate: {overallConversionRate}%</div>
          </div>
          
          {/* Funnel Visualization */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="h-[300px]">
              <Bar
                data={funnelData}
                options={{
                  indexAxis: 'y',
                  responsive: true,
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          return `${context.dataset.label}: ${context.parsed.x}`;
                        }
                      }
                    }
                  },
                  scales: {
                    x: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Number of Records',
                      },
                    },
                    y: {
                      grid: {
                        display: false,
                      },
                    },
                  },
                }}
              />
            </div>
            
            <div className="h-[300px]">
              <Pie
                data={{
                  labels: data.topLeadSources.slice(0, 5).map(item => item.source),
                  datasets: [{
                    data: data.topLeadSources.slice(0, 5).map(item => item.count),
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
                  maintainAspectRatio: true,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                    title: {
                      display: true,
                      text: 'Top 5 Lead Sources',
                      padding: {
                        bottom: 10
                      }
                    }
                  },
                }}
              />
            </div>
          </div>

          {/* Detailed Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 px-4">Lead Source</th>
                  <th className="text-left py-4 px-4">LEADS CREATED</th>
                  <th className="text-left py-4 px-4">CONVERTED TO CONTACTS</th>
                  <th className="text-left py-4 px-4">CUSTOMERS</th>
                  <th className="text-left py-4 px-4">Conversion Rate</th>
                </tr>
              </thead>
              <tbody>
                {data.salesFunnel.funnelData.map((item) => (
                  <tr key={item.source} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4">{item.source}</td>
                    <td className="py-4 px-4">{item.leadsCreated}</td>
                    <td className="py-4 px-4">{item.contacts} ({item.leadsToContactsRate}%)</td>
                    <td className="py-4 px-4">{item.customers}</td>
                    <td className="py-4 px-4">{item.conversionRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* This Week's Performance */}
      <Card className="bg-white border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">THIS WEEK'S PERFORMANCE</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-gray-900">{data.thisWeekLeads.count}</div>
              <div className="text-sm text-gray-500">vs Last Week: {data.thisWeekLeads.lastWeekRelative}</div>
            </div>
            <div className={`flex items-center ${data.thisWeekLeads.percentageChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {data.thisWeekLeads.percentageChange >= 0 ? (
                <ArrowUpRight className="w-4 h-4 mr-1" />
              ) : (
                <ArrowDownRight className="w-4 h-4 mr-1" />
              )}
              {Math.abs(data.thisWeekLeads.percentageChange)}%
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Lead Owners */}
      <Card className="bg-white border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">TOP LEAD OWNERS</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.topLeadOwners.map((owner) => (
              <div key={owner.name} className="p-4 rounded-lg border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/10 transition-all">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-50 rounded-full">
                    <Users className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{owner.name}</p>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{owner.count} leads</span>
                      <span className="text-sm text-green-500">({owner.percentage}%)</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Leads by Industry */}
        <Card className="bg-white border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">LEADS BY INDUSTRY</CardTitle>
          </CardHeader>
          <CardContent>
            {data.leadsByIndustry.length > 0 ? (
              <div className="h-[300px]">
                <Bar
                  data={{
                    labels: data.leadsByIndustry.map(item => item.industry),
                    datasets: [{
                      label: 'Number of Leads',
                      data: data.leadsByIndustry.map(item => item.count),
                      backgroundColor: 'rgba(79, 70, 229, 0.8)',
                      borderRadius: 6,
                    }],
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Number of Leads',
                        },
                      },
                    },
                  }}
                />
              </div>
            ) : (
              <div className="text-center text-gray-500">No data available</div>
            )}
          </CardContent>
        </Card>

        {/* Junk Leads Analysis */}
        <Card className="bg-white border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">JUNK LEADS ANALYSIS</CardTitle>
          </CardHeader>
          <CardContent>
            {data.junkLeadsBySource.length > 0 ? (
              <div className="h-[300px]">
                <Pie
                  data={{
                    labels: data.junkLeadsBySource.map(item => item.source),
                    datasets: [{
                      data: data.junkLeadsBySource.map(item => item.count),
                      backgroundColor: [
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(139, 92, 246, 0.8)',
                        'rgba(236, 72, 153, 0.8)',
                        'rgba(79, 70, 229, 0.8)',
                      ],
                    }],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                      legend: {
                        position: 'bottom',
                      },
                      title: {
                        display: true,
                        text: 'Distribution by Source',
                        padding: {
                          bottom: 10
                        }
                      }
                    },
                  }}
                />
              </div>
            ) : (
              <div className="text-center text-gray-500">No junk leads data available</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Leads;

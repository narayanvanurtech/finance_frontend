'use client'
import React, { useEffect } from 'react';
import { 
  Users, 
  DollarSign, 
  Calendar, 
  Clock, 
  Bell,
  Plus,
  Phone,
  FileText,
  Calendar as CalendarIcon,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { useDashboardStore } from '@/stores/salesCrmStore/useDashboardStore';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const StatCard = ({ title, value, icon: Icon, trend, trendValue }: { 
  title: string; 
  value: string; 
  icon: any;
  trend?: 'up' | 'down';
  trendValue?: string;
}) => (
  <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow w-full">
    <div className="flex items-center justify-between">
      <div className="p-2 sm:p-3 bg-indigo-50 rounded-lg">
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
      </div>
      {trend && (
        <div className={`flex items-center ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}> 
          {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          <span className="text-xs sm:text-sm font-medium ml-1">{trendValue}</span>
        </div>
      )}
    </div>
    <h3 className="text-gray-500 text-xs sm:text-sm font-medium mt-4">{title}</h3>
    <p className="text-xl sm:text-2xl font-semibold mt-1">{value}</p>
  </div>
);

const QuickActionButton = ({ icon: Icon, label }: { icon: any; label: string }) => (
  <button className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
    <Icon className="w-5 h-5 text-gray-600" />
    <span className="text-gray-700 font-medium text-sm">{label}</span>
  </button>
);

const HomePage = () => {
  const { userData, loading, error, fetchUserDashboard } = useDashboardStore();

  useEffect(() => {
    fetchUserDashboard();
  }, [fetchUserDashboard]);

  const kpis = userData?.kpis;
  const charts = userData?.charts;

  const conversionData = charts ? {
    labels: charts.conversionFunnel.labels,
    datasets: [{
      data: charts.conversionFunnel.data,
      backgroundColor: [
        '#4F46E5',
        '#6366F1',
        '#818CF8',
        '#A5B4FC',
        '#C7D2FE'
      ],
      borderWidth: 0,
    }],
  } : undefined;

  const progressData = charts ? {
    labels: charts.dealsClosed.labels,
    datasets: [{
      label: 'Deals Closed',
      data: charts.dealsClosed.data,
      borderColor: '#4F46E5',
      backgroundColor: 'rgba(79, 70, 229, 0.1)',
      tension: 0.4,
      fill: true,
    }],
  } : undefined;

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  }
  if (!kpis || !charts) {
    return <div className="min-h-screen flex items-center justify-center">No dashboard data available.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4">
      <div className="w-full max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Sales Dashboard</h1>
          <div className="flex flex-wrap xs:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <QuickActionButton icon={Plus} label="Add Lead" />
            <QuickActionButton icon={Phone} label="Log Call" />
            <QuickActionButton icon={FileText} label="Create Deal" />
            <QuickActionButton icon={CalendarIcon} label="Calendar" />
          </div>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <StatCard 
            title="My Leads" 
            value={kpis.leads.count.toString()} 
            icon={Users} 
            trend={kpis.leads.trend as 'up' | 'down'} 
            trendValue={kpis.leads.trendValue}
          />
          <StatCard 
            title="My Deals" 
            value={kpis.deals.count.toString()} 
            icon={DollarSign} 
            trend={kpis.deals.trend as 'up' | 'down'} 
            trendValue={kpis.deals.trendValue}
          />
          <StatCard 
            title="Tasks Due Today" 
            value={kpis.tasksDueToday.count.toString()} 
            icon={Clock} 
            trend={kpis.tasksDueToday.trend as 'up' | 'down'} 
            trendValue={kpis.tasksDueToday.trendValue}
          />
          <StatCard 
            title="Meetings Today" 
            value={kpis.meetingsToday.count.toString()} 
            icon={Calendar} 
          />
          <StatCard 
            title="Follow-ups" 
            value={kpis.followUps.count.toString()} 
            icon={Bell} 
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="lg:col-span-2 bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 overflow-x-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-2">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Progress Over Time</h2>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm text-gray-500">Last 6 months</span>
                <TrendingUp className="w-4 h-4 text-gray-400" />
              </div>
            </div>
            <div className="w-full min-w-[250px]">
              {progressData && <Line data={progressData} />}
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Conversion Funnel</h2>
            <div className="w-full max-w-xs mx-auto">
              {conversionData && <Doughnut data={conversionData} />}
            </div>
          </div>
        </div>

        {/* Reminders and Updates */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Reminders</h2>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-indigo-50 rounded-lg">
                <Clock className="w-5 h-5 text-indigo-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 text-sm sm:text-base">Follow up with John Doe</p>
                  <p className="text-xs sm:text-sm text-gray-500">Lead • Due in 2 hours</p>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-purple-50 rounded-lg">
                <Phone className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 text-sm sm:text-base">Sales call with ABC Corp</p>
                  <p className="text-xs sm:text-sm text-gray-500">Meeting • 2:00 PM</p>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-orange-50 rounded-lg">
                <FileText className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 text-sm sm:text-base">Complete proposal for XYZ Ltd</p>
                  <p className="text-xs sm:text-sm text-gray-500">Task • Due today</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Recent Updates</h2>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                <div>
                  <p className="font-medium text-gray-900 text-sm sm:text-base">Lead "Tech Solutions" moved to Qualified</p>
                  <p className="text-xs sm:text-sm text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                <div>
                  <p className="font-medium text-gray-900 text-sm sm:text-base">New deal assigned: "Enterprise Project"</p>
                  <p className="text-xs sm:text-sm text-gray-500">4 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                <div>
                  <p className="font-medium text-gray-900 text-sm sm:text-base">Sarah commented on "Project Alpha"</p>
                  <p className="text-xs sm:text-sm text-gray-500">Yesterday</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
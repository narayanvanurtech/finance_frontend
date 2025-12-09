'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Filter, Download } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useAnalyticsStore from '@/stores/salesCrmStore/useAnalyticsStore';
import Overview from './Overview';
import Leads from './Leads';
import Deals from './Deals';

const AnalyticsPage = () => {
  const { analytics, isLoading, error, fetchAnalytics } = useAnalyticsStore();

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (isLoading) {
    return <div className="p-8">Loading analytics data...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">Error loading analytics: {error}</div>;
  }

  if (!analytics) {
    return <div className="p-8">No analytics data available</div>;
  }

  // Map analytics data to Overview props
  const overviewData = {
    leadsThisMonth: analytics.leadsThisMonth ?? 0,
    revenueThisMonth: analytics.revenueThisMonth ?? 0,
    dealsInPipeline: analytics.dealsInPipeline ?? 0,
    accountsThisMonth: analytics.accountsThisMonth ?? 0,
    last3Months: analytics.last3Months ?? {
      months: [],
      leadsCreated: [],
      dealsCreated: [],
      dealsWon: [],
      revenueWon: [],
      openAmount: [],
    },
    leadsBySource: analytics.leadsBySource ?? { labels: [], data: [] },
    topSalesReps: Array.isArray(analytics.topSalesReps)
      ? analytics.topSalesReps.map((rep: any) => ({
          name: rep.name || '',
          amount: rep.amount || 0,
        }))
      : [],
  };

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CRM Analytics</h1>
          <p className="text-gray-500 mt-1">Monitor your sales performance and team metrics</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="overview">Organization Overview</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="deals">Deals</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <Overview data={overviewData} />
        </TabsContent>
        
        <TabsContent value="leads">
          <Leads data={{
            todayLeads: 0,
            topLeadSources: [],
            salesFunnel: { totalLeads: 0, conversionRate: 0, funnelData: [] },
            thisWeekLeads: { count: 0, lastWeekRelative: 0, percentageChange: 0 },
            topLeadOwners: [],
            junkLeadsBySource: [],
            leadsByIndustry: [],
            monthlyLeadCreation: [],
          }} />
        </TabsContent>
        
        <TabsContent value="deals">
          <Deals data={{
            revenueThisMonth: 0,
            dealsCreated: 0,
            dealsInPipeline: 0,
            revenueLost: 0,
            revenueByUsers: [],
            dealsByStages: [],
            openAmountByUsers: [],
            amountByStage: [],
            amountByLeadSource: [],
          }} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsPage;

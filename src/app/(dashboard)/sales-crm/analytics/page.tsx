'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Filter, Download } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useAnalyticsStore from '@/stores/salesCrmStore/useAnalyticsStore';
import Overview from './Overview';
import Leads from './Leads';
import Deals from './Deals';
import { mapAnalyticsToLeads } from '@/utils/mapAnalyticsToLeads';
import { mapAnalyticsToDeals } from '@/utils/mapAnalyticsToDeals';

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

  console.log(analytics)

  // Map analytics data to Overview props
 const overviewData = {
  leadsThisMonth: analytics.result.summary.totalLeads,

  revenueThisMonth: 0, // backend not sending revenue yet

  dealsInPipeline: analytics.result.summary.totalContacted,

  accountsThisMonth: analytics.result.distribution.byOwner.length,

  last3Months: {
    months: analytics.result.timeline.leads.map(l => l.formattedDate),
    leadsCreated: analytics.result.timeline.leads.map(l => l.count),
    dealsCreated: analytics.result.timeline.leads.map(l => l.contacted),
    dealsWon: analytics.result.timeline.leads.map(l => l.converted),
    revenueWon: [],
    openAmount: [],
  },

  leadsBySource: {
    labels: analytics.result.performance.leadSourcePerformance.map(s => s.source),
    data: analytics.result.performance.leadSourcePerformance.map(s => s.total),
  },

  topSalesReps: analytics.result.distribution.byOwner.map(owner => ({
    name: owner.ownerName,
    amount: owner.totalLeads,
  })),
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
          <Leads data={mapAnalyticsToLeads(analytics)}/>
        </TabsContent>
        
        <TabsContent value="deals">
          <Deals data={mapAnalyticsToDeals(analytics)} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsPage;

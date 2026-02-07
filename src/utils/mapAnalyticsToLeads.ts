export function mapAnalyticsToLeads(analytics: any) {
  const leadsTimeline = analytics.result.timeline.leads;

  const todayLeads = leadsTimeline.at(-1)?.count ?? 0;

  // Monthly lead creation (chart)
  const monthlyLeadCreation = leadsTimeline.map((l: any) => ({
    month: l.formattedDate,
    count: l.count,
  }));

  // Sales funnel (simplified but correct)
  const salesFunnelData = analytics.result.performance.leadSourcePerformance.map(
    (src: any) => ({
      source: src.source,
      leadsCreated: src.total,
      contacts: Math.round(src.total * (analytics.result.summary.overallContactRate / 100)),
      customers: src.converted,
      leadsToContactsRate: analytics.result.summary.overallContactRate,
      contactsToCustomersRate: src.conversionRate,
      conversionRate: src.conversionRate,
    })
  );

  // Top lead sources (Pie)
  const topLeadSources = analytics.result.performance.leadSourcePerformance.map(
    (s: any) => ({
      source: s.source,
      count: s.total,
    })
  );

  // Top lead owners
  const totalLeads = analytics.result.summary.totalLeads;

  const topLeadOwners = analytics.result.distribution.byOwner.map((o: any) => ({
    name: o.ownerName,
    count: o.totalLeads,
    percentage: totalLeads
      ? Math.round((o.totalLeads / totalLeads) * 100)
      : 0,
  }));

  return {
    todayLeads,

    topLeadSources,

    salesFunnel: {
      totalLeads: analytics.result.summary.totalLeads,
      conversionRate: analytics.result.summary.overallConversionRate,
      funnelData: salesFunnelData,
    },

    thisWeekLeads: {
      count: analytics.result.summary.totalLeads,
      lastWeekRelative: 0,
      percentageChange: 0,
    },

    topLeadOwners,

    // Optional / future-ready
    junkLeadsBySource: [],
    leadsByIndustry: [],
    monthlyLeadCreation,
  };
}

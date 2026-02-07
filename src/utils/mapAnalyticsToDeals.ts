export const mapAnalyticsToDeals = (analytics: any) => {
  const result = analytics?.result;

  // ---- BASIC NUMBERS ----
  const dealsCreated = result?.summary?.totalConverted || 0;
  const dealsInPipeline = result?.summary?.totalContacted || 0;

  // ---- DEALS BY STAGE (from status distribution) ----
  const dealsByStages =
    result?.distribution?.byStatus?.map((s: any) => ({
      stage: s.status,
      count: s.count,
    })) || [];

  // ---- REVENUE BY USERS (mocked until backend supports it) ----
  const revenueByUsers =
    result?.distribution?.byOwner?.map((o: any) => ({
      name: o.ownerName,
      amount: 0, // backend not sending revenue yet
      percentage: 0,
    })) || [];

  // ---- OPEN PIPELINE BY USERS ----
  const openAmountByUsers =
    result?.distribution?.byOwner?.map((o: any) => ({
      name: o.ownerName,
      amount: o.totalLeads,
      percentage: 0,
    })) || [];

  // ---- AMOUNT BY STAGE ----
  const amountByStage =
    result?.distribution?.byStatus?.map((s: any) => ({
      stage: s.status,
      amount: 0, // revenue not available
    })) || [];

  // ---- AMOUNT BY LEAD SOURCE ----
  const amountByLeadSource =
    result?.performance?.leadSourcePerformance?.map((s: any) => ({
      source: s.source,
      amount: s.total,
    })) || [];

  return {
    revenueThisMonth: 0,
    dealsCreated,
    dealsInPipeline,
    revenueLost: 0,

    revenueByUsers,
    dealsByStages,
    openAmountByUsers,
    amountByStage,
    amountByLeadSource,
  };
};

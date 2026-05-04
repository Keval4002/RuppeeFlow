export const appCache = {
  dashboardData: null,
  incomeData: null,
  expenseData: null,
  semanticContext: null,
  aiSummary: null,
};

export const clearAppCache = () => {
  appCache.dashboardData = null;
  appCache.incomeData = null;
  appCache.expenseData = null;
  appCache.semanticContext = null;
  appCache.aiSummary = null;
};

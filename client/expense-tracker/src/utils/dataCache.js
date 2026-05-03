export const appCache = {
  dashboardData: null,
  incomeData: null,
  expenseData: null,
};

export const clearAppCache = () => {
  appCache.dashboardData = null;
  appCache.incomeData = null;
  appCache.expenseData = null;
};

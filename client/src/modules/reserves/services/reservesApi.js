import { api } from '../../../lib/apiClient';

export const reservesApi = {
  getOpeningState: () => api.get('/api/reserves/opening-state'),
  setupOpeningState: (asOfDate, cumulativeProfit, cumulativeExpense, balance) =>
    api.post('/api/reserves/opening-state', { asOfDate, cumulativeProfit, cumulativeExpense, balance }),
  listTransactions: () => api.get('/api/reserves/transactions'),
  addTransaction: (date, particular, type, amount) =>
    api.post('/api/reserves/transactions', { date, particular, type, amount }),
};
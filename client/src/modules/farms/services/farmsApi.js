import { api } from '../../../lib/apiClient';

export const farmsApi = {
  getOpeningState: () => api.get('/api/farms/opening-state'),
  setupOpeningState: (asOfDate, balance) =>
    api.post('/api/farms/opening-state', { asOfDate, balance }),
  listTransactions: () => api.get('/api/farms/transactions'),
  addTransaction: (date, particular, type, amount) =>
    api.post('/api/farms/transactions', { date, particular, type, amount }),
  getSummary: () => api.get('/api/farms/summary'),
};

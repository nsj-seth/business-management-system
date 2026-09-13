import { api } from '../../../lib/apiClient';

export const cementApi = {
  getOpeningState: () => api.get('/api/cement/opening-state'),
  setupOpeningState: (asOfDate, balance) =>
    api.post('/api/cement/opening-state', { asOfDate, balance }),
  listTransactions: () => api.get('/api/cement/transactions'),
  addTransaction: (date, type, bags, pricePerBag, particular) =>
    api.post('/api/cement/transactions', { date, type, bags, pricePerBag, particular }),
  getSummary: () => api.get('/api/cement/summary'),
};
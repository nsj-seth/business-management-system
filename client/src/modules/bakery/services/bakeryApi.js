import { api } from '../../../lib/apiClient';

export const bakeryApi = {
  listDays: () => api.get('/api/bakery/days'),
  getDay: (dayId) => api.get(`/api/bakery/days/${dayId}`),
  createDay: (date) => api.post('/api/bakery/days', { date }),
  addSale: (dayId, salesperson, amount) =>
    api.post(`/api/bakery/days/${dayId}/sales`, { salesperson, amount }),
  addExpense: (dayId, description, amount) =>
    api.post(`/api/bakery/days/${dayId}/expenses`, { description, amount }),
  completeDay: (dayId) => api.post(`/api/bakery/days/${dayId}/complete`, {}),
};
import api from './api';

const accountService = {
  getAll: () => api.get('/accounts'),
  getById: (id) => api.get(`/accounts/${id}`),
  create: (data) => api.post('/accounts', data),
  update: (id, data) => api.put(`/accounts/${id}`, data),
  delete: (id) => api.delete(`/accounts/${id}`),
  deposit: (id, data) => api.post(`/accounts/${id}/deposit`, data),
  withdraw: (id, data) => api.post(`/accounts/${id}/withdraw`, data),
  getTransactions: (id) => api.get(`/accounts/${id}/transactions`),
};

export default accountService;

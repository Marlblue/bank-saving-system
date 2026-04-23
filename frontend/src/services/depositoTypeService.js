import api from './api';

const depositoTypeService = {
  getAll: () => api.get('/deposito-types'),
  getById: (id) => api.get(`/deposito-types/${id}`),
  create: (data) => api.post('/deposito-types', data),
  update: (id, data) => api.put(`/deposito-types/${id}`, data),
  delete: (id) => api.delete(`/deposito-types/${id}`),
};

export default depositoTypeService;

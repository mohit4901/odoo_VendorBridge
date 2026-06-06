import api from '../utils/api';

const rfqService = {
  list: (params) => api.get('/rfqs', { params }),
  getOne: (id) => api.get(`/rfqs/${id}`),
  create: (data) => api.post('/rfqs', data),
  update: (id, data) => api.put(`/rfqs/${id}`, data),
  updateStatus: (id, status) => api.patch(`/rfqs/${id}/status`, { status }),
  assign: (id, vendorIds) => api.patch(`/rfqs/${id}/assign`, { vendorIds }),
  publish: (id) => api.post(`/rfqs/${id}/publish`),
};

export default rfqService;

import api from '../utils/api';

const poService = {
  list: (params) => api.get('/purchase-orders', { params }),
  getOne: (id) => api.get(`/purchase-orders/${id}`),
  generate: (payload) => api.post('/purchase-orders', payload),
  updateStatus: (id, status) => api.patch(`/purchase-orders/${id}/status`, { status }),
};

export default poService;

import api from '../utils/api';

const vendorService = {
  list: (params) => api.get('/vendors', { params }),
  getOne: (id) => api.get(`/vendors/${id}`),
  create: (data) => api.post('/vendors', data),
  update: (id, data) => api.put(`/vendors/${id}`, data),
  remove: (id) => api.delete(`/vendors/${id}`),
  updateStatus: (id, status) => api.patch(`/vendors/${id}/status`, { status }),
  approve: (id) => api.post(`/vendors/${id}/approve`),
  getMyProfile: () => api.get('/vendors/me'),
};

export default vendorService;

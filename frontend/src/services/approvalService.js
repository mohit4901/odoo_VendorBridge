import api from '../utils/api';

const approvalService = {
  list: (params) => api.get('/approvals', { params }),
  getOne: (id) => api.get(`/approvals/${id}`),
  create: (data) => api.post('/approvals', data),
  action: (id, action, remark) => api.post(`/approvals/${id}/action`, { action, remark }),
  approve: (id, remark) => api.post(`/approvals/${id}/approve`, { remark }),
  reject: (id, remark) => api.post(`/approvals/${id}/reject`, { remark }),
};

export default approvalService;

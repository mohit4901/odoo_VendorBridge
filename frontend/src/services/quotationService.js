import api from '../utils/api';

const quotationService = {
  list: (params) => api.get('/quotations', { params }),
  byRfq: (rfqId) => api.get(`/quotations/rfq/${rfqId}`),
  compare: (rfqId, vendorIds) => api.post('/quotations/compare', { rfqId, vendorIds }),
  getOne: (id) => api.get(`/quotations/${id}`),
  submit: (data) => api.post('/quotations', data),
  update: (id, data) => api.put(`/quotations/${id}`, data),
  award: (id) => api.post(`/quotations/${id}/award`),
};

export default quotationService;

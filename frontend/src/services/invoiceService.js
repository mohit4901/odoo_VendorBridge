import api from '../utils/api';

const invoiceService = {
  list: (params) => api.get('/invoices', { params }),
  getOne: (id) => api.get(`/invoices/${id}`),
  generate: (payload) => api.post('/invoices', payload),
  pay: (id) => api.patch(`/invoices/${id}/pay`),
  email: (id, to, subject) => api.post(`/invoices/${id}/email`, { to, subject }),
  downloadPdf: async (id, invoiceRef) => {
    const response = await api.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
    const blob = new Blob([response], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `${invoiceRef || 'invoice'}.pdf`;
    link.click();
  },
  printView: async (id) => {
    const html = await api.get(`/invoices/${id}/print`);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.print();
    }
  }
};

export default invoiceService;

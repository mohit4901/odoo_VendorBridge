import api from '../utils/api';

const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password, company, phone) => 
    api.post('/auth/register', { name, email, password, company, phone }),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  changePassword: (oldPassword, newPassword) => api.put('/auth/password', { oldPassword, newPassword }),
};

export default authService;

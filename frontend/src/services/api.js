import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add Authorization JWT Token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('fraudlens_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export default API;

// API Helper Functions
export const authAPI = {
  login: (credentials) => API.post('/auth/login', credentials),
  register: (userData) => API.post('/auth/register', userData),
  getMe: () => API.get('/auth/me'),
};

export const invoiceAPI = {
  upload: (formData) => API.post('/invoices/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getAll: (params) => API.get('/invoices', { params }),
  getById: (id) => API.get(`/invoices/${id}`),
  update: (id, data) => API.put(`/invoices/${id}`, data),
  approve: (id) => API.post(`/invoices/${id}/approve`),
  reject: (id, reason) => API.post(`/invoices/${id}/reject`, null, { params: { reason } }),
};

export const poAPI = {
  getAll: () => API.get('/purchase-orders'),
  getById: (id) => API.get(`/purchase-orders/${id}`),
  create: (data) => API.post('/purchase-orders', data),
  importCSV: (formData) => API.post('/purchase-orders/import-csv', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

export const grnAPI = {
  getAll: () => API.get('/grn'),
  getById: (id) => API.get(`/grn/${id}`),
  create: (data) => API.post('/grn', data)
};

export const fraudAPI = {
  getAlerts: (params) => API.get('/fraud/alerts', { params }),
  getInvoiceFraud: (invoiceId) => API.get(`/fraud/invoice/${invoiceId}`),
  getBenfordStats: () => API.get('/fraud/benford-stats')
};

export const analyticsAPI = {
  getDashboard: () => API.get('/analytics/dashboard'),
  getVendors: () => API.get('/analytics/vendors')
};

export const auditAPI = {
  getLogs: (params) => API.get('/audit/logs', { params })
};

export const settingsAPI = {
  getSettings: () => API.get('/settings'),
  updateThresholds: (data) => API.put('/settings/thresholds', data)
};

export const seedAPI = {
  triggerSeed: () => API.post('/seed')
};

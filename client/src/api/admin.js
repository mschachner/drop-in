import axiosInstance from './axiosInstance';

export const verifyAdminPassword = (password) =>
  axiosInstance.post('/api/admin/verify', { password });

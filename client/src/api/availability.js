import axiosInstance from './axiosInstance';

export const getAvailabilities = () => axiosInstance.get('/api/availability');

export const createAvailability = (data) =>
  axiosInstance.post('/api/availability', data);

export const updateAvailability = (id, data) =>
  axiosInstance.put(`/api/availability/${id}`, data);

export const deleteAvailability = (id) =>
  axiosInstance.delete(`/api/availability/${id}`);

export const joinAvailability = (id, name) =>
  axiosInstance.post(`/api/availability/${id}/join`, { name });

export const unjoinAvailability = (id, name) =>
  axiosInstance.post(`/api/availability/${id}/unjoin`, { name });

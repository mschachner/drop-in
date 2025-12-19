import axiosInstance from './axiosInstance';

export const getCalendar = (calendarId) =>
  axiosInstance.get(`/api/calendars/${calendarId}`);

export const createCalendar = (data) =>
  axiosInstance.post('/api/calendars', data);

export const getCalendars = () =>
  axiosInstance.get('/api/calendars');

export const deleteCalendar = (calendarId) =>
  axiosInstance.delete(`/api/calendars/${calendarId}`);

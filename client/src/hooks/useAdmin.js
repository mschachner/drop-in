import { useState, useCallback, useEffect } from 'react';
import { verifyAdminPassword } from '../api/admin';
import { getCalendars } from '../api/calendar';

const useAdmin = () => {
  const [adminPasswordOpen, setAdminPasswordOpen] = useState(false);
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [adminPasswordError, setAdminPasswordError] = useState('');
  const [adminPasswordLoading, setAdminPasswordLoading] = useState(false);
  const [adminCalendars, setAdminCalendars] = useState([]);
  const [adminCalendarsLoading, setAdminCalendarsLoading] = useState(false);
  const [adminCalendarsError, setAdminCalendarsError] = useState('');
  const [adminBusyCalendarId, setAdminBusyCalendarId] = useState(null);

  useEffect(() => {
    if (!adminPasswordOpen) return;
    setAdminPasswordError('');
  }, [adminPasswordOpen]);

  const loadAdminCalendars = useCallback(async () => {
    setAdminCalendarsLoading(true);
    setAdminCalendarsError('');
    try {
      const { data } = await getCalendars();
      setAdminCalendars(data);
    } catch (err) {
      setAdminCalendarsError(err.response?.data?.message || 'Failed to load calendars');
    } finally {
      setAdminCalendarsLoading(false);
    }
  }, []);

  const handleAdminPasswordSubmit = useCallback(async (password) => {
    setAdminPasswordLoading(true);
    setAdminPasswordError('');
    try {
      await verifyAdminPassword(password);
      setAdminPasswordOpen(false);
      setAdminDialogOpen(true);
      await loadAdminCalendars();
    } catch (err) {
      const message = err.response?.data?.message || 'Unable to verify password.';
      setAdminPasswordError(message);
    } finally {
      setAdminPasswordLoading(false);
    }
  }, [loadAdminCalendars]);

  const openAdminPassword = useCallback(() => setAdminPasswordOpen(true), []);
  const closeAdminPassword = useCallback(() => setAdminPasswordOpen(false), []);
  const closeAdminDialog = useCallback(() => setAdminDialogOpen(false), []);

  return {
    adminPasswordOpen,
    adminDialogOpen,
    adminPasswordError,
    adminPasswordLoading,
    adminCalendars,
    adminCalendarsLoading,
    adminCalendarsError,
    adminBusyCalendarId,
    setAdminBusyCalendarId,
    openAdminPassword,
    closeAdminPassword,
    closeAdminDialog,
    handleAdminPasswordSubmit,
    loadAdminCalendars,
  };
};

export default useAdmin;

import { useState, useCallback, useEffect } from 'react';
import { createCalendar, getCalendar } from '../api/calendar';
import { DEFAULT_COLOR, LOCAL_STORAGE_KEYS } from '../constants';

const useCalendarSelection = ({ setUserPreferences, setSelectedColor, setDarkMode }) => {
  const [calendarDialogError, setCalendarDialogError] = useState(null);
  const [calendarDialogOpen, setCalendarDialogOpen] = useState(
    () => !localStorage.getItem(LOCAL_STORAGE_KEYS.CALENDAR_ID)
  );
  const [calendarId, setCalendarId] = useState(
    () => localStorage.getItem(LOCAL_STORAGE_KEYS.CALENDAR_ID) || ''
  );
  const [calendarInfo, setCalendarInfo] = useState(null);

  const applyCalendarPreferences = useCallback((calendar) => {
    const storedColor = localStorage.getItem(LOCAL_STORAGE_KEYS.preferredColor(calendar.calendarId));
    const storedDark = localStorage.getItem(LOCAL_STORAGE_KEYS.darkMode(calendar.calendarId));
    const resolvedColor = storedColor || calendar.defaultColor || DEFAULT_COLOR;
    const resolvedDarkMode = storedDark !== null
      ? storedDark === 'true'
      : calendar.defaultDarkMode || false;

    setUserPreferences((prev) => ({ ...prev, color: resolvedColor }));
    setSelectedColor(resolvedColor);
    setDarkMode(resolvedDarkMode);
  }, [setUserPreferences, setSelectedColor, setDarkMode]);

  const handleCalendarLoaded = useCallback((calendar) => {
    setCalendarInfo(calendar);
    setCalendarId(calendar.calendarId);
    localStorage.setItem(LOCAL_STORAGE_KEYS.CALENDAR_ID, calendar.calendarId);
    applyCalendarPreferences(calendar);
    setCalendarDialogOpen(false);
    setCalendarDialogError(null);
  }, [applyCalendarPreferences]);

  useEffect(() => {
    if (!calendarId) return;
    let isActive = true;
    const loadCalendar = async () => {
      try {
        const { data } = await getCalendar(calendarId);
        if (!isActive) return;
        handleCalendarLoaded(data);
      } catch (err) {
        if (!isActive) return;
        setCalendarDialogError(err.response?.data?.message || 'Failed to load calendar');
        setCalendarDialogOpen(true);
      }
    };
    loadCalendar();
    return () => {
      isActive = false;
    };
  }, [calendarId, handleCalendarLoaded]);

  const handleCalendarSubmit = useCallback(async ({ calendarId: nextCalendarId, createNew, defaultColor, defaultDarkMode }) => {
    setCalendarDialogError(null);
    try {
      const response = createNew
        ? await createCalendar({ calendarId: nextCalendarId, defaultColor, defaultDarkMode })
        : await getCalendar(nextCalendarId);
      handleCalendarLoaded(response.data);
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.message;
      if (status === 404) {
        setCalendarDialogError('Calendar not found. Try creating a new one.');
      } else if (status === 409) {
        setCalendarDialogError('That calendar ID already exists. Try loading it instead.');
      } else {
        setCalendarDialogError(message || 'Failed to load calendar');
      }
    }
  }, [handleCalendarLoaded]);

  const handleCalendarDialogClose = useCallback(() => {
    if (!calendarId) return;
    setCalendarDialogOpen(false);
    setCalendarDialogError(null);
  }, [calendarId]);

  const clearCalendar = useCallback(() => {
    setCalendarInfo(null);
    setCalendarId('');
    localStorage.removeItem(LOCAL_STORAGE_KEYS.CALENDAR_ID);
  }, []);

  return {
    calendarId,
    calendarInfo,
    calendarDialogOpen,
    calendarDialogError,
    setCalendarDialogOpen,
    setCalendarDialogError,
    handleCalendarSubmit,
    handleCalendarDialogClose,
    clearCalendar,
  };
};

export default useCalendarSelection;

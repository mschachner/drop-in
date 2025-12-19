import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid,
  CircularProgress,
  Alert,
  Button,
  useMediaQuery
} from '@mui/material';
import useAvailabilities from '../hooks/useAvailabilities';
import { createCalendar, deleteCalendar, getCalendar, getCalendars } from '../api/calendar';
import { createPastelColor, createDarkPastelColor } from './calendar/colorUtils';
import CalendarSwitcherDialog from './calendar/CalendarSwitcherDialog';
import AdminPasswordDialog from './calendar/AdminPasswordDialog';
import AdminCalendarDialog from './calendar/AdminCalendarDialog';
import UserPreferences from './calendar/UserPreferences';
import AddEventDialog from './calendar/AddEventDialog';
import EditEventDialog from './calendar/EditEventDialog';
import ErrorTooltip from './ErrorTooltip';

import DayColumn from "./calendar/DayColumn";
// Function to convert hex to RGB
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

// Function to create a darker version of a color
const darkenColor = (hex) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  // Darken by 30%
  const darkenR = Math.round(rgb.r * 0.7);
  const darkenG = Math.round(rgb.g * 0.7);
  const darkenB = Math.round(rgb.b * 0.7);
  
  return `rgb(${darkenR}, ${darkenG}, ${darkenB})`;
};

const Calendar = () => {
  const [dialogError, setDialogError] = useState(null);
  const [calendarDialogError, setCalendarDialogError] = useState(null);
  const [calendarDialogOpen, setCalendarDialogOpen] = useState(
    () => !localStorage.getItem('calendarId')
  );
  const [calendarId, setCalendarId] = useState(
    () => localStorage.getItem('calendarId') || ''
  );
  const [calendarInfo, setCalendarInfo] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [userPreferences, setUserPreferences] = useState(() => {
    const storedName = localStorage.getItem('userName');
    return {
      name: storedName || '',
      color: '#66BB6A'
    };
  });
  const {
    availabilities,
    loading,
    error,
    setError,
    addAvailability,
    updateAvailability,
    deleteAvailability,
    toggleJoin,
  } = useAvailabilities(userPreferences.name, calendarId);
  const [newEvent, setNewEvent] = useState({
    timeSlot: '',
    location: '',
    section: 'day',
    icon: '',
    recurring: false
  });
  const [selectedColor, setSelectedColor] = useState(() => {
    return '#66BB6A';
  });
  const [darkMode, setDarkMode] = useState(false);
  const [activeEventId, setActiveEventId] = useState(null);
  const [adminPasswordOpen, setAdminPasswordOpen] = useState(false);
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [adminPasswordError, setAdminPasswordError] = useState('');
  const [adminPasswordLoading, setAdminPasswordLoading] = useState(false);
  const [adminCalendars, setAdminCalendars] = useState([]);
  const [adminCalendarsLoading, setAdminCalendarsLoading] = useState(false);
  const [adminCalendarsError, setAdminCalendarsError] = useState('');
  const [adminBusyCalendarId, setAdminBusyCalendarId] = useState(null);
  const isMobile = useMediaQuery('(max-width:899px)');

  const ADMIN_PASSWORD_HASH = 'edc254af2701b950236d95fff251d7a765a6f20df5cd93c917f11ac6d98814e2';

  const hashPassword = useCallback(async (value) => {
    if (!window.crypto?.subtle) {
      throw new Error('Password verification is unavailable in this browser.');
    }
    const data = new TextEncoder().encode(value);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  }, []);

  const applyCalendarPreferences = useCallback((calendar) => {
    const storedColor = localStorage.getItem(`calendar.${calendar.calendarId}.preferredColor`);
    const storedDark = localStorage.getItem(`calendar.${calendar.calendarId}.darkMode`);
    const resolvedColor = storedColor || calendar.defaultColor || '#66BB6A';
    const resolvedDarkMode = storedDark !== null
      ? storedDark === 'true'
      : calendar.defaultDarkMode || false;

    setUserPreferences((prev) => ({ ...prev, color: resolvedColor }));
    setSelectedColor(resolvedColor);
    setDarkMode(resolvedDarkMode);
  }, []);

  const handleCalendarLoaded = useCallback((calendar) => {
    setCalendarInfo(calendar);
    setCalendarId(calendar.calendarId);
    localStorage.setItem('calendarId', calendar.calendarId);
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

  useEffect(() => {
    if (!calendarId) return;
    localStorage.setItem(`calendar.${calendarId}.preferredColor`, userPreferences.color);
  }, [calendarId, userPreferences.color]);

  useEffect(() => {
    localStorage.setItem('userName', userPreferences.name);
  }, [userPreferences.name]);

  useEffect(() => {
    if (!calendarId) return;
    localStorage.setItem(`calendar.${calendarId}.darkMode`, darkMode);
  }, [calendarId, darkMode]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);


  useEffect(() => {
    if (error === 'Please enter your name first' && userPreferences.name) {
      setError(null);
    }
  }, [userPreferences.name, error, setError]);

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(null), 3000);
    return () => clearTimeout(timer);
  }, [error, setError]);

  useEffect(() => {
    if (!dialogError) return;
    const timer = setTimeout(() => setDialogError(null), 3000);
    return () => clearTimeout(timer);
  }, [dialogError]);

  useEffect(() => {
    if (!adminPasswordOpen) return;
    setAdminPasswordError('');
  }, [adminPasswordOpen]);

  const handleCalendarSubmit = useCallback(async ({ calendarId: nextCalendarId, createNew, defaultColor, defaultDarkMode }) => {
    setCalendarDialogError(null);
    try {
      const response = createNew
        ? await createCalendar({
            calendarId: nextCalendarId,
            defaultColor,
            defaultDarkMode
          })
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
      const hashed = await hashPassword(password);
      if (hashed !== ADMIN_PASSWORD_HASH) {
        setAdminPasswordError('Incorrect password.');
        return;
      }
      setAdminPasswordOpen(false);
      setAdminDialogOpen(true);
      await loadAdminCalendars();
    } catch (err) {
      setAdminPasswordError(err.message || 'Unable to verify password.');
    } finally {
      setAdminPasswordLoading(false);
    }
  }, [hashPassword, loadAdminCalendars]);

  const handleAdminOpenCalendar = useCallback(async (targetCalendarId) => {
    await handleCalendarSubmit({
      calendarId: targetCalendarId,
      createNew: false
    });
    setAdminDialogOpen(false);
  }, [handleCalendarSubmit]);

  const handleAdminDeleteCalendar = useCallback(async (targetCalendarId) => {
    if (!window.confirm(`Delete calendar "${targetCalendarId}"? This will remove all events.`)) {
      return;
    }
    setAdminBusyCalendarId(targetCalendarId);
    setAdminCalendarsError('');
    try {
      await deleteCalendar(targetCalendarId);
      if (calendarId === targetCalendarId) {
        setCalendarInfo(null);
        setCalendarId('');
        localStorage.removeItem('calendarId');
        setCalendarDialogError('Calendar deleted. Please choose another.');
        setCalendarDialogOpen(true);
      }
      await loadAdminCalendars();
    } catch (err) {
      setAdminCalendarsError(err.response?.data?.message || 'Failed to delete calendar');
    } finally {
      setAdminBusyCalendarId(null);
    }
  }, [calendarId, loadAdminCalendars]);

  const handleDayClick = useCallback((date, section) => {
    if (!calendarId) {
      setCalendarDialogError('Please choose a calendar first.');
      setCalendarDialogOpen(true);
      return;
    }
    if (!userPreferences.name) {
      setError('Please enter your name first');
      return;
    }
    setSelectedDate(date);
    setNewEvent({
      timeSlot: '',
      location: '',
      section: section,
      icon: '',
      recurring: false
    });
    setOpenDialog(true);
  }, [calendarId, userPreferences.name, setError]);

  const handleSubmit = useCallback(async () => {
    if (!newEvent.timeSlot || !newEvent.location) {
      setDialogError('Please fill in all fields');
      return;
    }

    try {
      const eventData = {
        ...newEvent,
        name: userPreferences.name,
        color: userPreferences.color,
        date: selectedDate.toISOString(),
        calendarId
      };
      await addAvailability(eventData);
      setOpenDialog(false);
      setDialogError(null);
    } catch (err) {
      setError(err.message || 'Failed to add event');
    }
  }, [newEvent, userPreferences, selectedDate, calendarId, addAvailability, setError]);

  const handleKeyPress = useCallback((event) => {
    if (event.key === 'Enter' && newEvent.timeSlot && newEvent.location) {
      handleSubmit();
    }
  }, [newEvent, handleSubmit]);

  const handleDelete = useCallback(async (eventId) => {
    try {
      await deleteAvailability(eventId);
    } catch (err) {
      setError(err.message || 'Failed to delete event');
    }
  }, [deleteAvailability, setError]);

  const isUserJoining = useCallback((event) => {
    return event?.joiners?.includes(userPreferences.name) || false;
  }, [userPreferences.name]);

  const handleJoin = useCallback(async (eventId) => {
    if (!userPreferences.name) {
      setError('Please enter your name first');
      return;
    }

    try {
      const event = availabilities.find(a => a._id === eventId);
      await toggleJoin(event);
    } catch (err) {
      setError(err.message || 'Failed to update event');
    }
  }, [userPreferences.name, availabilities, toggleJoin, setError]);

  const handleEdit = useCallback((event) => {
    if (!userPreferences.name) {
      setError('Please enter your name first');
      return;
    }
    if (userPreferences.name !== event.name) {
      setError(`Only ${event.name} can edit this event`);
      return;
    }

    setSelectedEvent(event);
    setSelectedDate(new Date(event.date));
    setNewEvent({
      timeSlot: event.timeSlot,
      location: event.location,
      section: event.section,
      icon: event.icon || '',
      recurring: event.recurring || false
    });
    setOpenEditDialog(true);
  }, [userPreferences.name, setError]);

  const handleEditSubmit = useCallback(async () => {
    if (!newEvent.timeSlot || !newEvent.location || !selectedEvent) {
      setDialogError('Please fill in all fields');
      return;
    }

    try {
      const eventData = {
        ...newEvent,
        name: selectedEvent.name,
        color: selectedEvent.color,
        date: selectedEvent.date,
      };
      await updateAvailability(selectedEvent._id, eventData);
      setOpenEditDialog(false);
      setDialogError(null);
    } catch (err) {
      setError(err.message || 'Failed to update event');
    }
  }, [newEvent, selectedEvent, updateAvailability, setError]);

  const handleEditKeyPress = useCallback((event) => {
    if (event.key === 'Enter' && newEvent.timeSlot && newEvent.location) {
      handleEditSubmit();
    }
  }, [newEvent, handleEditSubmit]);

  const expandedAvailabilities = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const rangeEnd = new Date(today);
    rangeEnd.setDate(rangeEnd.getDate() + 6);
    const expanded = [];

    availabilities.forEach(event => {
      if (event.recurring) {
        const originalDate = new Date(event.date);
        originalDate.setHours(0, 0, 0, 0);
        let occurrence = new Date(originalDate);
        while (occurrence < today) {
          occurrence.setDate(occurrence.getDate() + 7);
        }
        while (occurrence <= rangeEnd) {
          const isOriginalOccurrence = occurrence.getTime() === originalDate.getTime();
          expanded.push({
            ...event,
            date: occurrence.toISOString(),
            joiners: isOriginalOccurrence ? event.joiners : []
          });
          occurrence.setDate(occurrence.getDate() + 7);
        }
      } else {
        expanded.push(event);
      }
    });
    return expanded;
  }, [availabilities]);

  const getNextSevenDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const pastelColor = useMemo(
    () =>
      darkMode
        ? createDarkPastelColor(userPreferences.color)
        : createPastelColor(userPreferences.color),
    [userPreferences.color, darkMode]
  );
  const darkColor = useMemo(
    () =>
      darkMode ? userPreferences.color : darkenColor(userPreferences.color),
    [userPreferences.color, darkMode]
  );

  const handleHeaderClick = useCallback(() => {
    const randomColor = `#${Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, '0')}`;

    // Always apply the random color and show it in the palette icon
    setSelectedColor(randomColor);
    setUserPreferences((prev) => ({ ...prev, color: randomColor }));
  }, []);

  const handleDialogClose = useCallback(() => {
    setOpenDialog(false);
    setDialogError(null);
    if (!isMobile) {
      setActiveEventId(null);
    }
  }, [isMobile]);

  const handleEditDialogClose = useCallback(() => {
    setOpenEditDialog(false);
    setDialogError(null);
    if (!isMobile) {
      setActiveEventId(null);
    }
  }, [isMobile]);

  const formatJoiners = (joiners) => {
    if (!joiners || joiners.length === 0) return '';
    if (joiners.length === 1) return `${joiners[0]} will join!`;
    if (joiners.length === 2) return `${joiners[0]} and ${joiners[1]} will join!`;
    return `${joiners.slice(0, -1).join(', ')}, and ${joiners[joiners.length - 1]} will join!`;
  };

  const handleEventClick = useCallback((event, e) => {
    e.stopPropagation();
    if (isMobile) {
      handleDayClick(new Date(event.date), event.section, e);
    } else {
      setActiveEventId(event._id);
      handleDayClick(new Date(event.date), event.section, e);
    }
  }, [isMobile, handleDayClick]);


  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{
      p: 4,
      height: { xs: 'calc(100dvh - 64px)', sm: 'calc(100vh - 64px)' },
      minHeight: { xs: 'calc(100dvh - 64px)', sm: 'calc(100vh - 64px)' },
      '--calendar-bg': pastelColor,
      backgroundColor: 'var(--calendar-bg)',
      color: darkMode ? '#fff' : 'inherit',
      borderRadius: 2,
      fontFamily: 'Nunito, sans-serif',
      transition: 'background-color 0.5s ease',
      willChange: 'background-color',
      display: 'flex',
      flexDirection: 'column',
      overflow: { xs: 'auto', sm: 'hidden' },
      '& .float-animation': {
        animation: 'float 6s ease-in-out infinite'
      },
      '& .pulse-animation': {
        animation: 'pulse 2s ease-in-out infinite'
      },
      '@keyframes float': {
        '0%, 100%': { 
          transform: 'translate(30px, -30px) scale(1)', 
          opacity: 0.3 
        },
        '50%': { 
          transform: 'translate(30px, -35px) scale(1.1)', 
          opacity: 0.6 
        }
      },
      '@keyframes pulse': {
        '0%, 100%': { 
          opacity: 0.7, 
          transform: 'scale(1)' 
        },
        '50%': { 
          opacity: 1, 
          transform: 'scale(1.2)' 
        }
      }
    }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 3,
        gap: 2,
        position: 'relative'
      }}>
        {/* Subtle background accent */}
        <Box sx={{
          position: 'absolute',
          top: -10,
          left: -10,
          right: -10,
          bottom: -10,
          background: `linear-gradient(135deg, ${userPreferences.color}08, transparent)`,
          borderRadius: 3,
          zIndex: 0
        }} />
        
        <Typography
          variant="h3"
          sx={{
            color: darkColor,
            fontWeight: 700,
            fontFamily: 'Courgette, cursive',
            letterSpacing: '-0.5px',
            userSelect: 'none',
            transition: 'all 0.3s ease',
            textShadow: '1px 1px 3px rgba(0,0,0,0.25)',
            cursor: 'pointer',
            position: 'relative',
            zIndex: 1,
            '&:hover': {
              transform: 'scale(1.05)',
              textShadow: '2px 2px 4px rgba(0,0,0,0.4)',
              filter: 'brightness(1.1)'
            },
            '&:active': {
              transform: 'scale(0.95)'
            }
          }}
          onClick={handleHeaderClick}
        >
          Drop in!
        </Typography>
        
        {/* Floating accent dot */}
        <Box sx={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: userPreferences.color,
          opacity: 0.7,
          ml: 1
        }} 
        className="pulse-animation"
        />
        {calendarInfo && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 'auto', zIndex: 1 }}>
            <Box sx={{
              px: 2,
              py: 0.5,
              borderRadius: 999,
              backgroundColor: darkMode ? '#424242' : '#fff',
              boxShadow: darkMode ? '0 3px 10px rgba(0,0,0,0.35)' : '0 3px 10px rgba(0,0,0,0.12)'
            }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Calendar: {calendarInfo.calendarId}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              onClick={() => setCalendarDialogOpen(true)}
              sx={{ borderRadius: 999, textTransform: 'none' }}
            >
              Switch calendar
            </Button>
          </Box>
        )}
      </Box>
      
      {error && isMobile && (
        <Alert severity="error" sx={{ mb: 2, fontFamily: 'Nunito, sans-serif' }}>{error}</Alert>
      )}
      {!isMobile && <ErrorTooltip message={error} />}

      <CalendarSwitcherDialog
        open={calendarDialogOpen}
        onClose={handleCalendarDialogClose}
        onSubmit={handleCalendarSubmit}
        error={calendarDialogError}
        defaultCalendarId={calendarId || 'Default'}
        darkMode={darkMode}
      />

      <AdminPasswordDialog
        open={adminPasswordOpen}
        onClose={() => setAdminPasswordOpen(false)}
        onSubmit={handleAdminPasswordSubmit}
        error={adminPasswordError}
        loading={adminPasswordLoading}
        darkMode={darkMode}
      />

      <AdminCalendarDialog
        open={adminDialogOpen}
        onClose={() => setAdminDialogOpen(false)}
        calendars={adminCalendars}
        onOpenCalendar={handleAdminOpenCalendar}
        onDeleteCalendar={handleAdminDeleteCalendar}
        onRefresh={loadAdminCalendars}
        loading={adminCalendarsLoading}
        error={adminCalendarsError}
        darkMode={darkMode}
        busyCalendarId={adminBusyCalendarId}
        activeCalendarId={calendarId}
      />

      <UserPreferences
        userPreferences={userPreferences}
        setUserPreferences={setUserPreferences}
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      <Paper sx={{ 
        borderRadius: 3, 
        overflow: 'hidden', 
        fontFamily: 'Nunito, sans-serif',
        flex: { xs: 'none', sm: 1 },
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        height: { xs: 'auto', sm: 'auto' },
        maxHeight: { xs: 'none', sm: 'none' },
        boxShadow: darkMode 
          ? '0 15px 35px rgba(0,0,0,0.4)' 
          : '0 15px 35px rgba(0,0,0,0.1)',
        border: darkMode ? '1px solid #555' : '1px solid #e0e0e0',
        position: 'relative'
      }}>
        {/* Subtle decorative elements */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: `linear-gradient(90deg, transparent, ${userPreferences.color}, transparent)`,
          opacity: 0.6
        }} />
        <Box sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${userPreferences.color}10, transparent)`,
          transform: 'translate(30px, -30px)'
        }} 
        className="float-animation"
        />
        <Grid 
          container 
          sx={{ 
            flex: { xs: 'none', md: 1 },
            flexDirection: { xs: 'column', md: 'row' },
            width: '100%',
            minHeight: { md: 0 },
            overflow: { xs: 'visible', md: 'hidden' },
            height: { xs: 'auto', md: 'auto' }
          }}
        >
          {getNextSevenDays().map((date, index) => {
            const dayAvailabilities = expandedAvailabilities.filter(a =>
              new Date(a.date).toDateString() === date.toDateString()
            );

            return (
              <DayColumn
                key={index}
                index={index}
                date={date}
                dayAvailabilities={dayAvailabilities}
                userPreferences={userPreferences}
                handleDayClick={handleDayClick}
                handleEventClick={handleEventClick}
                handleDelete={handleDelete}
                handleEdit={handleEdit}
                handleJoin={handleJoin}
                isUserJoining={isUserJoining}
                formatJoiners={formatJoiners}
                isMobile={isMobile}
                activeEventId={activeEventId}
                darkMode={darkMode}
              />
            );
          })}
        </Grid>
      </Paper>

      <AddEventDialog
        open={openDialog}
        onClose={handleDialogClose}
        selectedDate={selectedDate}
        newEvent={newEvent}
        setNewEvent={setNewEvent}
        handleSubmit={handleSubmit}
        handleKeyPress={handleKeyPress}
        dialogError={dialogError}
        userPreferences={userPreferences}
        darkMode={darkMode}
        isMobile={isMobile}
      />
      <EditEventDialog
        open={openEditDialog}
        onClose={handleEditDialogClose}
        selectedDate={selectedDate}
        newEvent={newEvent}
        setNewEvent={setNewEvent}
        handleSubmit={handleEditSubmit}
        handleKeyPress={handleEditKeyPress}
        dialogError={dialogError}
        userPreferences={userPreferences}
        darkMode={darkMode}
        isMobile={isMobile}
      />

      <Button
        onClick={() => setAdminPasswordOpen(true)}
        variant="text"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 24,
          textTransform: 'none',
          fontFamily: 'Nunito, sans-serif',
          fontWeight: 600,
          fontSize: '0.9rem',
          color: darkMode ? '#e0e0e0' : '#444',
          opacity: 0.7,
          zIndex: 10,
          '&:hover': {
            opacity: 1,
            backgroundColor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'
          }
        }}
      >
        admin
      </Button>
    </Box>
  );
};

export default React.memo(Calendar);

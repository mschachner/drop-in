import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid,
  CircularProgress,
  Alert,
  useMediaQuery
} from '@mui/material';
import useAvailabilities from '../hooks/useAvailabilities';
import { createPastelColor, createDarkPastelColor, COLORS } from './calendar/colorUtils';
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
  const [openDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [userPreferences, setUserPreferences] = useState(() => {
    const storedColor = localStorage.getItem('preferredColor');
    const storedName = localStorage.getItem('userName');
    return {
      name: storedName || '',
      color: storedColor || '#66BB6A'
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
  } = useAvailabilities(userPreferences.name);
  const [newEvent, setNewEvent] = useState({
    timeSlot: '',
    location: '',
    section: 'day',
    icon: '',
    recurring: false
  });
  const [selectedColor, setSelectedColor] = useState(() => {
    const storedColor = localStorage.getItem('preferredColor');
    if (storedColor && !COLORS.find(c => c.value === storedColor)) {
      return storedColor;
    }
    return '#008080';
  });
  const [darkMode, setDarkMode] = useState(() => {
    const storedDark = localStorage.getItem('darkMode');
    return storedDark === 'true';
  });
  const [activeEventId, setActiveEventId] = useState(null);
  const isMobile = useMediaQuery('(max-width:899px)');


  useEffect(() => {
    localStorage.setItem('preferredColor', userPreferences.color);
  }, [userPreferences.color]);

  useEffect(() => {
    localStorage.setItem('userName', userPreferences.name);
  }, [userPreferences.name]);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

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

  const handleDayClick = useCallback((date, section) => {
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
  }, [userPreferences.name, setError]);

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
      };
      await addAvailability(eventData);
      setOpenDialog(false);
      setDialogError(null);
    } catch (err) {
      setError(err.message || 'Failed to add event');
    }
  }, [newEvent, userPreferences, selectedDate, addAvailability, setError]);

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
      </Box>
      
      {error && isMobile && (
        <Alert severity="error" sx={{ mb: 2, fontFamily: 'Nunito, sans-serif' }}>{error}</Alert>
      )}
      {!isMobile && <ErrorTooltip message={error} />}

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
    </Box>
  );
};

export default React.memo(Calendar);

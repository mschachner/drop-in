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
import axios from 'axios';
import { createPastelColor, createDarkPastelColor, COLORS } from './calendar/colorUtils';
import UserPreferences from './calendar/UserPreferences';
import AddEventDialog from './calendar/AddEventDialog';

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
  const [error, setError] = useState(null);
  const [dialogError, setDialogError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availabilities, setAvailabilities] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [userPreferences, setUserPreferences] = useState(() => {
    const storedColor = localStorage.getItem('preferredColor');
    return {
      name: '',
      color: storedColor || '#66BB6A'
    };
  });
  const [newEvent, setNewEvent] = useState({
    timeSlot: '',
    location: '',
    section: 'day'
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
  const isMobile = useMediaQuery('(max-width:599px)');

  useEffect(() => {
    // Load fonts
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&family=Courgette&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    localStorage.setItem('preferredColor', userPreferences.color);
  }, [userPreferences.color]);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/availability`, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true
      });
      setAvailabilities(response.data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load availabilities');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (error === 'Please enter your name first' && userPreferences.name) {
      setError(null);
    }
  }, [userPreferences.name, error]);

  const handleDayClick = useCallback((date, section) => {
    if (!userPreferences.name) {
      setError('Please enter your name first');
      return;
    }
    setSelectedDate(date);
    setNewEvent({
      timeSlot: '',
      location: '',
      section: section
    });
    setOpenDialog(true);
  }, [userPreferences.name]);

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
        date: selectedDate.toISOString()
      };
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/availability`, eventData);
      setAvailabilities(prev => [...prev, response.data]);
      setOpenDialog(false);
      setDialogError(null);
    } catch (err) {
      setError(err.message || 'Failed to add event');
    }
  }, [newEvent, userPreferences, selectedDate]);

  const handleKeyPress = useCallback((event) => {
    if (event.key === 'Enter' && newEvent.timeSlot && newEvent.location) {
      handleSubmit();
    }
  }, [newEvent, handleSubmit]);

  const handleDelete = useCallback(async (eventId) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/availability/${eventId}`);
      setAvailabilities(prev => prev.filter(a => a._id !== eventId));
    } catch (err) {
      setError(err.message || 'Failed to delete event');
    }
  }, []);

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
      const isJoining = !isUserJoining(event);

      if (isJoining) {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/availability/${eventId}/join`, {
          name: userPreferences.name
        });
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/availability/${eventId}/unjoin`, {
          name: userPreferences.name
        });
      }
      setAvailabilities(prev =>
        prev.map(a =>
          a._id === eventId
            ? {
                ...a,
                joiners: isJoining
                  ? [...(a.joiners || []), userPreferences.name]
                  : a.joiners.filter(j => j !== userPreferences.name)
              }
            : a
        )
      );
    } catch (err) {
      setError(err.message || 'Failed to update event');
    }
  }, [userPreferences.name, availabilities, isUserJoining]);

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
      overflow: { xs: 'auto', sm: 'hidden' }
    }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 2,
        gap: 2
      }}>
        <Typography
          variant="h3"
          sx={{
            color: darkColor,
            fontWeight: 700,
            fontFamily: 'Courgette, cursive',
            letterSpacing: '-0.5px',
            transition: 'color 0.5s ease, transform 0.2s ease, text-shadow 0.2s ease',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            cursor: 'pointer',
            '&:hover': {
              transform: 'scale(1.05)',
              textShadow: '4px 4px 8px rgba(0,0,0,0.5)'
            }
          }}
          onClick={handleHeaderClick}
        >
          Drop in!
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2, fontFamily: 'Nunito, sans-serif' }}>{error}</Alert>
      )}

      <UserPreferences
        userPreferences={userPreferences}
        setUserPreferences={setUserPreferences}
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      <Paper sx={{ 
        borderRadius: 2, 
        overflow: 'hidden', 
        fontFamily: 'Nunito, sans-serif',
        flex: { xs: 'none', sm: 1 },
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        height: { xs: 'auto', sm: 'auto' },
        maxHeight: { xs: 'none', sm: 'none' }
      }}>
        <Grid 
          container 
          sx={{ 
            flex: { xs: 'none', sm: 1 },
            flexDirection: { xs: 'column', sm: 'row' },
            width: '100%',
            minHeight: { sm: 0 },
            overflow: { xs: 'visible', sm: 'hidden' },
            height: { xs: 'auto', sm: 'auto' }
          }}
        >
          {getNextSevenDays().map((date, index) => {
            const dayAvailabilities = availabilities.filter(a =>
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
      />
    </Box>
  );
};

export default React.memo(Calendar);
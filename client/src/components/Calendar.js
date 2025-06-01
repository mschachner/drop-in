import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  Fab,
  IconButton,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import axios from 'axios';
import { createPastelColor, getTextColor } from './calendar/colorUtils';
import UserPreferences from './calendar/UserPreferences';
import CalendarDay from './calendar/CalendarDay';
import AddEventDialog from './calendar/AddEventDialog';
import JoinEventDialog from './calendar/JoinEventDialog';

const COLORS = [
  { value: '#4CAF50', label: 'Green' },
  { value: '#2196F3', label: 'Blue' },
  { value: '#FF9800', label: 'Orange' },
  { value: '#9C27B0', label: 'Purple' },
  { value: '#F44336', label: 'Red' },
  { value: '#FF80AB', label: 'Pink' },
  { value: '#795548', label: 'Brown' }
];

// Function to calculate relative luminance of a color
const calculateLuminance = (hex) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  
  // Convert RGB to relative luminance
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

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

// Function to create a subtle highlight color that maintains readability
const createHighlightColor = (hex) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  // Mix with black to create a darker version (30% black, 70% color)
  const highlightR = Math.round(rgb.r * 0.7);
  const highlightG = Math.round(rgb.g * 0.7);
  const highlightB = Math.round(rgb.b * 0.7);
  
  return `rgb(${highlightR}, ${highlightG}, ${highlightB})`;
};

const Calendar = () => {
  const [error, setError] = useState(null);
  const [dialogError, setDialogError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availabilities, setAvailabilities] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openJoinDialog, setOpenJoinDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dialogPosition, setDialogPosition] = useState({ top: 0, left: 0 });
  const [userPreferences, setUserPreferences] = useState({
    name: '',
    color: '#4CAF50'
  });
  const [newEvent, setNewEvent] = useState({
    timeSlot: '',
    location: '',
    section: 'day'
  });
  const [selectedColor, setSelectedColor] = useState('#008080');

  useEffect(() => {
    // Add Nunito font
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
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
  };

  const handleDayClick = (date, section) => {
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
  };

  const handleSubmit = async () => {
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
      await axios.post(`${process.env.REACT_APP_API_URL}/api/availability`, eventData);
      setOpenDialog(false);
      setDialogError(null);
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to add event');
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && newEvent.timeSlot && newEvent.location) {
      handleSubmit();
    }
  };

  const handleDelete = async (eventId) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/availability/${eventId}`);
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to delete event');
    }
  };

  const getNextSevenDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const pastelColor = createPastelColor(userPreferences.color);
  const darkColor = darkenColor(userPreferences.color);

  const handleDialogClose = () => {
    setOpenDialog(false);
    setDialogError(null);
  };

  const handleEventClick = (event, clickEvent) => {
    if (!userPreferences.name) {
      setError('Please enter your name first');
      return;
    }
    clickEvent.stopPropagation(); // Stop the event from bubbling up
    setSelectedEvent(event);
    
    // Only position the dialog on desktop
    if (window.innerWidth >= 600) { // Material-UI's sm breakpoint
      const rect = clickEvent.currentTarget.getBoundingClientRect();
      setDialogPosition({
        top: rect.top,
        left: rect.right + 16 // 16px gap
      });
    }
    
    setOpenJoinDialog(true);
  };

  const handleJoinEvent = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/availability/${selectedEvent._id}/join`, {
        name: userPreferences.name
      });
      setOpenJoinDialog(false);
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to join event');
    }
  };

  const handleUnjoinEvent = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/availability/${selectedEvent._id}/unjoin`, {
        name: userPreferences.name
      });
      setOpenJoinDialog(false);
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to unjoin event');
    }
  };

  const formatJoiners = (joiners) => {
    if (!joiners || joiners.length === 0) return '';
    if (joiners.length === 1) return `${joiners[0]} will join!`;
    if (joiners.length === 2) return `${joiners[0]} and ${joiners[1]} will join!`;
    return `${joiners.slice(0, -1).join(', ')}, and ${joiners[joiners.length - 1]} will join!`;
  };

  const isUserJoining = (event) => {
    return event?.joiners?.includes(userPreferences.name) || false;
  };

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
      height: { xs: 'auto', sm: '92.5vh' },
      minHeight: { xs: '100vh', sm: 'auto' },
      backgroundColor: pastelColor,
      borderRadius: 2,
      fontFamily: 'Nunito, sans-serif',
      transition: 'background-color 0.5s ease',
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
            fontFamily: 'Nunito, sans-serif',
            letterSpacing: '-0.5px',
            position: 'relative',
            transition: 'color 0.5s ease',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -8,
              left: 0,
              width: '100%',
              height: '3px',
              backgroundColor: darkColor,
              borderRadius: '2px',
              transition: 'background-color 0.5s ease'
            }
          }}
        >
          Next 7 Days
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
              <Grid 
                item 
                xs={12}
                sm
                key={index}
                sx={{
                  borderRight: { sm: index < 6 ? '1px solid #e0e0e0' : 'none' },
                  borderBottom: { xs: index < 6 ? '1px solid #e0e0e0' : 'none', sm: 'none' },
                  '&:last-child': {
                    borderRight: 'none',
                    borderBottom: 'none'
                  },
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 0,
                  overflow: 'hidden',
                  width: { xs: '100%', sm: 'auto' },
                  flex: { xs: 'none', sm: 1 },
                  height: { xs: 'auto', sm: '100%' }
                }}
              >
                <CalendarDay
                  date={date}
                  dayAvailabilities={dayAvailabilities}
                  handleDayClick={handleDayClick}
                  handleEventClick={handleEventClick}
                  handleDelete={handleDelete}
                  isUserJoining={isUserJoining}
                  formatJoiners={formatJoiners}
                  userPreferences={userPreferences}
                />
              </Grid>
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
      />

      <JoinEventDialog
        open={openJoinDialog}
        onClose={() => setOpenJoinDialog(false)}
        selectedEvent={selectedEvent}
        handleJoinEvent={handleJoinEvent}
        handleUnjoinEvent={handleUnjoinEvent}
        isUserJoining={isUserJoining}
        userPreferences={userPreferences}
        formatJoiners={formatJoiners}
      />
    </Box>
  );
};

export default Calendar;
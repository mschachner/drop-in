import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid,
  CircularProgress,
  Alert,
  Fab,
  IconButton,
  Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { createPastelColor, getTextColor, createHighlightColor, isWeekend } from './calendar/colorUtils';
import UserPreferences from './calendar/UserPreferences';
import AddEventDialog from './calendar/AddEventDialog';

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
  const [activeEventId, setActiveEventId] = useState(null);

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

  const handleJoin = async (eventId) => {
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
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to update event');
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

  const pastelColor = createPastelColor(userPreferences.color);
  const darkColor = darkenColor(userPreferences.color);

  const handleDialogClose = () => {
    setOpenDialog(false);
    setDialogError(null);
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

  const handleEventClick = (event, e) => {
    e.stopPropagation();
    if (window.innerWidth < 600) { // Mobile
      setActiveEventId(activeEventId === event._id ? null : event._id);
    } else { // Desktop
      handleDayClick(new Date(event.date), event.section, e);
    }
  };

  const handleSectionClick = (e, section) => {
    if (!isMobile) {
      handleDayClick(date, section, e);
    }
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
                <Box 
                  sx={{ 
                    p: 2,
                    backgroundColor: isWeekend(date) ? '#F5F5F5' : 'white',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'visible',
                    minHeight: 0,
                    height: { xs: 'auto', sm: '100%' }
                  }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    mb: 2
                  }}>
                    <Box>
                      <Typography 
                        variant="subtitle2" 
                        sx={{ 
                          fontWeight: 600,
                          color: date.toDateString() === new Date().toDateString() ? createHighlightColor(userPreferences.color) : 'inherit',
                          fontFamily: 'Nunito, sans-serif',
                          transition: 'color 0.5s ease'
                        }}
                      >
                        {date.toLocaleDateString('en-US', { weekday: 'short' })}
                      </Typography>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          color: date.toDateString() === new Date().toDateString() ? createHighlightColor(userPreferences.color) : 'inherit',
                          fontFamily: 'Nunito, sans-serif',
                          fontWeight: 700,
                          transition: 'color 0.5s ease'
                        }}
                      >
                        {date.getDate()}
                      </Typography>
                    </Box>
                    <Fab
                      size="small"
                      color="primary"
                      sx={{
                        backgroundColor: userPreferences.color,
                        color: getTextColor(userPreferences.color),
                        transition: 'all 0.5s ease',
                        '&:hover': {
                          backgroundColor: userPreferences.color,
                          opacity: 0.9
                        }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDayClick(date, 'day', e);
                      }}
                    >
                      <AddIcon />
                    </Fab>
                  </Box>
                  <Divider sx={{ mb: 2 }} />

                  {/* Day Section */}
                  <Box 
                    sx={{ 
                      flex: 1,
                      cursor: { xs: 'default', sm: 'pointer' },
                      '&:hover': {
                        backgroundColor: { xs: 'transparent', sm: 'rgba(0, 0, 0, 0.02)' }
                      }
                    }}
                    onClick={(e) => handleSectionClick(e, 'day')}
                  >
                    {dayAvailabilities
                      .filter(a => a.section !== 'evening')
                      .map((a, idx) => (
                        <Paper
                          key={idx}
                          sx={{
                            p: 1.5,
                            mb: 1.5,
                            backgroundColor: a.color,
                            color: getTextColor(a.color),
                            borderRadius: 2,
                            position: 'relative',
                            fontFamily: 'Nunito, sans-serif',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            '&:hover': {
                              transform: { xs: 'none', sm: 'translateY(-2px)' },
                              boxShadow: { xs: '0 2px 4px rgba(0,0,0,0.1)', sm: '0 4px 8px rgba(0,0,0,0.15)' },
                              '& .event-actions': {
                                opacity: { xs: 0, sm: 1 }
                              }
                            },
                            className: 'event-paper',
                            '&:hover .time-box': { 
                              right: { xs: 0, sm: isUserJoining(a) ? '110px' : '72px' }
                            },
                            '&:hover .event-actions': { 
                              opacity: { xs: 0, sm: 1 }
                            }
                          }}
                          onClick={(e) => handleEventClick(a, e)}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center', 
                                mb: 0.5,
                                position: 'relative',
                                minHeight: '40px'
                              }}>
                                <Typography 
                                  variant="subtitle1" 
                                  sx={{ 
                                    fontWeight: 700, 
                                    fontFamily: 'Nunito, sans-serif',
                                    wordBreak: 'break-word',
                                    lineHeight: 1.2,
                                    flex: 1,
                                    pr: 1,
                                    display: 'flex',
                                    alignItems: 'center'
                                  }}
                                >
                                  {a.name}
                                </Typography>
                                <Box sx={{ position: 'relative', minHeight: '40px', display: 'flex', alignItems: 'center' }}>
                                  <Box
                                    sx={{
                                      position: 'absolute',
                                      top: 0,
                                      right: 0,
                                      minWidth: '60px',
                                      height: '24px',
                                      borderRadius: '8px',
                                      backgroundColor: 'rgba(255,255,255,0.2)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      flexShrink: 0,
                                      padding: '0 8px',
                                      fontWeight: 600,
                                      fontSize: '0.75rem',
                                      fontFamily: 'Nunito, sans-serif',
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      transition: 'right 0.3s cubic-bezier(0.4,0,0.2,1)',
                                      zIndex: 2,
                                      pointerEvents: 'none',
                                      right: (window.innerWidth < 600 && activeEventId === a._id) ? (isUserJoining(a) ? '110px' : '72px') : 0
                                    }}
                                    className="time-box"
                                  >
                                    {a.timeSlot}
                                  </Box>
                                  <Box
                                    className="event-actions"
                                    sx={{
                                      position: 'absolute',
                                      top: 0,
                                      right: 0,
                                      display: 'flex',
                                      gap: 0.5,
                                      opacity: (window.innerWidth < 600 && activeEventId === a._id) ? 1 : 0,
                                      transition: 'opacity 0.3s cubic-bezier(0.4,0,0.2,1)',
                                      zIndex: 1,
                                      '&.event-paper:hover .event-actions': {
                                        opacity: { xs: 0, sm: 1 },
                                      },
                                    }}
                                  >
                                    <IconButton
                                      size="small"
                                      sx={{
                                        color: getTextColor(a.color),
                                        backgroundColor: 'rgba(255,255,255,0.2)',
                                        '&:hover': {
                                          backgroundColor: 'rgba(255,255,255,0.3)'
                                        },
                                        minWidth: isUserJoining(a) ? '50px' : 'auto',
                                        height: '24px',
                                        justifyContent: 'flex-start',
                                        gap: 0.5,
                                        fontSize: '0.75rem',
                                        padding: '0 8px',
                                        borderRadius: '12px',
                                        backdropFilter: 'blur(4px)'
                                      }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleJoin(a._id);
                                      }}
                                    >
                                      {isUserJoining(a) ? (
                                        <>
                                          <span>Joined</span>
                                          <span style={{ fontSize: '1em' }}>✓</span>
                                        </>
                                      ) : (
                                        'Join'
                                      )}
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      sx={{
                                        color: getTextColor(a.color),
                                        backgroundColor: 'rgba(255,255,255,0.2)',
                                        '&:hover': {
                                          backgroundColor: 'rgba(255,255,255,0.3)'
                                        },
                                        height: '24px',
                                        width: '24px',
                                        borderRadius: '12px',
                                        backdropFilter: 'blur(4px)'
                                      }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(a._id);
                                      }}
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Box>
                                </Box>
                              </Box>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontFamily: 'Nunito, sans-serif',
                                  opacity: 0.9,
                                  wordBreak: 'break-word',
                                  lineHeight: 1.2
                                }}
                              >
                                {a.location}
                              </Typography>
                              {a.joiners && a.joiners.length > 0 && (
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    fontFamily: 'Nunito, sans-serif',
                                    mt: 1,
                                    fontSize: '0.75rem',
                                    opacity: 0.8,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5
                                  }}
                                >
                                  {formatJoiners(a.joiners)}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </Paper>
                    ))}
                  </Box>

                  {/* Evening Section */}
                  <Box 
                    sx={{ 
                      flex: 1,
                      mt: 2,
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        mb: 1, 
                        color: '#666',
                        fontFamily: 'Nunito, sans-serif',
                        fontWeight: 600
                      }}
                    >
                      Evening
                    </Typography>
                    <Box 
                      sx={{ 
                        flex: 1,
                        cursor: { xs: 'default', sm: 'pointer' },
                        '&:hover': {
                          backgroundColor: { xs: 'transparent', sm: 'rgba(0, 0, 0, 0.02)' }
                        }
                      }}
                      onClick={(e) => handleSectionClick(e, 'evening')}
                    >
                      {dayAvailabilities
                        .filter(a => a.section === 'evening')
                        .map((a, idx) => (
                          <Paper
                            key={idx}
                            sx={{
                              p: 1.5,
                              mb: 1.5,
                              backgroundColor: a.color,
                              color: getTextColor(a.color),
                              borderRadius: 2,
                              position: 'relative',
                              fontFamily: 'Nunito, sans-serif',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                              '&:hover': {
                                transform: { xs: 'none', sm: 'translateY(-2px)' },
                                boxShadow: { xs: '0 2px 4px rgba(0,0,0,0.1)', sm: '0 4px 8px rgba(0,0,0,0.15)' },
                                '& .event-actions': {
                                  opacity: { xs: 0, sm: 1 }
                                }
                              },
                              className: 'event-paper',
                              '&:hover .time-box': { 
                                right: { xs: 0, sm: isUserJoining(a) ? '110px' : '72px' }
                              },
                              '&:hover .event-actions': { 
                                opacity: { xs: 0, sm: 1 }
                              }
                            }}
                            onClick={(e) => handleEventClick(a, e)}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Box sx={{ 
                                  display: 'flex', 
                                  justifyContent: 'space-between', 
                                  alignItems: 'center', 
                                  mb: 0.5,
                                  position: 'relative',
                                  minHeight: '40px'
                                }}>
                                  <Typography 
                                    variant="subtitle1" 
                                    sx={{ 
                                      fontWeight: 700, 
                                      fontFamily: 'Nunito, sans-serif',
                                      wordBreak: 'break-word',
                                      lineHeight: 1.2,
                                      flex: 1,
                                      pr: 1,
                                      display: 'flex',
                                      alignItems: 'center'
                                    }}
                                  >
                                    {a.name}
                                  </Typography>
                                  <Box sx={{ position: 'relative', minHeight: '40px', display: 'flex', alignItems: 'center' }}>
                                    <Box
                                      sx={{
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                        minWidth: '60px',
                                        height: '24px',
                                        borderRadius: '8px',
                                        backgroundColor: 'rgba(255,255,255,0.2)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        padding: '0 8px',
                                        fontWeight: 600,
                                        fontSize: '0.75rem',
                                        fontFamily: 'Nunito, sans-serif',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        transition: 'right 0.3s cubic-bezier(0.4,0,0.2,1)',
                                        zIndex: 2,
                                        pointerEvents: 'none',
                                        right: (window.innerWidth < 600 && activeEventId === a._id) ? (isUserJoining(a) ? '110px' : '72px') : 0
                                      }}
                                      className="time-box"
                                    >
                                      {a.timeSlot}
                                    </Box>
                                    <Box
                                      className="event-actions"
                                      sx={{
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                        display: 'flex',
                                        gap: 0.5,
                                        opacity: (window.innerWidth < 600 && activeEventId === a._id) ? 1 : 0,
                                        transition: 'opacity 0.3s cubic-bezier(0.4,0,0.2,1)',
                                        zIndex: 1,
                                        '&.event-paper:hover .event-actions': {
                                          opacity: { xs: 0, sm: 1 },
                                        },
                                      }}
                                    >
                                      <IconButton
                                        size="small"
                                        sx={{
                                          color: getTextColor(a.color),
                                          backgroundColor: 'rgba(255,255,255,0.2)',
                                          '&:hover': {
                                            backgroundColor: 'rgba(255,255,255,0.3)'
                                          },
                                          minWidth: isUserJoining(a) ? '50px' : 'auto',
                                          height: '24px',
                                          justifyContent: 'flex-start',
                                          gap: 0.5,
                                          fontSize: '0.75rem',
                                          padding: '0 8px',
                                          borderRadius: '12px',
                                          backdropFilter: 'blur(4px)'
                                        }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleJoin(a._id);
                                        }}
                                      >
                                        {isUserJoining(a) ? (
                                          <>
                                            <span>Joined</span>
                                            <span style={{ fontSize: '1em' }}>✓</span>
                                          </>
                                        ) : (
                                          'Join'
                                        )}
                                      </IconButton>
                                      <IconButton
                                        size="small"
                                        sx={{
                                          color: getTextColor(a.color),
                                          backgroundColor: 'rgba(255,255,255,0.2)',
                                          '&:hover': {
                                            backgroundColor: 'rgba(255,255,255,0.3)'
                                          },
                                          height: '24px',
                                          width: '24px',
                                          borderRadius: '12px',
                                          backdropFilter: 'blur(4px)'
                                        }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDelete(a._id);
                                        }}
                                      >
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </Box>
                                  </Box>
                                </Box>
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    fontFamily: 'Nunito, sans-serif',
                                    opacity: 0.9,
                                    wordBreak: 'break-word',
                                    lineHeight: 1.2
                                  }}
                                >
                                  {a.location}
                                </Typography>
                                {a.joiners && a.joiners.length > 0 && (
                                  <Typography 
                                    variant="body2" 
                                    sx={{ 
                                      fontFamily: 'Nunito, sans-serif',
                                      mt: 1,
                                      fontSize: '0.75rem',
                                      opacity: 0.8,
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 0.5
                                    }}
                                  >
                                    {formatJoiners(a.joiners)}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </Paper>
                        ))}
                    </Box>
                  </Box>
                </Box>
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
    </Box>
  );
};

export default Calendar;
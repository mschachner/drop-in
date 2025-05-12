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
  FormLabel
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import axios from 'axios';

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

// Function to determine if text should be black or white based on background color
const getTextColor = (backgroundColor) => {
  const luminance = calculateLuminance(backgroundColor);
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
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

// Function to create a very light pastel version of a color
const createPastelColor = (hex) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  // Mix with white to create a very light pastel (80% white, 20% color)
  const pastelR = Math.round((rgb.r * 0.2) + (255 * 0.8));
  const pastelG = Math.round((rgb.g * 0.2) + (255 * 0.8));
  const pastelB = Math.round((rgb.b * 0.2) + (255 * 0.8));
  
  return `rgb(${pastelR}, ${pastelG}, ${pastelB})`;
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
    color: COLORS[0].value
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
    console.log('Environment:', process.env.NODE_ENV);
    console.log('API URL:', process.env.REACT_APP_API_URL);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching from:', `${process.env.REACT_APP_API_URL}/api/availability`);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/availability`, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true
      });
      console.log('Response:', response.data);
      setAvailabilities(response.data);
      setError(null);
    } catch (err) {
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        url: `${process.env.REACT_APP_API_URL}/api/availability`,
        config: err.config
      });
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

      {/* User Preferences */}
      <Paper sx={{ 
        p: 2, 
        mb: 3, 
        borderRadius: 2, 
        fontFamily: 'Nunito, sans-serif',
        width: 'fit-content'
      }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              label="Your Name"
              fullWidth
              value={userPreferences.name}
              onChange={(e) => setUserPreferences({ ...userPreferences, name: e.target.value })}
              required
              InputProps={{
                sx: { fontFamily: 'Nunito, sans-serif' }
              }}
              InputLabelProps={{
                sx: { fontFamily: 'Nunito, sans-serif' }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={8}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              {COLORS.map((color) => (
                <Box
                  key={color.value}
                  onClick={(e) => {
                    e.stopPropagation();
                    setUserPreferences({ ...userPreferences, color: color.value });
                  }}
                  sx={{
                    width: 32,
                    height: 32,
                    backgroundColor: color.value,
                    borderRadius: '50%',
                    cursor: 'pointer',
                    border: userPreferences.color === color.value ? '3px solid #000' : 'none',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.1)',
                    }
                  }}
                />
              ))}
              <Box
                component="label"
                onClick={(e) => e.stopPropagation()}
                sx={{
                  width: 32,
                  height: 32,
                  backgroundColor: selectedColor,
                  borderRadius: '50%',
                  cursor: 'pointer',
                  border: userPreferences.color === selectedColor ? '3px solid #000' : 'none',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  '&:hover': {
                    transform: 'scale(1.1)',
                  }
                }}
              >
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => {
                    e.stopPropagation();
                    const newColor = e.target.value;
                    setSelectedColor(newColor);
                    setUserPreferences({ ...userPreferences, color: newColor });
                  }}
                  style={{
                    opacity: 0,
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    cursor: 'pointer',
                    top: 0,
                    left: 0
                  }}
                />
                <ColorLensIcon sx={{ color: getTextColor(selectedColor), fontSize: 20 }} />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Calendar Row */}
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
                        handleDayClick(date, 'day');
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
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.02)'
                      }
                    }}
                    onClick={() => handleDayClick(date, 'day')}
                  >
                    {dayAvailabilities
                      .filter(a => a.section !== 'evening')
                      .map((a, idx) => (
                        <Paper
                          key={idx}
                          sx={{
                            p: 1,
                            mb: 1,
                            backgroundColor: a.color,
                            color: getTextColor(a.color),
                            borderRadius: 1,
                            position: 'relative',
                            fontFamily: 'Nunito, sans-serif',
                            cursor: 'pointer',
                            '&:hover': {
                              opacity: 0.9
                            }
                          }}
                          onClick={(e) => handleEventClick(a, e)}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, fontFamily: 'Nunito, sans-serif' }}>
                              {a.name}
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: 'Nunito, sans-serif' }}>
                              {a.timeSlot}
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ fontFamily: 'Nunito, sans-serif' }}>
                            {a.location}
                          </Typography>
                          {a.joiners && a.joiners.length > 0 && (
                            <Typography variant="body2" sx={{ 
                              fontFamily: 'Nunito, sans-serif',
                              mt: 0.5,
                              fontSize: '0.75rem',
                              opacity: 0.9
                            }}>
                              {formatJoiners(a.joiners)}
                            </Typography>
                          )}
                          <Box sx={{ 
                            position: 'absolute', 
                            top: 0, 
                            right: 0,
                            display: 'flex',
                            gap: 0.5
                          }}>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEventClick(a, e);
                              }}
                              sx={{
                                color: getTextColor(a.color),
                                '&:hover': {
                                  backgroundColor: 'rgba(0, 0, 0, 0.1)'
                                },
                                minWidth: '60px',
                                justifyContent: 'flex-start',
                                gap: 0.5
                              }}
                            >
                              {isUserJoining(a) ? (
                                <>
                                  <span>Joined</span>
                                  <span style={{ fontSize: '1.2em' }}>✓</span>
                                </>
                              ) : (
                                'Join'
                              )}
                            </IconButton>
                            <IconButton
                              size="small"
                              sx={{
                                color: getTextColor(a.color),
                                '&:hover': {
                                  backgroundColor: 'rgba(0, 0, 0, 0.1)'
                                }
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(a._id);
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Paper>
                    ))}
                  </Box>

                  {/* Evening Section */}
                  <Box sx={{ 
                    flex: 1,
                    mt: 2,
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
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
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.02)'
                        }
                      }}
                      onClick={() => handleDayClick(date, 'evening')}
                    >
                      {dayAvailabilities
                        .filter(a => a.section === 'evening')
                        .map((a, idx) => (
                          <Paper
                            key={idx}
                            sx={{
                              p: 1,
                              mb: 1,
                              backgroundColor: a.color,
                              color: getTextColor(a.color),
                              borderRadius: 1,
                              position: 'relative',
                              fontFamily: 'Nunito, sans-serif',
                              cursor: 'pointer',
                              '&:hover': {
                                opacity: 0.9
                              }
                            }}
                            onClick={(e) => handleEventClick(a, e)}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700, fontFamily: 'Nunito, sans-serif' }}>
                                {a.name}
                              </Typography>
                              <Typography variant="body2" sx={{ fontFamily: 'Nunito, sans-serif' }}>
                                {a.timeSlot}
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ fontFamily: 'Nunito, sans-serif' }}>
                              {a.location}
                            </Typography>
                            {a.joiners && a.joiners.length > 0 && (
                              <Typography variant="body2" sx={{ 
                                fontFamily: 'Nunito, sans-serif',
                                mt: 0.5,
                                fontSize: '0.75rem',
                                opacity: 0.9
                              }}>
                                {formatJoiners(a.joiners)}
                              </Typography>
                            )}
                            <Box sx={{ 
                              position: 'absolute', 
                              top: 0, 
                              right: 0,
                              display: 'flex',
                              gap: 0.5
                            }}>
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEventClick(a, e);
                                }}
                                sx={{
                                  color: getTextColor(a.color),
                                  '&:hover': {
                                    backgroundColor: 'rgba(0, 0, 0, 0.1)'
                                  },
                                  minWidth: '60px',
                                  justifyContent: 'flex-start',
                                  gap: 0.5
                                }}
                              >
                                {isUserJoining(a) ? (
                                  <>
                                    <span>Joined</span>
                                    <span style={{ fontSize: '1.2em' }}>✓</span>
                                  </>
                                ) : (
                                  'Join'
                                )}
                              </IconButton>
                              <IconButton
                                size="small"
                                sx={{
                                  color: getTextColor(a.color),
                                  '&:hover': {
                                    backgroundColor: 'rgba(0, 0, 0, 0.1)'
                                  }
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(a._id);
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
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

      <Dialog 
        open={openDialog} 
        onClose={handleDialogClose}
        PaperProps={{
          sx: {
            borderRadius: 4,
            fontFamily: 'Nunito, sans-serif',
            margin: { xs: '16px', sm: '32px' },
            position: { xs: 'absolute', sm: 'relative' },
            top: { xs: '10%', sm: 'auto' }
          }
        }}
      >
        <DialogTitle sx={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600 }}>
          What are your plans on {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}?
        </DialogTitle>
        <DialogContent>
          {dialogError && (
            <Alert severity="error" sx={{ mb: 2, fontFamily: 'Nunito, sans-serif' }}>{dialogError}</Alert>
          )}
          <FormControl component="fieldset" sx={{ mb: 2, width: '100%' }}>
            <FormLabel component="legend" sx={{ fontFamily: 'Nunito, sans-serif' }}>Event Time</FormLabel>
            <RadioGroup
              row
              value={newEvent.section}
              onChange={(e) => setNewEvent({ ...newEvent, section: e.target.value })}
            >
              <FormControlLabel 
                value="day" 
                control={<Radio />} 
                label="Day" 
                sx={{ fontFamily: 'Nunito, sans-serif' }}
              />
              <FormControlLabel 
                value="evening" 
                control={<Radio />} 
                label="Evening" 
                sx={{ fontFamily: 'Nunito, sans-serif' }}
              />
            </RadioGroup>
          </FormControl>
          <TextField
            autoFocus
            margin="dense"
            label="Time"
            fullWidth
            value={newEvent.timeSlot}
            onChange={(e) => setNewEvent({ ...newEvent, timeSlot: e.target.value })}
            onKeyPress={handleKeyPress}
            sx={{ mb: 2 }}
            placeholder={selectedDate ? (newEvent.section === 'evening' ? '6-7pm' : '9-5') : ''}
            InputProps={{
              sx: { fontFamily: 'Nunito, sans-serif' }
            }}
            InputLabelProps={{
              sx: { fontFamily: 'Nunito, sans-serif' }
            }}
          />
          <TextField
            margin="dense"
            label="Location / Event"
            fullWidth
            value={newEvent.location}
            onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
            onKeyPress={handleKeyPress}
            InputProps={{
              sx: { fontFamily: 'Nunito, sans-serif' }
            }}
            InputLabelProps={{
              sx: { fontFamily: 'Nunito, sans-serif' }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleDialogClose}
            sx={{ 
              textTransform: 'none',
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 600
            }}
          >
            cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            sx={{ 
              backgroundColor: userPreferences.color,
              color: getTextColor(userPreferences.color),
              textTransform: 'none',
              borderRadius: 2,
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 600,
              transition: 'all 0.5s ease',
              '&:hover': {
                backgroundColor: userPreferences.color,
                opacity: 0.9
              }
            }}
          >
            add
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={openJoinDialog} 
        onClose={() => setOpenJoinDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: 4,
            fontFamily: 'Nunito, sans-serif',
            margin: { xs: '16px', sm: '32px' },
            position: { xs: 'absolute', sm: 'fixed' },
            top: { xs: '10%', sm: dialogPosition.top },
            left: { xs: 'auto', sm: dialogPosition.left },
            maxWidth: { xs: 'calc(100% - 32px)', sm: '400px' }
          }
        }}
      >
        <DialogTitle sx={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600 }}>
          {selectedEvent?.name}'s Event
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 1, fontFamily: 'Nunito, sans-serif' }}>
            {selectedEvent?.timeSlot}
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, fontFamily: 'Nunito, sans-serif' }}>
            {selectedEvent?.location}
          </Typography>
          {selectedEvent?.joiners?.length > 0 && (
            <Typography variant="body2" sx={{ mb: 2, fontFamily: 'Nunito, sans-serif' }}>
              {formatJoiners(selectedEvent.joiners)}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenJoinDialog(false)}
            sx={{ 
              textTransform: 'none',
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 600
            }}
          >
            cancel
          </Button>
          <Button 
            onClick={selectedEvent ? (isUserJoining(selectedEvent) ? handleUnjoinEvent : handleJoinEvent) : undefined}
            variant="contained" 
            sx={{ 
              backgroundColor: userPreferences.color,
              color: getTextColor(userPreferences.color),
              textTransform: 'none',
              borderRadius: 2,
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 600,
              transition: 'all 0.5s ease',
              '&:hover': {
                backgroundColor: userPreferences.color,
                opacity: 0.9
              }
            }}
          >
            {selectedEvent ? (isUserJoining(selectedEvent) ? 'unjoin' : 'join') : 'join'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Calendar;
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Grid, 
  Button, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Stack,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { format, addDays, parseISO } from 'date-fns';
import axios from 'axios';
import '@fontsource/nunito';

const COLORS = [
  { value: '#e74c3c', label: 'Red' },        // Bright red
  { value: '#ffb3b3', label: 'Light Red' },  // Soft red
  { value: '#f1c40f', label: 'Yellow' },     // Bright yellow
  { value: '#ffeaa7', label: 'Light Yellow' }, // Soft yellow
  { value: '#2ecc71', label: 'Green' },      // Bright emerald
  { value: '#a8e6cf', label: 'Light Green' }, // Mint
  { value: '#3498db', label: 'Blue' },       // Bright blue
  { value: '#b3e0ff', label: 'Light Blue' }, // Sky blue
  { value: '#9b59b6', label: 'Purple' },     // Bright purple
  { value: '#d8bfd8', label: 'Light Purple' } // Lavender
];

// Function to determine if a color is dark
const isDarkColor = (color) => {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 128;
};

const Calendar = () => {
  const [availabilities, setAvailabilities] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [newAvailability, setNewAvailability] = useState({
    timeSlot: '',
    location: ''
  });
  const [userPreferences, setUserPreferences] = useState({
    name: '',
    color: '#4a6741'
  });
  const [selectedSection, setSelectedSection] = useState('day');

  const days = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

  useEffect(() => {
    fetchAvailabilities();
    // Load saved preferences from localStorage
    const savedPreferences = localStorage.getItem('userPreferences');
    if (savedPreferences) {
      setUserPreferences(JSON.parse(savedPreferences));
    }
  }, []);

  const handlePreferencesChange = (field, value) => {
    const newPreferences = { ...userPreferences, [field]: value };
    setUserPreferences(newPreferences);
    localStorage.setItem('userPreferences', JSON.stringify(newPreferences));
  };

  const fetchAvailabilities = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/availability`);
      setAvailabilities(response.data);
    } catch (error) {
      console.error('Error fetching availabilities:', error);
    }
  };

  const handleAddAvailability = (date, section = 'day') => {
    if (!userPreferences.name) {
      alert('Please enter your name first');
      return;
    }
    setSelectedDate(date);
    setSelectedSection(section);
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    try {
      let timeSlot = newAvailability.timeSlot;
      if (selectedSection === 'evening' && timeSlot && !/pm|evening/i.test(timeSlot)) {
        timeSlot = timeSlot + ' pm';
      }
      await axios.post(`${process.env.REACT_APP_API_URL}/api/availability`, {
        date: selectedDate,
        timeSlot,
        location: newAvailability.location,
        name: userPreferences.name,
        color: userPreferences.color,
        section: selectedSection
      });
      setOpenDialog(false);
      setNewAvailability({ timeSlot: '', location: '' });
      fetchAvailabilities();
    } catch (error) {
      console.error('Error adding availability:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/availability/${id}`);
      fetchAvailabilities();
    } catch (error) {
      console.error('Error deleting availability:', error);
    }
  };

  const getAvailabilitiesForDate = (date) => {
    return availabilities.filter(avail => 
      format(parseISO(avail.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSubmit();
    }
  };

  const handleCellClick = (day, event) => {
    if (event.target === event.currentTarget) {
      handleAddAvailability(day);
    }
  };

  return (
    <Box sx={{ 
      p: 4,
      bgcolor: '#f0f7f0',
      minHeight: '100vh',
      fontFamily: 'Nunito, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      boxSizing: 'border-box',
      m: 0
    }}>
      <Box sx={{ 
        width: '100%',
        maxWidth: '1600px',
        boxSizing: 'border-box',
        m: 0
      }}>
        <Stack direction="row" spacing={2} sx={{ mb: 4, alignItems: 'center' }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontFamily: 'Nunito, sans-serif',
              textTransform: 'lowercase',
              '&::first-letter': {
                textTransform: 'uppercase'
              },
              fontStyle: 'italic',
              mr: 2
            }}
          >
            This week
          </Typography>
          <TextField
            label="Your Name"
            value={userPreferences.name}
            onChange={(e) => handlePreferencesChange('name', e.target.value)}
            placeholder="Enter your name"
            sx={{ 
              fontFamily: 'Nunito, sans-serif',
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px'
              }
            }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ fontFamily: 'Nunito, sans-serif' }}>
              Your Color:
            </Typography>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: 1,
              width: '200px'
            }}>
              {COLORS.map((color) => (
                <Box
                  key={color.value}
                  onClick={() => handlePreferencesChange('color', color.value)}
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: color.value,
                    cursor: 'pointer',
                    position: 'relative',
                    border: userPreferences.color === color.value ? '2px solid #000' : '2px solid transparent',
                    '&:hover': {
                      opacity: 0.8
                    },
                    '&::after': userPreferences.color === color.value ? {
                      content: '""',
                      position: 'absolute',
                      top: -4,
                      left: -4,
                      right: -4,
                      bottom: -4,
                      border: '2px solid #000',
                      borderRadius: '50%',
                      opacity: 0.3
                    } : {}
                  }}
                />
              ))}
            </Box>
          </Box>
        </Stack>
        
        <TableContainer 
          component={Paper} 
          sx={{ 
            bgcolor: '#ffffff',
            borderRadius: '16px',
            overflow: 'hidden',
            width: '100%'
          }}
          role="grid"
          aria-label="Weekly calendar"
        >
          <Table sx={{ tableLayout: 'fixed' }}>
            <TableHead>
              <TableRow>
                {days.map((day) => (
                  <TableCell 
                    key={day.toString()} 
                    align="center" 
                    sx={{ 
                      fontFamily: 'Nunito, sans-serif',
                      borderRight: '1px solid #e0e0e0',
                      bgcolor: [0, 6].includes(day.getDay()) ? '#f8f8f8' : '#ffffff',
                      width: `${100/7}%`,
                      py: 2,
                      '&:last-child': {
                        borderRight: 'none'
                      }
                    }}
                    role="columnheader"
                    aria-label={`${format(day, 'EEEE')} ${format(day, 'MMM d')}`}
                  >
                    <Typography variant="h6" sx={{ fontFamily: 'Nunito, sans-serif', mb: 1 }}>
                      {format(day, 'EEEE')}
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontFamily: 'Nunito, sans-serif' }}>
                      {format(day, 'MMM d')}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                {days.map((day) => (
                  <TableCell 
                    key={day.toString()} 
                    sx={{ 
                      height: '400px',
                      verticalAlign: 'top',
                      position: 'relative',
                      borderRight: '1px solid #e0e0e0',
                      bgcolor: [0, 6].includes(day.getDay()) ? '#f8f8f8' : '#ffffff',
                      width: `${100/7}%`,
                      p: 2,
                      '&:last-child': {
                        borderRight: 'none'
                      }
                    }}
                    role="gridcell"
                    aria-label={`${format(day, 'EEEE')} ${format(day, 'MMM d')} events`}
                  >
                    {/* Day Section */}
                    <Box 
                      onClick={(e) => { if (e.target === e.currentTarget) handleAddAvailability(day, 'day'); }}
                      sx={{ 
                        height: '100%',
                        width: '100%',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        cursor: 'pointer',
                        zIndex: 0,
                        '&:hover': {
                          bgcolor: [0, 6].includes(day.getDay()) ? '#f0f0f0' : '#f8faf8'
                        }
                      }}
                    />
                    <Box 
                      sx={{ 
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        zIndex: 1,
                        pointerEvents: 'none'
                      }}
                    >
                      <Box 
                        sx={{ 
                          flex: 1,
                          overflowY: 'auto', 
                          pr: 1,
                          pointerEvents: 'none'
                        }}
                      >
                        {getAvailabilitiesForDate(day)
                          .filter(a => a.section === 'day')
                          .map((availability, index) => (
                            <Box 
                              key={index} 
                              sx={{ 
                                mb: 1.5,
                                p: 1.5,
                                bgcolor: availability.color || '#f8faf8', 
                                borderRadius: '12px',
                                position: 'relative',
                                pointerEvents: 'auto',
                                '&:hover .delete-button': {
                                  opacity: 1
                                }
                              }}
                              role="article"
                              aria-label={`Event: ${availability.name} at ${availability.timeSlot} in ${availability.location}`}
                            >
                              <IconButton
                                className="delete-button"
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(availability._id);
                                }}
                                sx={{
                                  position: 'absolute',
                                  top: 4,
                                  right: 4,
                                  opacity: 0,
                                  transition: 'opacity 0.2s',
                                  color: isDarkColor(availability.color) ? '#ffffff' : '#666',
                                  '&:hover': {
                                    color: '#d32f2f'
                                  }
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontWeight: 'bold', 
                                  fontFamily: 'Nunito, sans-serif', 
                                  pr: 4, 
                                  mb: 0.25,
                                  color: isDarkColor(availability.color) ? '#ffffff' : '#000000'
                                }}
                              >
                                {availability.name}
                              </Typography>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontFamily: 'Nunito, sans-serif', 
                                  mb: 0.25,
                                  color: isDarkColor(availability.color) ? '#ffffff' : '#000000'
                                }}
                              >
                                {availability.timeSlot}
                              </Typography>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontFamily: 'Nunito, sans-serif',
                                  color: isDarkColor(availability.color) ? '#ffffff' : 'text.secondary'
                                }}
                              >
                                {availability.location}
                              </Typography>
                            </Box>
                          ))}
                      </Box>
                      <Box 
                        sx={{ 
                          position: 'absolute', 
                          bottom: 16, 
                          right: 16,
                          zIndex: 2,
                          pointerEvents: 'auto'
                        }}
                      >
                        <Button 
                          variant="contained" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddAvailability(day, 'day');
                          }}
                          sx={{ 
                            minWidth: '40px',
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            p: 0,
                            fontFamily: 'Nunito, sans-serif',
                            fontSize: '1.5rem',
                            bgcolor: '#4a6741',
                            '&:hover': {
                              bgcolor: '#3d5636'
                            }
                          }}
                          aria-label={`Add event for ${format(day, 'MMMM d')}`}
                        >
                          +
                        </Button>
                      </Box>
                    </Box>
                    {/* Evening Section */}
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, color: '#666', fontFamily: 'Nunito, sans-serif', fontWeight: 600 }}>
                        Evening
                      </Typography>
                      <Box 
                        onClick={(e) => { if (e.target === e.currentTarget) handleAddAvailability(day, 'evening'); }}
                        sx={{ cursor: 'pointer', minHeight: '40px' }}
                      >
                        {getAvailabilitiesForDate(day)
                          .filter(a => a.section === 'evening')
                          .map((availability, index) => (
                            <Box 
                              key={index} 
                              sx={{ 
                                mb: 1.5,
                                p: 1.5,
                                bgcolor: availability.color || '#f8faf8', 
                                borderRadius: '12px',
                                position: 'relative',
                                pointerEvents: 'auto',
                                '&:hover .delete-button': {
                                  opacity: 1
                                }
                              }}
                              role="article"
                              aria-label={`Event: ${availability.name} at ${availability.timeSlot} in ${availability.location}`}
                            >
                              <IconButton
                                className="delete-button"
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(availability._id);
                                }}
                                sx={{
                                  position: 'absolute',
                                  top: 4,
                                  right: 4,
                                  opacity: 0,
                                  transition: 'opacity 0.2s',
                                  color: isDarkColor(availability.color) ? '#ffffff' : '#666',
                                  '&:hover': {
                                    color: '#d32f2f'
                                  }
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontWeight: 'bold', 
                                  fontFamily: 'Nunito, sans-serif', 
                                  pr: 4, 
                                  mb: 0.25,
                                  color: isDarkColor(availability.color) ? '#ffffff' : '#000000'
                                }}
                              >
                                {availability.name}
                              </Typography>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontFamily: 'Nunito, sans-serif', 
                                  mb: 0.25,
                                  color: isDarkColor(availability.color) ? '#ffffff' : '#000000'
                                }}
                              >
                                {availability.timeSlot}
                              </Typography>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontFamily: 'Nunito, sans-serif',
                                  color: isDarkColor(availability.color) ? '#ffffff' : 'text.secondary'
                                }}
                              >
                                {availability.location}
                              </Typography>
                            </Box>
                          ))}
                      </Box>
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: '16px'
          }
        }}
      >
        <DialogTitle sx={{ fontFamily: 'Nunito, sans-serif' }}>
          What are your plans on {selectedDate && format(selectedDate, 'MMMM d')}?
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Time Slot"
            fullWidth
            value={newAvailability.timeSlot}
            onChange={(e) => setNewAvailability({ ...newAvailability, timeSlot: e.target.value })}
            onKeyPress={handleKeyPress}
            placeholder={selectedSection === 'evening' ? 'e.g., 6:00 PM - 8:00 PM' : 'e.g., 9:00 AM - 5:00 PM'}
            sx={{ 
              fontFamily: 'Nunito, sans-serif',
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px'
              }
            }}
          />
          <TextField
            margin="dense"
            label="Location"
            fullWidth
            value={newAvailability.location}
            onChange={(e) => setNewAvailability({ ...newAvailability, location: e.target.value })}
            onKeyPress={handleKeyPress}
            placeholder="e.g., Conference Room A"
            sx={{ 
              fontFamily: 'Nunito, sans-serif',
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px'
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenDialog(false)} 
            sx={{ 
              fontFamily: 'Nunito, sans-serif',
              textTransform: 'lowercase',
              borderRadius: '12px'
            }}
          >
            cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            sx={{ 
              fontFamily: 'Nunito, sans-serif',
              textTransform: 'lowercase',
              borderRadius: '12px'
            }}
          >
            add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Calendar; 
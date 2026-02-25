import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  TextField,
  Box,
  Alert,
  Typography,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { getTextColor } from './colorUtils';
import IconPickerDialog from './IconPickerDialog';
import * as Icons from '@mui/icons-material';
import ErrorTooltip from '../ErrorTooltip';
import { SECTIONS } from '../../constants';

/**
 * Shared dialog for creating and editing events.
 * Pass `mode="create"` or `mode="edit"` to control title, subtitle, and button text.
 */
const EventFormDialog = ({
  open,
  onClose,
  selectedDate,
  newEvent,
  setNewEvent,
  handleSubmit,
  handleKeyPress,
  dialogError,
  userPreferences,
  darkMode,
  isMobile,
  mode = 'create'
}) => {
  const [iconAnchorEl, setIconAnchorEl] = useState(null);

  const isCreate = mode === 'create';

  const handleIconSelect = (icon) => {
    setNewEvent({ ...newEvent, icon });
    setIconAnchorEl(null);
  };

  const formatDate = (date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    }
  };

  const handleSectionChange = (section) => {
    setNewEvent({ ...newEvent, section });
  };

  const title = isCreate ? 'Create New Event' : 'Edit Event';
  const subtitle = isCreate ? formatDate(selectedDate) : 'Update your event details';
  const submitLabel = isCreate ? 'Create Event' : 'Update Event';
  const defaultIcon = isCreate ? <Icons.Add sx={{ fontSize: 'large' }} /> : <Icons.Edit sx={{ fontSize: 'large' }} />;
  const iconLabel = isCreate ? 'Choose Icon' : 'Change Icon';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          fontFamily: 'Nunito, sans-serif',
          margin: { xs: '16px', sm: '32px' },
          position: { xs: 'absolute', sm: 'relative' },
          top: { xs: '10%', sm: 'auto' },
          backgroundColor: darkMode ? '#424242' : 'white',
          color: darkMode ? '#fff' : 'inherit',
          boxShadow: darkMode
            ? '0 25px 50px rgba(0,0,0,0.7)'
            : '0 25px 50px rgba(0,0,0,0.2)',
          border: darkMode ? '1px solid #555' : '1px solid #e0e0e0',
          overflow: 'hidden'
        }
      }}
    >
      {/* Header with Icon Picker */}
      <Box sx={{
        background: `linear-gradient(135deg, ${userPreferences.color}20, ${userPreferences.color}08)`,
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative background elements */}
        <Box sx={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${userPreferences.color}15, transparent)`,
          animation: 'eventFormPulse 3s ease-in-out infinite'
        }} />
        <Box sx={{
          position: 'absolute',
          bottom: -30,
          left: -30,
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${userPreferences.color}10, transparent)`,
          animation: 'eventFormPulse 3s ease-in-out infinite 1.5s'
        }} />

        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 3,
          pb: 2
        }}>
          <Box sx={{ flex: 1 }}>
            <DialogTitle sx={{
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 800,
              fontSize: '1.75rem',
              color: darkMode ? '#fff' : '#333',
              p: 0,
              mb: 1,
              background: `linear-gradient(45deg, ${userPreferences.color}, ${darkMode ? '#fff' : '#333'})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {title}
            </DialogTitle>
            <Typography
              variant="body1"
              sx={{
                color: darkMode ? '#ccc' : '#666',
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 600,
                fontSize: '1.1rem'
              }}
            >
              {subtitle}
            </Typography>
          </Box>

          {/* Icon Picker */}
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            ml: 2
          }}>
            <IconButton
              onClick={(e) => setIconAnchorEl(e.currentTarget)}
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                backgroundColor: userPreferences.color,
                color: getTextColor(userPreferences.color),
                transition: 'all 0.3s ease',
                boxShadow: `0 8px 25px ${userPreferences.color}50`,
                border: `2px solid ${userPreferences.color}30`,
                '&:hover': {
                  transform: 'scale(1.1) rotate(5deg)',
                  boxShadow: `0 12px 35px ${userPreferences.color}70`,
                  borderColor: userPreferences.color
                }
              }}
            >
              {newEvent.icon ? (
                Icons[newEvent.icon] ? (
                  React.createElement(Icons[newEvent.icon], { fontSize: 'large' })
                ) : (
                  <span style={{ fontSize: '1.5rem' }}>{newEvent.icon}</span>
                )
              ) : defaultIcon}
            </IconButton>
            <Typography variant="caption" sx={{
              color: darkMode ? '#ccc' : '#666',
              fontFamily: 'Nunito, sans-serif',
              mt: 0.5,
              fontWeight: 500
            }}>
              {iconLabel}
            </Typography>
          </Box>
        </Box>
      </Box>

      <DialogContent sx={{ p: 3, pt: 2 }}>
        {dialogError && isMobile && (
          <Alert
            severity="error"
            sx={{
              mb: 2,
              fontFamily: 'Nunito, sans-serif',
              borderRadius: 3,
              '& .MuiAlert-icon': {
                color: '#f44336'
              }
            }}
          >
            {dialogError}
          </Alert>
        )}
        {!isMobile && <ErrorTooltip message={dialogError} />}

        {/* Section Picker */}
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="h6" sx={{
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 700,
            color: darkMode ? '#fff' : '#333',
            mb: 1.5,
            fontSize: '1.1rem'
          }}>
            When is this happening?
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            {[
              { key: SECTIONS.DAY, label: 'Day' },
              { key: SECTIONS.EVENING, label: 'Evening' }
            ].map(({ key, label }) => (
              <Box
                key={key}
                onClick={() => handleSectionChange(key)}
                sx={{
                  flex: 1,
                  p: 2,
                  borderRadius: 3,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  backgroundColor: newEvent.section === key
                    ? userPreferences.color
                    : (darkMode ? '#61616130' : '#f8f9fa'),
                  border: `2px solid ${newEvent.section === key ? userPreferences.color : (darkMode ? '#555' : '#e0e0e0')}`,
                  color: newEvent.section === key ? getTextColor(userPreferences.color) : (darkMode ? '#fff' : '#333'),
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: newEvent.section === key
                      ? `0 8px 25px ${userPreferences.color}50`
                      : '0 4px 15px rgba(0,0,0,0.1)'
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: `linear-gradient(90deg, transparent, ${userPreferences.color}20, transparent)`,
                    transition: 'left 0.5s ease',
                  },
                  '&:hover::before': {
                    left: '100%'
                  }
                }}
              >
                <Typography sx={{
                  fontFamily: 'Nunito, sans-serif',
                  fontWeight: 700,
                  fontSize: '1.1rem'
                }}>
                  {label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Event Details */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 700,
            color: darkMode ? '#fff' : '#333',
            mb: 1.5,
            fontSize: '1.1rem'
          }}>
            Event Details
          </Typography>

          <TextField
            autoFocus
            margin="dense"
            label="What time?"
            fullWidth
            value={newEvent.timeSlot}
            onChange={(e) => setNewEvent({ ...newEvent, timeSlot: e.target.value })}
            onKeyPress={handleKeyPress}
            sx={{ mb: 1.5 }}
            placeholder={selectedDate ? (newEvent.section === SECTIONS.EVENING ? '6:00 PM' : '9:00 AM') : ''}
            InputProps={{
              sx: {
                fontFamily: 'Nunito, sans-serif',
                backgroundColor: darkMode ? '#616161' : '#f8f9fa',
                color: darkMode ? '#fff' : '#333',
                borderRadius: 2.5,
                '& fieldset': {
                  borderColor: darkMode ? '#555' : '#e0e0e0',
                  borderWidth: '2px'
                },
                '&:hover fieldset': {
                  borderColor: userPreferences.color
                },
                '&.Mui-focused fieldset': {
                  borderColor: userPreferences.color,
                  borderWidth: '2px'
                }
              }
            }}
            InputLabelProps={{
              sx: {
                fontFamily: 'Nunito, sans-serif',
                color: darkMode ? '#ccc' : '#666',
                fontWeight: 600
              }
            }}
          />

          <TextField
            margin="dense"
            label="Where or what is it?"
            fullWidth
            value={newEvent.location}
            onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
            onKeyPress={handleKeyPress}
            InputProps={{
              sx: {
                fontFamily: 'Nunito, sans-serif',
                backgroundColor: darkMode ? '#616161' : '#f8f9fa',
                color: darkMode ? '#fff' : '#333',
                borderRadius: 2.5,
                '& fieldset': {
                  borderColor: darkMode ? '#555' : '#e0e0e0',
                  borderWidth: '2px'
                },
                '&:hover fieldset': {
                  borderColor: userPreferences.color
                },
                '&.Mui-focused fieldset': {
                  borderColor: userPreferences.color,
                  borderWidth: '2px'
                }
              }
            }}
            InputLabelProps={{
              sx: {
                fontFamily: 'Nunito, sans-serif',
                color: darkMode ? '#ccc' : '#666',
                fontWeight: 600
              }
            }}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={newEvent.recurring || false}
                onChange={(e) => setNewEvent({ ...newEvent, recurring: e.target.checked })}
                sx={{
                  color: darkMode ? '#ccc' : '#666',
                  '&.Mui-checked': {
                    color: userPreferences.color
                  }
                }}
              />
            }
            label="Repeat weekly"
            sx={{
              mt: 1,
              fontFamily: 'Nunito, sans-serif',
              color: darkMode ? '#ccc' : '#666',
              fontWeight: 600
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1, gap: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            textTransform: 'none',
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 600,
            borderRadius: 2.5,
            px: 3,
            py: 1.5,
            borderColor: darkMode ? '#555' : '#e0e0e0',
            color: darkMode ? '#fff' : '#333',
            transition: 'all 0.3s ease',
            '&:hover': {
              borderColor: userPreferences.color,
              backgroundColor: `${userPreferences.color}10`,
              transform: 'translateY(-1px)'
            }
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{
            background: `linear-gradient(45deg, ${userPreferences.color}, ${userPreferences.color}dd)`,
            color: getTextColor(userPreferences.color),
            textTransform: 'none',
            borderRadius: 2.5,
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 700,
            px: 3,
            py: 1.5,
            transition: 'all 0.3s ease',
            boxShadow: `0 6px 20px ${userPreferences.color}50`,
            '&:hover': {
              background: `linear-gradient(45deg, ${userPreferences.color}dd, ${userPreferences.color})`,
              transform: 'translateY(-2px)',
              boxShadow: `0 10px 30px ${userPreferences.color}70`
            }
          }}
        >
          {submitLabel}
        </Button>
      </DialogActions>

      <IconPickerDialog
        anchorEl={iconAnchorEl}
        onClose={() => setIconAnchorEl(null)}
        onSelect={handleIconSelect}
        userColor={userPreferences.color}
        darkMode={darkMode}
      />

      <style>
        {`
          @keyframes eventFormPulse {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 0.6; transform: scale(1.1); }
          }
        `}
      </style>
    </Dialog>
  );
};

EventFormDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  selectedDate: PropTypes.instanceOf(Date),
  newEvent: PropTypes.shape({
    timeSlot: PropTypes.string,
    location: PropTypes.string,
    section: PropTypes.string,
    icon: PropTypes.string,
    recurring: PropTypes.bool,
  }).isRequired,
  setNewEvent: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  handleKeyPress: PropTypes.func.isRequired,
  dialogError: PropTypes.string,
  userPreferences: PropTypes.shape({
    color: PropTypes.string.isRequired,
  }).isRequired,
  darkMode: PropTypes.bool.isRequired,
  isMobile: PropTypes.bool.isRequired,
  mode: PropTypes.oneOf(['create', 'edit']),
};

export default EventFormDialog;

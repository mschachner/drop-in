import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  TextField,
  Box,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert
} from '@mui/material';
import { getTextColor } from './colorUtils';
import IconPickerDialog from './IconPickerDialog';
import * as Icons from '@mui/icons-material';

const EditEventDialog = ({
  open,
  onClose,
  selectedDate,
  newEvent,
  setNewEvent,
  handleSubmit,
  handleKeyPress,
  dialogError,
  userPreferences,
  darkMode
}) => {
  const [iconAnchorEl, setIconAnchorEl] = useState(null);

  const handleIconSelect = (icon) => {
    setNewEvent({ ...newEvent, icon });
    setIconAnchorEl(null);
  };
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 4,
          fontFamily: 'Nunito, sans-serif',
          margin: { xs: '16px', sm: '32px' },
          position: { xs: 'absolute', sm: 'relative' },
          top: { xs: '10%', sm: 'auto' },
          backgroundColor: darkMode ? '#616161' : 'white',
          color: darkMode ? '#fff' : 'inherit'
        }
      }}
    >
      <DialogTitle sx={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600 }}>
        Edit event
      </DialogTitle>
      <DialogContent>
        {dialogError && (
          <Alert severity="error" sx={{ mb: 2, fontFamily: 'Nunito, sans-serif' }}>{dialogError}</Alert>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton
            onClick={(e) => setIconAnchorEl(e.currentTarget)}
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: darkMode ? '#757575' : '#ccc',
              color: darkMode ? '#fff' : '#333',
              mr: 2
            }}
          >
            {newEvent.icon ? (
              Icons[newEvent.icon] ? (
                React.createElement(Icons[newEvent.icon])
              ) : (
                <span>{newEvent.icon}</span>
              )
            ) : (
              <Icons.Edit />
            )}
          </IconButton>
          <FormControl component="fieldset" sx={{ width: '100%' }}>
            <FormLabel component="legend" sx={{ fontFamily: 'Nunito, sans-serif', color: darkMode ? '#fff' : 'inherit' }}>Event Time</FormLabel>
            <RadioGroup
              row
              value={newEvent.section}
              onChange={(e) => setNewEvent({ ...newEvent, section: e.target.value })}
            >
              <FormControlLabel
                value="day"
                control={<Radio />}
                label="Day"
                sx={{ fontFamily: 'Nunito, sans-serif', color: darkMode ? '#fff' : 'inherit' }}
              />
              <FormControlLabel
                value="evening"
                control={<Radio />}
                label="Evening"
                sx={{ fontFamily: 'Nunito, sans-serif', color: darkMode ? '#fff' : 'inherit' }}
              />
            </RadioGroup>
          </FormControl>
        </Box>
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
            sx: {
              fontFamily: 'Nunito, sans-serif',
              backgroundColor: darkMode ? '#757575' : 'white',
              color: darkMode ? '#fff' : 'inherit',
              '& fieldset': {
                borderColor: darkMode ? '#bbb' : 'inherit'
              }
            }
          }}
          InputLabelProps={{
            sx: { fontFamily: 'Nunito, sans-serif', color: darkMode ? '#fff' : 'inherit' }
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
            sx: {
              fontFamily: 'Nunito, sans-serif',
              backgroundColor: darkMode ? '#757575' : 'white',
              color: darkMode ? '#fff' : 'inherit',
              '& fieldset': {
                borderColor: darkMode ? '#bbb' : 'inherit'
              }
            }
          }}
          InputLabelProps={{
            sx: { fontFamily: 'Nunito, sans-serif', color: darkMode ? '#fff' : 'inherit' }
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
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
          save
        </Button>
      </DialogActions>
      <IconPickerDialog
        anchorEl={iconAnchorEl}
        onClose={() => setIconAnchorEl(null)}
        onSelect={handleIconSelect}
        userColor={userPreferences.color}
        darkMode={darkMode}
      />
    </Dialog>
  );
};

export default EditEventDialog;


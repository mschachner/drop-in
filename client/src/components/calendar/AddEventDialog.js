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
import ErrorTooltip from '../ErrorTooltip';

const AddEventDialog = ({
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
  isMobile
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
        What are your plans on {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}?
      </DialogTitle>
      <DialogContent>
        {dialogError && isMobile && (
          <Alert severity="error" sx={{ mb: 2, fontFamily: 'Nunito, sans-serif' }}>{dialogError}</Alert>
        )}
        {!isMobile && <ErrorTooltip message={dialogError} />}
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
              <Icons.Add />
            )}
          </IconButton>
          <FormControl component="fieldset" sx={{ width: '100%' }}>
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
          add
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

AddEventDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  selectedDate: PropTypes.instanceOf(Date),
  newEvent: PropTypes.shape({
    timeSlot: PropTypes.string,
    location: PropTypes.string,
    section: PropTypes.string,
    icon: PropTypes.string,
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
};

export default AddEventDialog;

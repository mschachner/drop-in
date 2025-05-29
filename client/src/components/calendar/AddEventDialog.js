import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert
} from '@mui/material';
import { getTextColor } from './utils/colorUtils';

const AddEventDialog = ({
  open,
  onClose,
  selectedDate,
  newEvent,
  setNewEvent,
  handleSubmit,
  handleKeyPress,
  dialogError,
  userPreferences
}) => {
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
    </Dialog>
  );
};

export default AddEventDialog; 
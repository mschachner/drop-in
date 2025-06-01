import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from '@mui/material';
import { getTextColor } from './colorUtils';

const JoinEventDialog = ({
  open,
  onClose,
  selectedEvent,
  handleJoinEvent,
  handleUnjoinEvent,
  isUserJoining,
  userPreferences,
  formatJoiners
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
          position: { xs: 'absolute', sm: 'fixed' },
          top: { xs: '10%', sm: 'auto' },
          left: { xs: 'auto', sm: 'auto' },
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
  );
};

export default JoinEventDialog; 
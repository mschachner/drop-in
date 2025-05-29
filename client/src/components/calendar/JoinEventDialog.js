import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert
} from '@mui/material';
import { getTextColor } from './utils/colorUtils';

const JoinEventDialog = ({
  open,
  onClose,
  selectedEvent,
  joinName,
  setJoinName,
  handleJoinEvent,
  joinError,
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
        Join {selectedEvent?.location}
      </DialogTitle>
      <DialogContent>
        {joinError && (
          <Alert severity="error" sx={{ mb: 2, fontFamily: 'Nunito, sans-serif' }}>{joinError}</Alert>
        )}
        <TextField
          autoFocus
          margin="dense"
          label="Your Name"
          fullWidth
          value={joinName}
          onChange={(e) => setJoinName(e.target.value)}
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
          onClick={handleJoinEvent} 
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
          join
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default JoinEventDialog; 
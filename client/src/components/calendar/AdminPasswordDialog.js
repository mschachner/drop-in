import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography
} from '@mui/material';

const AdminPasswordDialog = ({ open, onClose, onSubmit, error, loading, darkMode }) => {
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (!open) return;
    setPassword('');
  }, [open]);

  const handleSubmit = async () => {
    await onSubmit(password);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          borderRadius: 4,
          fontFamily: 'Nunito, sans-serif',
          margin: { xs: '16px', sm: '32px' },
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
      <Box sx={{ background: darkMode ? 'linear-gradient(135deg, #2b2b2b, #353535)' : 'linear-gradient(135deg, #f7fafc, #fff)' }}>
        <DialogTitle
          sx={{
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 800,
            fontSize: '1.5rem',
            color: darkMode ? '#fff' : '#333',
            p: 3,
            pb: 1
          }}
        >
          Admin access
        </DialogTitle>
        <Typography
          variant="body2"
          sx={{
            px: 3,
            pb: 2,
            color: darkMode ? '#ccc' : '#666',
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 600
          }}
        >
          Enter the admin password to manage calendars.
        </Typography>
      </Box>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 3, pt: 2 }}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoFocus
          fullWidth
          onKeyPress={(event) => {
            if (event.key === 'Enter') {
              handleSubmit();
            }
          }}
          InputProps={{
            sx: {
              fontFamily: 'Nunito, sans-serif',
              backgroundColor: darkMode ? '#616161' : 'white',
              color: darkMode ? '#fff' : 'inherit',
              borderRadius: 2
            }
          }}
          InputLabelProps={{
            sx: {
              fontFamily: 'Nunito, sans-serif',
              color: darkMode ? '#fff' : 'inherit'
            }
          }}
        />
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 1.5 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none', fontFamily: 'Nunito, sans-serif' }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !password}
          sx={{ textTransform: 'none', fontFamily: 'Nunito, sans-serif', borderRadius: 2 }}
        >
          {loading ? 'Checking...' : 'Continue'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdminPasswordDialog;

import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Switch,
  TextField,
  Typography
} from '@mui/material';
import ColorModePicker from './ColorModePicker';

const CALENDAR_ID_PATTERN = /^[a-z0-9]{1,20}$/i;

const CalendarSwitcherDialog = ({
  open,
  onClose,
  onSubmit,
  error,
  defaultCalendarId = 'Default',
  darkMode
}) => {
  const [calendarId, setCalendarId] = useState(defaultCalendarId);
  const [createNew, setCreateNew] = useState(false);
  const [defaultColor, setDefaultColor] = useState('#66BB6A');
  const [selectedColor, setSelectedColor] = useState('#66BB6A');
  const [defaultDarkMode, setDefaultDarkMode] = useState(false);
  const [validationError, setValidationError] = useState('');

  const dialogDarkMode = createNew ? defaultDarkMode : darkMode;

  useEffect(() => {
    if (!open) return;
    setCalendarId(defaultCalendarId);
    setCreateNew(false);
    setDefaultColor('#66BB6A');
    setSelectedColor('#66BB6A');
    setDefaultDarkMode(false);
    setValidationError('');
  }, [open, defaultCalendarId]);

  const helperText = useMemo(() => {
    if (validationError) return validationError;
    return 'Alphanumeric, up to 20 characters';
  }, [validationError]);

  const handleSubmit = () => {
    const trimmedId = calendarId.trim();
    if (!CALENDAR_ID_PATTERN.test(trimmedId)) {
      setValidationError('Calendar ID must be alphanumeric and at most 20 characters.');
      return;
    }
    setValidationError('');
    onSubmit({
      calendarId: trimmedId,
      createNew,
      defaultColor,
      defaultDarkMode
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 4,
          fontFamily: 'Nunito, sans-serif',
          margin: { xs: '16px', sm: '32px' },
          backgroundColor: dialogDarkMode ? '#424242' : 'white',
          color: dialogDarkMode ? '#fff' : 'inherit',
          boxShadow: dialogDarkMode
            ? '0 25px 50px rgba(0,0,0,0.7)'
            : '0 25px 50px rgba(0,0,0,0.2)',
          border: dialogDarkMode ? '1px solid #555' : '1px solid #e0e0e0',
          overflow: 'hidden'
        }
      }}
    >
      <Box sx={{ background: dialogDarkMode ? 'linear-gradient(135deg, #2b2b2b, #353535)' : 'linear-gradient(135deg, #f7fafc, #fff)' }}>
        <DialogTitle
          sx={{
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 800,
            fontSize: '1.75rem',
            color: dialogDarkMode ? '#fff' : '#333',
            p: 3,
            pb: 1
          }}
        >
          Choose a calendar
        </DialogTitle>
        <Typography
          variant="body1"
          sx={{
            px: 3,
            pb: 2,
            color: dialogDarkMode ? '#ccc' : '#666',
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 600
          }}
        >
          Enter an existing calendar ID or create a brand-new one.
        </Typography>
      </Box>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 3, pt: 2 }}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          label="Calendar ID"
          value={calendarId}
          onChange={(event) => setCalendarId(event.target.value)}
          error={Boolean(validationError)}
          helperText={helperText}
          autoFocus
          fullWidth
          InputProps={{
            sx: {
              fontFamily: 'Nunito, sans-serif',
              backgroundColor: dialogDarkMode ? '#616161' : 'white',
              color: dialogDarkMode ? '#fff' : 'inherit',
              borderRadius: 2
            }
          }}
          InputLabelProps={{
            sx: {
              fontFamily: 'Nunito, sans-serif',
              color: dialogDarkMode ? '#fff' : 'inherit'
            }
          }}
        />
        <FormControlLabel
          control={
            <Switch
              checked={createNew}
              onChange={(event) => setCreateNew(event.target.checked)}
            />
          }
          label="Create new calendar"
          sx={{
            fontFamily: 'Nunito, sans-serif',
            '& .MuiFormControlLabel-label': {
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 600
            }
          }}
        />
        {createNew && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography
              variant="subtitle2"
              sx={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, color: dialogDarkMode ? '#fff' : '#333' }}
            >
              Default appearance
            </Typography>
            <ColorModePicker
              color={defaultColor}
              setColor={setDefaultColor}
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
              darkMode={defaultDarkMode}
              setDarkMode={setDefaultDarkMode}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 1.5 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none', fontFamily: 'Nunito, sans-serif' }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={{ textTransform: 'none', fontFamily: 'Nunito, sans-serif', borderRadius: 2 }}
        >
          {createNew ? 'Create calendar' : 'Load calendar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CalendarSwitcherDialog;

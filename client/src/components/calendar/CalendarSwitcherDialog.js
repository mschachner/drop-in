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
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Choose a calendar</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Enter an existing calendar ID or create a brand-new one.
        </Typography>
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
              backgroundColor: darkMode ? '#616161' : 'white',
              color: darkMode ? '#fff' : 'inherit'
            }
          }}
          InputLabelProps={{
            sx: {
              fontFamily: 'Nunito, sans-serif',
              color: darkMode ? '#fff' : 'inherit'
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
        />
        {createNew && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="subtitle2">Default appearance</Typography>
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
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {createNew ? 'Create calendar' : 'Load calendar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CalendarSwitcherDialog;

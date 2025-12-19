import React from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography
} from '@mui/material';

const AdminCalendarDialog = ({
  open,
  onClose,
  calendars,
  onOpenCalendar,
  onDeleteCalendar,
  onRefresh,
  loading,
  error,
  darkMode,
  busyCalendarId,
  activeCalendarId
}) => (
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
          fontSize: '1.6rem',
          color: darkMode ? '#fff' : '#333',
          p: 3,
          pb: 1
        }}
      >
        Calendar administration
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
        Manage existing calendars, or switch between them instantly.
      </Typography>
    </Box>
    <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 3, pt: 2 }}>
      {error && <Alert severity="error">{error}</Alert>}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography sx={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}>
          Calendars ({calendars.length})
        </Typography>
        <Button
          onClick={onRefresh}
          disabled={loading}
          sx={{ textTransform: 'none', fontFamily: 'Nunito, sans-serif' }}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </Box>
      <Divider />
      {calendars.length === 0 ? (
        <Typography sx={{ fontFamily: 'Nunito, sans-serif', color: darkMode ? '#ccc' : '#666' }}>
          No calendars found yet.
        </Typography>
      ) : (
        <List sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {calendars.map((calendar) => (
            <ListItem
              key={calendar.calendarId}
              sx={{
                borderRadius: 2,
                border: darkMode ? '1px solid #555' : '1px solid #e0e0e0',
                backgroundColor: darkMode ? '#3a3a3a' : '#fafafa',
                py: 1.5,
                px: 2
              }}
            >
              <ListItemText
                primary={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography sx={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}>
                      {calendar.calendarId}
                    </Typography>
                    {calendar.calendarId === activeCalendarId && (
                      <Chip
                        size="small"
                        label="Current"
                        color="success"
                        sx={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600 }}
                      />
                    )}
                  </Stack>
                }
                secondary={calendar.defaultColor ? `Default color: ${calendar.defaultColor}` : null}
                primaryTypographyProps={{ color: darkMode ? '#fff' : '#333' }}
                secondaryTypographyProps={{ color: darkMode ? '#ccc' : '#666' }}
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <Button
                  variant="outlined"
                  onClick={() => onOpenCalendar(calendar.calendarId)}
                  sx={{ textTransform: 'none', fontFamily: 'Nunito, sans-serif' }}
                >
                  Open
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => onDeleteCalendar(calendar.calendarId)}
                  disabled={busyCalendarId === calendar.calendarId}
                  sx={{ textTransform: 'none', fontFamily: 'Nunito, sans-serif' }}
                >
                  {busyCalendarId === calendar.calendarId ? 'Deleting...' : 'Delete'}
                </Button>
              </Stack>
            </ListItem>
          ))}
        </List>
      )}
    </DialogContent>
    <DialogActions sx={{ p: 3, pt: 1.5 }}>
      <Button onClick={onClose} sx={{ textTransform: 'none', fontFamily: 'Nunito, sans-serif' }}>
        Close
      </Button>
    </DialogActions>
  </Dialog>
);

export default AdminCalendarDialog;

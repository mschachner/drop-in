#!/bin/bash

# Enable debug mode
set -x

# Set Node.js memory limits and cleanup
export NODE_OPTIONS="--max-old-space-size=512"
export GENERATE_SOURCEMAP=false
export CI=false

# Cleanup function
cleanup() {
  echo "Cleaning up..."
  rm -rf node_modules
  rm -rf client/node_modules
  rm -rf client/build
  rm -rf /app/client/build
  npm cache clean --force
}

# Create necessary directories
mkdir -p client/public client/src/components

# Create minimal public/index.html
cat > client/public/index.html << 'EOL'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Drop In</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
EOL

# Create minimal src/index.js
cat > client/src/index.js << 'EOL'
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
EOL

# Create minimal src/App.js
cat > client/src/App.js << 'EOL'
import React from 'react';
import { ThemeProvider, createTheme, CssBaseline, Container } from '@mui/material';
import Calendar from './components/Calendar';

const theme = createTheme({
  palette: { mode: 'light' }
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xl">
        <Calendar />
      </Container>
    </ThemeProvider>
  );
}

export default App;
EOL

# Create minimal src/components/Calendar.js
cat > client/src/components/Calendar.js << 'EOL'
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  Fab,
  IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

const COLORS = [
  { value: '#4CAF50', label: 'Green' },
  { value: '#2196F3', label: 'Blue' },
  { value: '#FF9800', label: 'Orange' },
  { value: '#9C27B0', label: 'Purple' },
  { value: '#F44336', label: 'Red' },
];

const Calendar = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availabilities, setAvailabilities] = useState([]);
  const [currentDate] = useState(new Date());
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [userPreferences, setUserPreferences] = useState({
    name: '',
    color: COLORS[0].value
  });
  const [newEvent, setNewEvent] = useState({
    timeSlot: '',
    location: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/availability`);
      setAvailabilities(response.data);
      setError(null);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Failed to load availabilities');
    } finally {
      setLoading(false);
    }
  };

  const handleDayClick = (date) => {
    if (!userPreferences.name) {
      setError('Please enter your name first');
      return;
    }
    setSelectedDate(date);
    setNewEvent({
      timeSlot: '',
      location: ''
    });
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    if (!newEvent.timeSlot || !newEvent.location) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const eventData = {
        ...newEvent,
        name: userPreferences.name,
        color: userPreferences.color,
        date: selectedDate.toISOString()
      };
      await axios.post(`${process.env.REACT_APP_API_URL}/api/availability`, eventData);
      setOpenDialog(false);
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to add event');
    }
  };

  const handleDelete = async (eventId) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/availability/${eventId}`);
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to delete event');
    }
  };

  const getNextSevenDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: 4, 
      minHeight: '100vh',
      backgroundColor: '#E8F5E9', // Sage green background
      borderRadius: 2
    }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#2E7D32' }}>
        Next 7 Days
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}

      {/* User Preferences */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <TextField
              label="Your Name"
              fullWidth
              value={userPreferences.name}
              onChange={(e) => setUserPreferences({ ...userPreferences, name: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              {COLORS.map((color) => (
                <Box
                  key={color.value}
                  onClick={() => setUserPreferences({ ...userPreferences, color: color.value })}
                  sx={{
                    width: 32,
                    height: 32,
                    backgroundColor: color.value,
                    borderRadius: '50%',
                    cursor: 'pointer',
                    border: userPreferences.color === color.value ? '3px solid #000' : 'none',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      transition: 'transform 0.2s'
                    }
                  }}
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Calendar Row */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Grid container sx={{ minHeight: '600px' }}>
          {getNextSevenDays().map((date, index) => {
            const dayAvailabilities = availabilities.filter(a => 
              new Date(a.date).toDateString() === date.toDateString()
            );
            
            return (
              <Grid 
                item 
                xs 
                key={index}
                sx={{
                  borderRight: index < 6 ? '1px solid #e0e0e0' : 'none',
                  '&:last-child': {
                    borderRight: 'none'
                  }
                }}
              >
                <Box 
                  sx={{ 
                    p: 2,
                    height: '100%',
                    cursor: 'pointer',
                    backgroundColor: isWeekend(date) ? '#F5F5F5' : 'white',
                    position: 'relative',
                    '&:hover': {
                      backgroundColor: isWeekend(date) ? '#EEEEEE' : '#F5F5F5'
                    }
                  }}
                  onClick={() => handleDayClick(date)}
                >
                  <Typography 
                    variant="subtitle2" 
                    align="center" 
                    sx={{ 
                      fontWeight: 'bold',
                      color: date.toDateString() === new Date().toDateString() ? '#4CAF50' : 'inherit'
                    }}
                  >
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </Typography>
                  <Typography 
                    variant="h6" 
                    align="center"
                    sx={{ 
                      color: date.toDateString() === new Date().toDateString() ? '#4CAF50' : 'inherit',
                      mb: 2
                    }}
                  >
                    {date.getDate()}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  {dayAvailabilities.map((a, idx) => (
                    <Paper
                      key={idx}
                      sx={{
                        p: 1,
                        mb: 1,
                        backgroundColor: a.color,
                        color: 'white',
                        borderRadius: 1,
                        position: 'relative'
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          {a.name}
                        </Typography>
                        <Typography variant="body2">
                          {a.timeSlot}
                        </Typography>
                      </Box>
                      <Typography variant="body2">
                        {a.location}
                      </Typography>
                      <IconButton
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          color: 'white',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.1)'
                          }
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(a._id);
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Paper>
                  ))}
                  <Fab
                    size="small"
                    color="primary"
                    sx={{
                      position: 'absolute',
                      bottom: 16,
                      right: 16,
                      backgroundColor: '#4CAF50',
                      '&:hover': {
                        backgroundColor: '#388E3C'
                      }
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDayClick(date);
                    }}
                  >
                    <AddIcon />
                  </Fab>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add Event for {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Time"
            fullWidth
            value={newEvent.timeSlot}
            onChange={(e) => setNewEvent({ ...newEvent, timeSlot: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Location"
            fullWidth
            value={newEvent.location}
            onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" sx={{ backgroundColor: '#4CAF50' }}>
            Add Event
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Calendar;
EOL

# Create minimal package.json for client
cat > client/package.json << 'EOL'
{
  "name": "client",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@emotion/react": "^11.11.3",
    "@emotion/styled": "^11.11.0",
    "@mui/icons-material": "^5.15.10",
    "@mui/material": "^5.15.10",
    "axios": "^1.6.7",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "GENERATE_SOURCEMAP=false NODE_OPTIONS=--max-old-space-size=512 react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
EOL

# Create .env file for client
cat > client/.env << 'EOL'
GENERATE_SOURCEMAP=false
NODE_OPTIONS=--max-old-space-size=512
REACT_APP_API_URL=https://drop-in-production.up.railway.app
EOL

# Cleanup before starting
cleanup

# Install dependencies in smaller chunks
cd /app
echo "Installing root dependencies..."
npm install --no-optional --no-audit --no-fund

cd client
echo "Installing client dependencies..."
npm install --no-optional --no-audit --no-fund

# Debug: List contents before build
echo "Contents of client directory before build:"
ls -la

# Run build with minimal configuration
echo "Running React build..."
NODE_OPTIONS=--max-old-space-size=512 GENERATE_SOURCEMAP=false CI=false npm run build || {
  echo "React build failed!"
  exit 1
}

# Debug: List contents after build
echo "Contents of client directory after build:"
ls -la

echo "Contents of build directory:"
ls -la build

# Create client/build directory and move files
echo "Moving build files to the correct location..."
mkdir -p /app/client/build

# Copy all files from build directory
echo "Copying build files..."
cp -r build/* /app/client/build/

# Debug: List contents of /app/client/build directory
echo "Contents of /app/client/build directory:"
ls -la /app/client/build

# Debug: List contents of /app/client directory
echo "Contents of /app/client directory:"
ls -la /app/client

# Debug: List contents of /app directory
echo "Contents of /app directory:"
ls -la /app

# Cleanup after build but preserve /app/client/build
echo "Cleaning up temporary files..."
rm -rf node_modules
rm -rf client/node_modules
rm -rf client/build
npm cache clean --force

cd ..
node server.js 
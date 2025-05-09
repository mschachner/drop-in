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
  MenuItem,
  IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
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
  const [newEvent, setNewEvent] = useState({
    name: '',
    timeSlot: '',
    location: '',
    color: COLORS[0].value
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

  const handleAddEvent = (date) => {
    setSelectedDate(date);
    setNewEvent({
      name: '',
      timeSlot: '',
      location: '',
      color: COLORS[0].value
    });
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    if (!newEvent.name || !newEvent.timeSlot || !newEvent.location) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const eventData = {
        ...newEvent,
        date: selectedDate.toISOString()
      };
      await axios.post(`${process.env.REACT_APP_API_URL}/api/availability`, eventData);
      setOpenDialog(false);
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to add event');
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

      <Grid container spacing={2}>
        {getNextSevenDays().map((date, index) => {
          const dayAvailabilities = availabilities.filter(a => 
            new Date(a.date).toDateString() === date.toDateString()
          );
          
          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: 'white',
                  minHeight: '200px'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    {date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </Typography>
                  <IconButton 
                    onClick={() => handleAddEvent(date)}
                    sx={{ color: '#4CAF50' }}
                  >
                    <AddIcon />
                  </IconButton>
                </Box>
                
                {dayAvailabilities.map((a, idx) => (
                  <Paper
                    key={idx}
                    sx={{
                      p: 1,
                      mb: 1,
                      backgroundColor: a.color,
                      color: 'white',
                      borderRadius: 1
                    }}
                  >
                    <Typography variant="subtitle2">{a.name}</Typography>
                    <Typography variant="body2">{a.timeSlot}</Typography>
                    <Typography variant="body2">{a.location}</Typography>
                  </Paper>
                ))}
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add Event</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            value={newEvent.name}
            onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
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
            sx={{ mb: 2 }}
          />
          <TextField
            select
            margin="dense"
            label="Color"
            fullWidth
            value={newEvent.color}
            onChange={(e) => setNewEvent({ ...newEvent, color: e.target.value })}
          >
            {COLORS.map((color) => (
              <MenuItem key={color.value} value={color.value}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      backgroundColor: color.value,
                      borderRadius: 1,
                      mr: 1
                    }}
                  />
                  {color.label}
                </Box>
              </MenuItem>
            ))}
          </TextField>
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
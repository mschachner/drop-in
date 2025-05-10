#!/bin/bash

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
echo "Setting up project structure..."
mkdir -p client/public client/src/components

# Create minimal public/index.html
echo "Creating index.html..."
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
echo "Creating index.js..."
cat > client/src/index.js << 'EOL'
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
EOL

# Create minimal src/App.js
echo "Creating App.js..."
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
echo "Creating Calendar component..."
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

// Function to convert hex to RGB
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

// Function to create a very light pastel version of a color
const createPastelColor = (hex) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  // Mix with white to create a very light pastel (80% white, 20% color)
  const pastelR = Math.round((rgb.r * 0.2) + (255 * 0.8));
  const pastelG = Math.round((rgb.g * 0.2) + (255 * 0.8));
  const pastelB = Math.round((rgb.b * 0.2) + (255 * 0.8));
  
  return `rgb(${pastelR}, ${pastelG}, ${pastelB})`;
};

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
    // Add Nunito font
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

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

  const handleDayClick = (date, section) => {
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

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && newEvent.timeSlot && newEvent.location) {
      handleSubmit();
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

  const pastelColor = createPastelColor(userPreferences.color);

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
      backgroundColor: pastelColor,
      borderRadius: 2,
      fontFamily: 'Nunito, sans-serif',
      transition: 'background-color 0.5s ease'
    }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 4,
        gap: 2
      }}>
        <Typography 
          variant="h3" 
          sx={{ 
            color: userPreferences.color,
            fontWeight: 700,
            fontFamily: 'Nunito, sans-serif',
            letterSpacing: '-0.5px',
            position: 'relative',
            transition: 'color 0.5s ease',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -8,
              left: 0,
              width: '100%',
              height: '3px',
              backgroundColor: userPreferences.color,
              borderRadius: '2px',
              transition: 'background-color 0.5s ease'
            }
          }}
        >
          Next 7 Days
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2, fontFamily: 'Nunito, sans-serif' }}>{error}</Alert>
      )}

      {/* User Preferences */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2, fontFamily: 'Nunito, sans-serif' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              label="Your Name"
              fullWidth
              value={userPreferences.name}
              onChange={(e) => setUserPreferences({ ...userPreferences, name: e.target.value })}
              required
              InputProps={{
                sx: { fontFamily: 'Nunito, sans-serif' }
              }}
              InputLabelProps={{
                sx: { fontFamily: 'Nunito, sans-serif' }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={8}>
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
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.1)',
                    }
                  }}
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Calendar Row */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden', fontFamily: 'Nunito, sans-serif' }}>
        <Grid 
          container 
          sx={{ 
            minHeight: '600px',
            flexDirection: { xs: 'column', sm: 'row' }
          }}
        >
          {getNextSevenDays().map((date, index) => {
            const dayAvailabilities = availabilities.filter(a => 
              new Date(a.date).toDateString() === date.toDateString()
            );
            
            return (
              <Grid 
                item 
                xs={12}
                sm
                key={index}
                sx={{
                  borderRight: { sm: index < 6 ? '1px solid #e0e0e0' : 'none' },
                  borderBottom: { xs: index < 6 ? '1px solid #e0e0e0' : 'none', sm: 'none' },
                  '&:last-child': {
                    borderRight: 'none',
                    borderBottom: 'none'
                  }
                }}
              >
                <Box 
                  sx={{ 
                    p: 2,
                    height: { xs: 'auto', sm: '100%' },
                    minHeight: { xs: '300px', sm: '600px' },
                    backgroundColor: isWeekend(date) ? '#F5F5F5' : 'white',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <Typography 
                    variant="subtitle2" 
                    align="center" 
                    sx={{ 
                      fontWeight: 600,
                      color: date.toDateString() === new Date().toDateString() ? userPreferences.color : 'inherit',
                      fontFamily: 'Nunito, sans-serif',
                      transition: 'color 0.5s ease'
                    }}
                  >
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </Typography>
                  <Typography 
                    variant="h6" 
                    align="center"
                    sx={{ 
                      color: date.toDateString() === new Date().toDateString() ? userPreferences.color : 'inherit',
                      mb: 2,
                      fontFamily: 'Nunito, sans-serif',
                      fontWeight: 700,
                      transition: 'color 0.5s ease'
                    }}
                  >
                    {date.getDate()}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  {/* Day Section */}
                  <Box 
                    sx={{ 
                      height: { xs: 'auto', sm: '45%' },
                      minHeight: { xs: '120px', sm: 'auto' },
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.02)'
                      }
                    }}
                    onClick={() => handleDayClick(date, 'day')}
                  >
                    {dayAvailabilities
                      .filter(a => {
                        const time = a.timeSlot.toLowerCase();
                        return !time.includes('pm') && !time.includes('evening');
                      })
                      .map((a, idx) => (
                        <Paper
                          key={idx}
                          sx={{
                            p: 1,
                            mb: 1,
                            backgroundColor: a.color,
                            color: 'white',
                            borderRadius: 1,
                            position: 'relative',
                            fontFamily: 'Nunito, sans-serif'
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, fontFamily: 'Nunito, sans-serif' }}>
                              {a.name}
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: 'Nunito, sans-serif' }}>
                              {a.timeSlot}
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ fontFamily: 'Nunito, sans-serif' }}>
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
                  </Box>

                  {/* Evening Section */}
                  <Box sx={{ 
                    height: { xs: 'auto', sm: '45%' },
                    minHeight: { xs: '120px', sm: 'auto' },
                    mt: { xs: 2, sm: 'auto' },
                    mb: { xs: 2, sm: 'auto' },
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        mb: 1, 
                        color: '#666',
                        fontFamily: 'Nunito, sans-serif',
                        fontWeight: 600
                      }}
                    >
                      Evening
                    </Typography>
                    <Box 
                      sx={{ 
                        flex: 1,
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.02)'
                        }
                      }}
                      onClick={() => handleDayClick(date, 'evening')}
                    >
                      {dayAvailabilities
                        .filter(a => {
                          const time = a.timeSlot.toLowerCase();
                          return time.includes('pm') || time.includes('evening');
                        })
                        .map((a, idx) => (
                          <Paper
                            key={idx}
                            sx={{
                              p: 1,
                              mb: 1,
                              backgroundColor: a.color,
                              color: 'white',
                              borderRadius: 1,
                              position: 'relative',
                              fontFamily: 'Nunito, sans-serif'
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700, fontFamily: 'Nunito, sans-serif' }}>
                                {a.name}
                              </Typography>
                              <Typography variant="body2" sx={{ fontFamily: 'Nunito, sans-serif' }}>
                                {a.timeSlot}
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ fontFamily: 'Nunito, sans-serif' }}>
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
                    </Box>
                  </Box>

                  <Fab
                    size="small"
                    color="primary"
                    sx={{
                      position: 'absolute',
                      bottom: 16,
                      right: 16,
                      backgroundColor: userPreferences.color,
                      transition: 'all 0.5s ease',
                      '&:hover': {
                        backgroundColor: userPreferences.color,
                        opacity: 0.9
                      }
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDayClick(date, 'day');
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

      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: 4,
            fontFamily: 'Nunito, sans-serif'
          }
        }}
      >
        <DialogTitle sx={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600 }}>
          What are your plans on {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}?
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Time"
            fullWidth
            value={newEvent.timeSlot}
            onChange={(e) => setNewEvent({ ...newEvent, timeSlot: e.target.value })}
            onKeyPress={handleKeyPress}
            sx={{ mb: 2 }}
            placeholder={selectedDate ? (handleDayClick.toString().includes('evening') ? '6-7pm' : '9-5') : ''}
            InputProps={{
              sx: { fontFamily: 'Nunito, sans-serif' }
            }}
            InputLabelProps={{
              sx: { fontFamily: 'Nunito, sans-serif' }
            }}
          />
          <TextField
            margin="dense"
            label="Location"
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
            onClick={() => setOpenDialog(false)}
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
    </Box>
  );
};

export default Calendar;
EOL

# Create minimal package.json for client
echo "Creating package.json..."
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
    "react-scripts": "5.0.1",
    "rollup-plugin-terser": "^7.0.2",
    "workbox-build": "^6.6.0",
    "workbox-webpack-plugin": "^6.6.0",
    "sourcemap-codec": "^1.4.8",
    "@jridgewell/sourcemap-codec": "^1.4.15",
    "ajv": "^8.12.0",
    "ajv-keywords": "^5.1.0",
    "schema-utils": "^4.2.0",
    "@babel/plugin-proposal-class-properties": "^7.18.6",
    "@babel/plugin-proposal-private-property-in-object": "^7.21.11",
    "@babel/plugin-proposal-nullish-coalescing-operator": "^7.18.6",
    "@babel/plugin-proposal-numeric-separator": "^7.18.6",
    "@humanwhocodes/config-array": "^0.11.10"
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
  },
  "resolutions": {
    "sourcemap-codec": "^1.4.8",
    "ajv": "^8.12.0",
    "ajv-keywords": "^5.1.0",
    "schema-utils": "^4.2.0",
    "@babel/plugin-proposal-class-properties": "^7.18.6",
    "@babel/plugin-proposal-private-property-in-object": "^7.21.11",
    "@babel/plugin-proposal-nullish-coalescing-operator": "^7.18.6",
    "@babel/plugin-proposal-numeric-separator": "^7.18.6",
    "@humanwhocodes/config-array": "^0.11.10"
  },
  "overrides": {
    "svgo": "^2.8.0",
    "stable": "^0.1.8",
    "q": "^1.5.1",
    "domexception": "^3.0.0"
  }
}
EOL

# Create .npmrc to suppress warnings
echo "Creating .npmrc..."
cat > client/.npmrc << 'EOL'
loglevel=error
fund=false
audit=false
legacy-peer-deps=true
strict-peer-dependencies=false
EOL

# Create .env file for client
echo "Creating environment configuration..."
cat > client/.env << 'EOL'
GENERATE_SOURCEMAP=false
NODE_OPTIONS=--max-old-space-size=512
REACT_APP_API_URL=https://drop-in.up.railway.app
EOL

# Cleanup before starting
cleanup

# Install dependencies in smaller chunks
cd /app
echo "Installing root dependencies..."
npm install --omit=dev --omit=optional --no-audit --no-fund --loglevel=error

cd client
echo "Installing client dependencies..."
npm install --no-audit --no-fund --loglevel=error

# Run build with minimal configuration
echo "Building React application..."
NODE_OPTIONS=--max-old-space-size=512 GENERATE_SOURCEMAP=false CI=false npm run build || {
  echo "React build failed!"
  exit 1
}

# Create client/build directory and move files
echo "Moving build files to the correct location..."
mkdir -p /app/client/build

# Copy all files from build directory
echo "Copying build files..."
cp -r build/* /app/client/build/

# Cleanup after build but preserve /app/client/build
echo "Cleaning up temporary files..."
rm -rf node_modules
rm -rf client/node_modules
rm -rf client/build
npm cache clean --force

cd ..
echo "Starting server..."
node server.js 
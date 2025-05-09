#!/bin/bash

# Enable debug mode
set -x

# Create necessary directories
mkdir -p client/public client/src/components

# Create public/index.html
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

# Create src/index.js
cat > client/src/index.js << 'EOL'
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
EOL

# Create src/App.js
cat > client/src/App.js << 'EOL'
import React from 'react';
import { ThemeProvider, createTheme, CssBaseline, Container } from '@mui/material';
import Calendar from './components/Calendar';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
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

# Create src/index.css
cat > client/src/index.css << 'EOL'
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
EOL

# Create src/App.css
cat > client/src/App.css << 'EOL'
.App {
  text-align: center;
}
EOL

# Create src/components/Calendar.js
cat > client/src/components/Calendar.js << 'EOL'
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Grid, 
  Button, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Stack,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { format, addDays, parseISO } from 'date-fns';
import axios from 'axios';
import '@fontsource/nunito';

const COLORS = [
  { value: '#e74c3c', label: 'Red' },
  { value: '#ffb3b3', label: 'Light Red' },
  { value: '#f1c40f', label: 'Yellow' },
  { value: '#ffeaa7', label: 'Light Yellow' },
  { value: '#2ecc71', label: 'Green' },
  { value: '#a8e6cf', label: 'Light Green' },
  { value: '#3498db', label: 'Blue' },
  { value: '#b3e0ff', label: 'Light Blue' },
  { value: '#9b59b6', label: 'Purple' },
  { value: '#d8bfd8', label: 'Light Purple' }
];

const isDarkColor = (color) => {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 128;
};

const Calendar = () => {
  const [availabilities, setAvailabilities] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [newAvailability, setNewAvailability] = useState({
    timeSlot: '',
    location: ''
  });
  const [userPreferences, setUserPreferences] = useState({
    name: '',
    color: '#4a6741'
  });

  const days = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

  useEffect(() => {
    fetchAvailabilities();
    const savedPreferences = localStorage.getItem('userPreferences');
    if (savedPreferences) {
      setUserPreferences(JSON.parse(savedPreferences));
    }
  }, []);

  const handlePreferencesChange = (field, value) => {
    const newPreferences = { ...userPreferences, [field]: value };
    setUserPreferences(newPreferences);
    localStorage.setItem('userPreferences', JSON.stringify(newPreferences));
  };

  const fetchAvailabilities = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/availability`);
      setAvailabilities(response.data);
    } catch (error) {
      console.error('Error fetching availabilities:', error);
    }
  };

  const handleAddAvailability = (date) => {
    if (!userPreferences.name) {
      alert('Please enter your name first');
      return;
    }
    setSelectedDate(date);
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/availability`, {
        date: selectedDate,
        timeSlot: newAvailability.timeSlot,
        location: newAvailability.location,
        name: userPreferences.name,
        color: userPreferences.color
      });
      setOpenDialog(false);
      setNewAvailability({ timeSlot: '', location: '' });
      fetchAvailabilities();
    } catch (error) {
      console.error('Error adding availability:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/availability/${id}`);
      fetchAvailabilities();
    } catch (error) {
      console.error('Error deleting availability:', error);
    }
  };

  const getAvailabilitiesForDate = (date) => {
    return availabilities.filter(avail => 
      format(parseISO(avail.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSubmit();
    }
  };

  const handleCellClick = (day, event) => {
    if (event.target === event.currentTarget) {
      handleAddAvailability(day);
    }
  };

  return (
    <Box sx={{ 
      p: 4,
      bgcolor: '#f0f7f0',
      minHeight: '100vh',
      fontFamily: 'Nunito, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      boxSizing: 'border-box',
      m: 0
    }}>
      <Box sx={{ 
        width: '100%',
        maxWidth: '1600px',
        boxSizing: 'border-box',
        m: 0
      }}>
        <Stack direction="row" spacing={2} sx={{ mb: 4, alignItems: 'center' }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontFamily: 'Nunito, sans-serif',
              textTransform: 'lowercase',
              '&::first-letter': {
                textTransform: 'uppercase'
              },
              fontStyle: 'italic',
              mr: 2
            }}
          >
            This week
          </Typography>
          <TextField
            label="Your Name"
            value={userPreferences.name}
            onChange={(e) => handlePreferencesChange('name', e.target.value)}
            placeholder="Enter your name"
            sx={{ 
              fontFamily: 'Nunito, sans-serif',
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px'
              }
            }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ fontFamily: 'Nunito, sans-serif' }}>
              Your Color:
            </Typography>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: 1,
              width: '200px'
            }}>
              {COLORS.map((color) => (
                <ToggleButton
                  key={color.value}
                  value={color.value}
                  selected={userPreferences.color === color.value}
                  onChange={() => handlePreferencesChange('color', color.value)}
                  sx={{
                    p: 0.5,
                    border: 'none',
                    '&.Mui-selected': {
                      backgroundColor: 'transparent'
                    }
                  }}
                >
                  <Box
                    sx={{
                      width: '100%',
                      height: '20px',
                      backgroundColor: color.value,
                      borderRadius: '4px'
                    }}
                  />
                </ToggleButton>
              ))}
            </Box>
          </Box>
        </Stack>
        <Grid container spacing={2}>
          {days.map((day) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={day.toISOString()}>
              <Paper
                sx={{
                  p: 2,
                  height: '100%',
                  cursor: 'pointer'
                }}
                onClick={(e) => handleCellClick(day, e)}
              >
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    fontFamily: 'Nunito, sans-serif'
                  }}
                >
                  {format(day, 'EEEE, MMMM d')}
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Time</TableCell>
                        <TableCell>Location</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {getAvailabilitiesForDate(day).map((availability) => (
                        <TableRow key={availability._id}>
                          <TableCell>{availability.timeSlot}</TableCell>
                          <TableCell>{availability.location}</TableCell>
                          <TableCell sx={{ color: availability.color }}>
                            {availability.name}
                          </TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(availability._id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          ))}
        </Grid>
        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
        >
          <DialogTitle>Add Availability</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Time Slot"
              type="text"
              fullWidth
              variant="outlined"
              value={newAvailability.timeSlot}
              onChange={(e) => setNewAvailability({
                ...newAvailability,
                timeSlot: e.target.value
              })}
              onKeyPress={handleKeyPress}
            />
            <TextField
              margin="dense"
              label="Location"
              type="text"
              fullWidth
              variant="outlined"
              value={newAvailability.location}
              onChange={(e) => setNewAvailability({
                ...newAvailability,
                location: e.target.value
              })}
              onKeyPress={handleKeyPress}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">Add</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default Calendar;
EOL

# Create package.json for client
cat > client/package.json << 'EOL'
{
  "name": "client",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@emotion/react": "^11.11.3",
    "@emotion/styled": "^11.11.0",
    "@fontsource/nunito": "^5.0.8",
    "@mui/icons-material": "^5.15.10",
    "@mui/material": "^5.15.10",
    "@testing-library/jest-dom": "^5.17.0",
    "@testing-library/react": "^13.4.0",
    "@testing-library/user-event": "^13.5.0",
    "axios": "^1.6.7",
    "date-fns": "^3.3.1",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "web-vitals": "^2.1.4"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "GENERATE_SOURCEMAP=false react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
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
NODE_OPTIONS=--max-old-space-size=2048
EOL

# Install dependencies and build
cd /app
npm install
cd client
npm install

# Debug: List contents before build
echo "Contents of client directory before build:"
ls -la

# Run build with memory optimizations
echo "Running React build..."
CI=false npm run build || {
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
cp -r build/* /app/client/build/

# Debug: List contents of /app/client/build directory
echo "Contents of /app/client/build directory:"
ls -la /app/client/build

cd ..
node server.js 
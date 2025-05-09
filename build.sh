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
import { Box, Typography } from '@mui/material';
import axios from 'axios';

const Calendar = () => {
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await axios.get(`${process.env.REACT_APP_API_URL}/api/availability`);
      } catch (err) {
        console.error('Error:', err);
        setError(err);
      }
    };
    fetchData();
  }, []);

  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error">
          {error.message}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4">Calendar</Typography>
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
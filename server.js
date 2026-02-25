require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

const Calendar = require('./models/Calendar');
const calendarRoutes = require('./routes/calendars');
const availabilityRoutes = require('./routes/availability');
const adminRoutes = require('./routes/admin');

const app = express();

// Enable CORS with proper preflight handling
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(s => s.trim())
  : ['https://drop-in.up.railway.app', 'https://www.drop-in-cal.com', 'http://localhost:3000'];

app.use(cors({
  origin: corsOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Handle OPTIONS requests explicitly
app.options('*', cors());

// Parse JSON bodies
app.use(express.json({ limit: '1mb' }));

// Debug logging only in development
if (process.env.NODE_ENV === 'development') {
  console.log('Current working directory:', process.cwd());
  console.log('Environment variables:', {
    MONGO_URL: process.env.MONGO_URL ? 'Set (hidden)' : 'Not set',
    PORT: process.env.PORT || 'Not set',
    NODE_ENV: process.env.NODE_ENV || 'Not set'
  });
}

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// Connect to MongoDB
console.log('Attempting to connect to MongoDB...');
if (!process.env.MONGO_URL) {
  console.error('MONGO_URL environment variable is not set');
  process.exit(1);
}

const ensureDefaultCalendar = async () => {
  await Calendar.findOneAndUpdate(
    { calendarId: 'Default' },
    { calendarId: 'Default' },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

mongoose.connect(process.env.MONGO_URL)
  .then(async () => {
    console.log('Successfully connected to MongoDB');
    await ensureDefaultCalendar();
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  });

// API Routes
app.use('/api/calendars', calendarRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/admin', adminRoutes);

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build/index.html'));
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

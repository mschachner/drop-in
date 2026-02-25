require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
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

// Define Calendar Schema
const calendarSchema = new mongoose.Schema({
  calendarId: {
    type: String,
    required: true,
    unique: true,
    match: [/^[a-z0-9]{1,20}$/i, 'Calendar ID must be alphanumeric and at most 20 characters']
  },
  defaultColor: {
    type: String,
    default: '#66BB6A'
  },
  defaultDarkMode: {
    type: Boolean,
    default: false
  }
});

const Calendar = mongoose.model('Calendar', calendarSchema);

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

// Define Availability Schema
const availabilitySchema = new mongoose.Schema({
  calendarId: {
    type: String,
    default: 'Default',
    index: true
  },
  date: Date,
  timeSlot: String,
  location: String,
  name: String,
  color: String,
  icon: String,
  recurring: {
    type: Boolean,
    default: false
  },
  section: {
    type: String,
    enum: ['day', 'evening'],
    default: 'day'
  },
  joiners: {
    type: [String],
    default: []
  }
});

const Availability = mongoose.model('Availability', availabilitySchema);

// API Routes
app.get('/api/availability', async (req, res) => {
  try {
    const calendarId = req.query.calendarId || 'Default';
    const availabilities = await Availability.find({ calendarId });
    res.json(availabilities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/availability', async (req, res) => {
  try {
    const availability = new Availability({
      ...req.body,
      calendarId: req.body.calendarId || 'Default'
    });
    const savedAvailability = await availability.save();
    res.status(201).json(savedAvailability);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/api/calendars', async (req, res) => {
  try {
    const calendars = await Calendar.find().sort({ calendarId: 1 });
    res.json(calendars);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/calendars/:calendarId', async (req, res) => {
  try {
    const calendar = await Calendar.findOne({ calendarId: req.params.calendarId });
    if (!calendar) {
      return res.status(404).json({ message: 'Calendar not found' });
    }
    res.json(calendar);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/calendars/:calendarId', async (req, res) => {
  try {
    const calendar = await Calendar.findOneAndDelete({ calendarId: req.params.calendarId });
    if (!calendar) {
      return res.status(404).json({ message: 'Calendar not found' });
    }
    await Availability.deleteMany({ calendarId: req.params.calendarId });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/calendars', async (req, res) => {
  try {
    const { calendarId, defaultColor, defaultDarkMode } = req.body;
    if (!calendarId || !/^[a-z0-9]{1,20}$/i.test(calendarId)) {
      return res.status(400).json({ message: 'Calendar ID must be alphanumeric and at most 20 characters' });
    }

    const existing = await Calendar.findOne({ calendarId });
    if (existing) {
      return res.status(409).json({ message: 'Calendar ID already exists' });
    }

    const calendar = new Calendar({
      calendarId,
      defaultColor,
      defaultDarkMode
    });
    const savedCalendar = await calendar.save();
    res.status(201).json(savedCalendar);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/availability/:id', async (req, res) => {
  try {
    const updated = await Availability.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/availability/:id', async (req, res) => {
  try {
    await Availability.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/availability/:id/join', async (req, res) => {
  try {
    const { name } = req.body;
    const availability = await Availability.findById(req.params.id);
    
    if (!availability) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (!availability.joiners.includes(name)) {
      availability.joiners.push(name);
      await availability.save();
    }
    
    res.json(availability);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/availability/:id/unjoin', async (req, res) => {
  try {
    const { name } = req.body;
    const availability = await Availability.findById(req.params.id);
    
    if (!availability) {
      return res.status(404).json({ message: 'Event not found' });
    }

    availability.joiners = availability.joiners.filter(joiner => joiner !== name);
    await availability.save();
    
    res.json(availability);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build/index.html'));
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 

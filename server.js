require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const app = express();

// Enable CORS with proper preflight handling
app.use(cors({
  origin: ['https://drop-in.up.railway.app', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Handle OPTIONS requests explicitly
app.options('*', cors());

// Parse JSON bodies
app.use(express.json());

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

mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log('Successfully connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  });

// Define Availability Schema
const availabilitySchema = new mongoose.Schema({
  date: Date,
  timeSlot: String,
  location: String,
  name: String,
  color: String,
  icon: String,
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
    const availabilities = await Availability.find();
    res.json(availabilities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/availability', async (req, res) => {
  try {
    const availability = new Availability(req.body);
    const savedAvailability = await availability.save();
    res.status(201).json(savedAvailability);
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
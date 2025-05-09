const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the React build directory
app.use(express.static(path.join(__dirname, 'client/build')));

// MongoDB Connection
console.log('Attempting to connect to MongoDB...');
console.log('MONGO_URL:', process.env.MONGO_URL ? 'exists' : 'undefined');

if (!process.env.MONGO_URL) {
  console.error('MONGO_URL environment variable is not set');
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000
}).then(() => {
  console.log('Successfully connected to MongoDB');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Define Availability Schema
const availabilitySchema = new mongoose.Schema({
  date: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  location: { type: String, required: true },
  name: { type: String, required: true },
  color: { type: String, default: '#4a6741' },
  createdAt: { type: Date, default: Date.now }
});

const Availability = mongoose.model('Availability', availabilitySchema);

// Routes
app.get('/api/availability', async (req, res) => {
  try {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const availabilities = await Availability.find({
      date: {
        $gte: today,
        $lte: nextWeek
      }
    }).sort({ date: 1, timeSlot: 1 });
    
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

app.delete('/api/availability/:id', async (req, res) => {
  try {
    const deletedAvailability = await Availability.findByIdAndDelete(req.params.id);
    if (!deletedAvailability) {
      return res.status(404).json({ message: 'Availability not found' });
    }
    res.json({ message: 'Availability deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

const port = process.env.PORT || 5001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 
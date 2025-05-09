const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
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

const port = process.env.PORT || 5001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 
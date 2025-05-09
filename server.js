const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const app = express();

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Debug logging
console.log('Current working directory:', process.cwd());
console.log('Contents of /app directory:');
require('child_process').execSync('ls -la /app').toString().split('\n').forEach(line => console.log(line));
console.log('Contents of /app/client directory:');
require('child_process').execSync('ls -la /app/client').toString().split('\n').forEach(line => console.log(line));
console.log('Contents of /app/client/build directory:');
require('child_process').execSync('ls -la /app/client/build').toString().split('\n').forEach(line => console.log(line));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// Connect to MongoDB
console.log('Attempting to connect to MongoDB...');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

// Define Availability Schema
const availabilitySchema = new mongoose.Schema({
  date: Date,
  timeSlot: String,
  location: String,
  name: String,
  color: String
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

app.delete('/api/availability/:id', async (req, res) => {
  try {
    await Availability.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  console.log('Serving index.html for path:', req.path);
  res.sendFile(path.join(__dirname, 'client/build/index.html'));
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 
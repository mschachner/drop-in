const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  calendarId: {
    type: String,
    default: 'Default',
    index: true
  },
  date: Date,
  timeSlot: {
    type: String,
    required: [true, 'Time slot is required'],
    maxlength: [100, 'Time slot must be at most 100 characters']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    maxlength: [200, 'Location must be at most 200 characters']
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    maxlength: [50, 'Name must be at most 50 characters']
  },
  color: {
    type: String,
    match: [/^#[0-9a-f]{6}$/i, 'Color must be a valid hex color (e.g. #FF0000)']
  },
  icon: {
    type: String,
    maxlength: [50, 'Icon name must be at most 50 characters']
  },
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

module.exports = mongoose.model('Availability', availabilitySchema);

const mongoose = require('mongoose');

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

module.exports = mongoose.model('Calendar', calendarSchema);

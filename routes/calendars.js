const express = require('express');
const Calendar = require('../models/Calendar');
const Availability = require('../models/Availability');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const calendars = await Calendar.find().sort({ calendarId: 1 });
    res.json(calendars);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load calendars' });
  }
});

router.get('/:calendarId', async (req, res) => {
  try {
    const calendar = await Calendar.findOne({ calendarId: req.params.calendarId });
    if (!calendar) {
      return res.status(404).json({ message: 'Calendar not found' });
    }
    res.json(calendar);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load calendar' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { calendarId, defaultColor, defaultDarkMode } = req.body;
    if (!calendarId || !/^[a-z0-9]{1,20}$/i.test(calendarId)) {
      return res.status(400).json({ message: 'Calendar ID must be alphanumeric and at most 20 characters' });
    }

    const existing = await Calendar.findOne({ calendarId });
    if (existing) {
      return res.status(409).json({ message: 'Calendar ID already exists' });
    }

    const calendar = new Calendar({ calendarId, defaultColor, defaultDarkMode });
    const saved = await calendar.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:calendarId', async (req, res) => {
  try {
    const calendar = await Calendar.findOneAndDelete({ calendarId: req.params.calendarId });
    if (!calendar) {
      return res.status(404).json({ message: 'Calendar not found' });
    }
    await Availability.deleteMany({ calendarId: req.params.calendarId });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete calendar' });
  }
});

module.exports = router;

const express = require('express');
const Availability = require('../models/Availability');
const { sanitizeBody, requireFields } = require('../middleware/validate');

const router = express.Router();

const AVAILABILITY_FIELDS = [
  'calendarId', 'date', 'timeSlot', 'location', 'name',
  'color', 'icon', 'recurring', 'section'
];

const UPDATE_FIELDS = [
  'timeSlot', 'location', 'icon', 'recurring', 'section'
];

router.get('/', async (req, res) => {
  try {
    const calendarId = req.query.calendarId || 'Default';
    const availabilities = await Availability.find({ calendarId });
    res.json(availabilities);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load events' });
  }
});

router.post(
  '/',
  sanitizeBody(AVAILABILITY_FIELDS),
  requireFields(['timeSlot', 'location', 'name']),
  async (req, res) => {
    try {
      const availability = new Availability({
        ...req.body,
        calendarId: req.body.calendarId || 'Default'
      });
      const saved = await availability.save();
      res.status(201).json(saved);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

router.put(
  '/:id',
  sanitizeBody(UPDATE_FIELDS),
  async (req, res) => {
    try {
      const updated = await Availability.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      if (!updated) {
        return res.status(404).json({ message: 'Event not found' });
      }
      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

router.delete('/:id', async (req, res) => {
  try {
    await Availability.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete event' });
  }
});

// For recurring events, clear stale joiners when the occurrence week has changed.
const resetStaleJoiners = (availability, occurrenceDate) => {
  if (availability.recurring && occurrenceDate) {
    const week = new Date(occurrenceDate);
    week.setHours(0, 0, 0, 0);
    const storedWeek = availability.joinersWeek
      ? new Date(availability.joinersWeek).setHours(0, 0, 0, 0)
      : null;
    if (!storedWeek || week.getTime() !== storedWeek) {
      availability.joiners = [];
      availability.joinersWeek = week;
    }
  }
};

router.post('/:id/join', async (req, res) => {
  try {
    const { name, occurrenceDate } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }
    const availability = await Availability.findById(req.params.id);
    if (!availability) {
      return res.status(404).json({ message: 'Event not found' });
    }

    resetStaleJoiners(availability, occurrenceDate);
    if (!availability.joiners.includes(name)) {
      availability.joiners.push(name);
      await availability.save();
    }
    res.json(availability);
  } catch (error) {
    res.status(500).json({ message: 'Failed to join event' });
  }
});

router.post('/:id/unjoin', async (req, res) => {
  try {
    const { name, occurrenceDate } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }
    const availability = await Availability.findById(req.params.id);
    if (!availability) {
      return res.status(404).json({ message: 'Event not found' });
    }

    resetStaleJoiners(availability, occurrenceDate);
    availability.joiners = availability.joiners.filter(joiner => joiner !== name);
    await availability.save();
    res.json(availability);
  } catch (error) {
    res.status(500).json({ message: 'Failed to leave event' });
  }
});

module.exports = router;

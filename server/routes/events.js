const express = require('express');
const mongoose = require('mongoose');
const Event = require('../models/Event');
const RSVP = require('../models/RSVP');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Get all upcoming events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find({ date: { $gte: new Date() } })
      .populate('creator', 'email')
      .sort({ date: 1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('creator', 'email');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create event (with optional image upload)
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { title, description, date, location, capacity } = req.body;

    // Validation
    if (!title || !description || !date || !location || !capacity) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const event = new Event({
      title,
      description,
      date: new Date(date),
      location,
      capacity: Number(capacity),
      creator: req.userId,
      imageUrl: req.file ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}` : null
    });

    await event.save();
    await event.populate('creator', 'email');

    res.status(201).json({
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update event (only by creator)
router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.creator.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    const { title, description, date, location, capacity } = req.body;

    event.title = title || event.title;
    event.description = description || event.description;
    event.date = date ? new Date(date) : event.date;
    event.location = location || event.location;
    event.capacity = capacity ? Number(capacity) : event.capacity;
    event.updatedAt = new Date();

    if (req.file) {
      event.imageUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }

    await event.save();
    await event.populate('creator', 'email');

    res.json({
      message: 'Event updated successfully',
      event
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete event (only by creator)
router.delete('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.creator.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    // Delete all RSVPs for this event
    await RSVP.deleteMany({ eventId: req.params.id });
    await Event.findByIdAndDelete(req.params.id);

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// RSVP - Join event (CONCURRENCY SAFE with MongoDB transactions)
router.post('/:id/join', auth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const eventId = req.params.id;
    const userId = req.userId;

    // Atomically check capacity and increment
    const event = await Event.findById(eventId).session(session);

    if (!event) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if capacity is full
    if (event.currentAttendees >= event.capacity) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Event is at full capacity' });
    }

    // Check if user already joined
    const existingRSVP = await RSVP.findOne({ userId, eventId }).session(session);
    if (existingRSVP) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'You have already joined this event' });
    }

    // Create RSVP
    await RSVP.create([{ userId, eventId }], { session });

    // Increment attendees
    event.currentAttendees += 1;
    await event.save({ session });

    await session.commitTransaction();

    await event.populate('creator', 'email');

    res.json({
      message: 'Successfully joined the event',
      event
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
});

// RSVP - Leave event (CONCURRENCY SAFE with MongoDB transactions)
router.post('/:id/leave', auth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const eventId = req.params.id;
    const userId = req.userId;

    // Check if user has RSVP
    const rsvp = await RSVP.findOne({ userId, eventId }).session(session);
    if (!rsvp) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'You have not joined this event' });
    }

    // Delete RSVP
    await RSVP.findByIdAndDelete(rsvp._id, { session });

    // Decrement attendees
    const event = await Event.findById(eventId).session(session);
    event.currentAttendees = Math.max(0, event.currentAttendees - 1);
    await event.save({ session });

    await session.commitTransaction();

    await event.populate('creator', 'email');

    res.json({
      message: 'Successfully left the event',
      event
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
});

// Get attendees for an event
router.get('/:id/attendees', async (req, res) => {
  try {
    const attendees = await RSVP.find({ eventId: req.params.id })
      .populate('userId', 'email');

    res.json(attendees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check if user has joined an event
router.get('/:id/check-rsvp', auth, async (req, res) => {
  try {
    const rsvp = await RSVP.findOne({
      userId: req.userId,
      eventId: req.params.id
    });

    res.json({ hasJoined: !!rsvp });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

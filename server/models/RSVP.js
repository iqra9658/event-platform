const mongoose = require('mongoose');

const rsvpSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Event ID is required']
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
});

// Unique constraint to prevent duplicate RSVPs
rsvpSchema.index({ userId: 1, eventId: 1 }, { unique: true });

module.exports = mongoose.model('RSVP', rsvpSchema);

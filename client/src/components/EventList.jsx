import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Grid,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { eventsAPI } from '../services/api';

export default function EventList({ isCreator = false }) {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteEventId, setDeleteEventId] = useState(null);
  const [userRSVPs, setUserRSVPs] = useState({});
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventsAPI.getAllEvents();
      setEvents(response.data);

      // Check RSVP status for each event
      const rsvpStatus = {};
      for (const event of response.data) {
        try {
          const rsvpResponse = await eventsAPI.checkRSVP(event._id);
          rsvpStatus[event._id] = rsvpResponse.data.hasJoined;
        } catch (err) {
          rsvpStatus[event._id] = false;
        }
      }
      setUserRSVPs(rsvpStatus);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinEvent = async (eventId) => {
    try {
      await eventsAPI.joinEvent(eventId);
      setUserRSVPs(prev => ({ ...prev, [eventId]: true }));
      await fetchEvents();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join event');
    }
  };

  const handleLeaveEvent = async (eventId) => {
    try {
      await eventsAPI.leaveEvent(eventId);
      setUserRSVPs(prev => ({ ...prev, [eventId]: false }));
      await fetchEvents();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to leave event');
    }
  };

  const handleDeleteClick = (eventId) => {
    setDeleteEventId(eventId);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await eventsAPI.deleteEvent(deleteEventId);
      setEvents(events.filter(e => e._id !== deleteEventId));
      setOpenDeleteDialog(false);
      setDeleteEventId(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete event');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {events.length === 0 ? (
        <Alert severity="info">No events available</Alert>
      ) : (
        <Grid container spacing={3}>
          {events.map(event => (
            <Grid item xs={12} sm={6} md={4} key={event._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {event.imageUrl && (
                  <CardMedia
                    component="img"
                    height="200"
                    image={event.imageUrl}
                    alt={event.title}
                  />
                )}

                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {event.title}
                  </Typography>

                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    {event.description}
                  </Typography>

                  <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                    📍 {event.location}
                  </Typography>

                  <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                    📅 {new Date(event.date).toLocaleDateString()}
                  </Typography>

                  <Typography variant="caption" sx={{ display: 'block', mb: 1, fontWeight: 'bold' }}>
                    👥 {event.currentAttendees}/{event.capacity} Attendees
                  </Typography>

                  <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                    Organized by: {event.creator.name}
                  </Typography>
                </CardContent>

                <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {isCreator || event.creator._id === currentUser.id ? (
                    <>
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={() => navigate(`/edit-event/${event._id}`)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        fullWidth
                        onClick={() => handleDeleteClick(event._id)}
                      >
                        Delete
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant={userRSVPs[event._id] ? 'outlined' : 'contained'}
                      color={userRSVPs[event._id] ? 'error' : 'success'}
                      fullWidth
                      disabled={
                        !userRSVPs[event._id] && 
                        event.currentAttendees >= event.capacity
                      }
                      onClick={() =>
                        userRSVPs[event._id]
                          ? handleLeaveEvent(event._id)
                          : handleJoinEvent(event._id)
                      }
                    >
                      {userRSVPs[event._id] ? 'Leave Event' : 'Join Event'}
                    </Button>
                  )}
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Delete Event</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this event?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

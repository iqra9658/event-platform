import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Card,
  Alert,
  CircularProgress
} from '@mui/material';
import { eventsAPI } from '../services/api';

export default function EventForm({ event = null, isEdit = false, onSuccess = null }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    date: event?.date?.split('T')[0] || '',
    location: event?.location || '',
    capacity: event?.capacity || ''
  });
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImage(file);
    } else {
      setError('Please select a valid image file');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('date', formData.date);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('capacity', formData.capacity);

      if (image) {
        formDataToSend.append('image', image);
      }

      if (isEdit && event) {
        await eventsAPI.updateEvent(event._id, formDataToSend);
      } else {
        await eventsAPI.createEvent(formDataToSend);
      }

      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Card sx={{ p: 4 }}>
          <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
            {isEdit ? 'Edit Event' : 'Create Event'}
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Event Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              fullWidth
              required
            />

            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              fullWidth
              multiline
              rows={4}
              required
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <TextField
                label="Date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                label="Capacity"
                name="capacity"
                type="number"
                value={formData.capacity}
                onChange={handleChange}
                fullWidth
                required
                inputProps={{ min: 1 }}
              />
            </Box>

            <TextField
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              fullWidth
              required
            />

            <Box>
              <Typography sx={{ mb: 1 }}>Event Image</Typography>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ marginBottom: '8px' }}
              />
              {image && <Typography variant="caption">Image selected: {image.name}</Typography>}
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : (isEdit ? 'Update Event' : 'Create Event')}
              </Button>

              <Button
                variant="outlined"
                onClick={() => navigate('/dashboard')}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </Card>
      </Box>
    </Container>
  );
}

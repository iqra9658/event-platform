import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const authAPI = {
  register: (name, email, password) =>
    api.post('/auth/register', { name, email, password }),
  login: (email, password) =>
    api.post('/auth/login', { email, password })
};

// Events endpoints
export const eventsAPI = {
  getAllEvents: () => api.get('/events'),
  getEventById: (id) => api.get(`/events/${id}`),
  createEvent: (formData) =>
    api.post('/events', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  updateEvent: (id, formData) =>
    api.put(`/events/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  deleteEvent: (id) => api.delete(`/events/${id}`),
  joinEvent: (id) => api.post(`/events/${id}/join`),
  leaveEvent: (id) => api.post(`/events/${id}/leave`),
  getAttendees: (id) => api.get(`/events/${id}/attendees`),
  checkRSVP: (id) => api.get(`/events/${id}/check-rsvp`)
};

export default api;

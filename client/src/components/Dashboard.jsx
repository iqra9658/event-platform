import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Button,
  Typography,
  Tabs,
  Tab,
  Card,
  AppBar,
  Toolbar
} from '@mui/material';
import EventList from './EventList';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index} style={{ width: '100%' }}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Event Platform
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Typography>Welcome, {user.name}</Typography>
            <Button
              color="inherit"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              Events Dashboard
            </Typography>
            <Button
              variant="contained"
              color="success"
              onClick={() => navigate('/create-event')}
            >
              + Create Event
            </Button>
          </Box>

          <Card sx={{ mb: 3 }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab label="All Events" />
              <Tab label="My Created Events" />
            </Tabs>
          </Card>

          <TabPanel value={tabValue} index={0}>
            <EventList isCreator={false} />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <EventList isCreator={true} />
          </TabPanel>
        </Box>
      </Container>
    </>
  );
}

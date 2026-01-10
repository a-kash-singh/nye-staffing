import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Button,
} from '@mui/material';
import {
  Event as EventIcon,
  People as PeopleIcon,
  AccessTime as AccessTimeIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentEvents, setRecentEvents] = useState([]);
  const [recentSignups, setRecentSignups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/dashboard/admin');
      setStats(response.data.stats);
      setRecentEvents(response.data.recent_events || []);
      setRecentSignups(response.data.recent_signups || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  const statCards = [
    {
      title: 'Upcoming Events',
      value: stats?.upcoming_events || 0,
      icon: <EventIcon />,
      color: '#1976d2',
    },
    {
      title: 'Active Events',
      value: stats?.active_events || 0,
      icon: <EventIcon />,
      color: '#2e7d32',
    },
    {
      title: 'Active Staff',
      value: stats?.active_staff || 0,
      icon: <PeopleIcon />,
      color: '#ed6c02',
    },
    {
      title: 'Pending Signups',
      value: stats?.pending_signups || 0,
      icon: <NotificationsIcon />,
      color: '#d32f2f',
    },
    {
      title: 'On Duty',
      value: stats?.on_duty_count || 0,
      icon: <AccessTimeIcon />,
      color: '#9c27b0',
    },
    {
      title: 'Unread Notifications',
      value: stats?.unread_notifications || 0,
      icon: <NotificationsIcon />,
      color: '#0288d1',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      {card.title}
                    </Typography>
                    <Typography variant="h4">{card.value}</Typography>
                  </Box>
                  <Box sx={{ color: card.color, fontSize: 40 }}>{card.icon}</Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Events
            </Typography>
            {recentEvents.length === 0 ? (
              <Typography color="text.secondary">No recent events</Typography>
            ) : (
              <List>
                {recentEvents.map((event) => (
                  <ListItem
                    key={event.id}
                    button
                    onClick={() => navigate(`/events/${event.id}`)}
                  >
                    <ListItemText
                      primary={event.title}
                      secondary={`${event.date} - ${event.staff_count || 0} staff`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
            <Button
              variant="outlined"
              fullWidth
              sx={{ mt: 2 }}
              onClick={() => navigate('/events')}
            >
              View All Events
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Pending Signups
            </Typography>
            {recentSignups.length === 0 ? (
              <Typography color="text.secondary">No pending signups</Typography>
            ) : (
              <List>
                {recentSignups.map((signup) => (
                  <ListItem key={signup.id}>
                    <ListItemText
                      primary={signup.user_name}
                      secondary={`${signup.event_title} - ${new Date(
                        signup.applied_at
                      ).toLocaleDateString()}`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
            <Button
              variant="outlined"
              fullWidth
              sx={{ mt: 2 }}
              onClick={() => navigate('/events')}
            >
              Review Signups
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import axios from 'axios';
import { format } from 'date-fns';

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await axios.get(`/api/events/${id}`);
      setEvent(response.data.event);
    } catch (error) {
      console.error('Failed to fetch event:', error);
      setError('Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveSignup = async (userId, action) => {
    try {
      await axios.post(`/api/shifts/${id}/approve/${userId}`, { action });
      fetchEvent();
    } catch (error) {
      console.error('Failed to update signup:', error);
      setError('Failed to update signup');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !event) {
    return <Alert severity="error">{error || 'Event not found'}</Alert>;
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/events')}
        sx={{ mb: 2 }}
      >
        Back to Events
      </Button>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h4" gutterBottom>
              {event.title}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {event.description}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Date:</strong> {format(new Date(event.date), 'MMMM dd, yyyy')}
              </Typography>
              <Typography variant="body2">
                <strong>Time:</strong> {event.start_time} - {event.end_time}
              </Typography>
              <Typography variant="body2">
                <strong>Location:</strong> {event.location}
              </Typography>
              <Typography variant="body2">
                <strong>Status:</strong>{' '}
                <Chip label={event.status} size="small" />
              </Typography>
            </Box>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Assigned Staff ({event.assigned_staff?.length || 0})
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Approved At</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {event.assigned_staff?.map((staff) => (
                    <TableRow key={staff.id}>
                      <TableCell>{staff.name}</TableCell>
                      <TableCell>{staff.email}</TableCell>
                      <TableCell>
                        {staff.approved_at
                          ? format(new Date(staff.approved_at), 'MMM dd, yyyy HH:mm')
                          : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Event Statistics
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Max Staff: {event.max_staff || 'Unlimited'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Assigned: {event.assigned_staff?.length || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

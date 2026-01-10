import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    start_time: '',
    end_time: '',
    location: '',
    max_staff: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('/api/events');
      setEvents(response.data.events);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (event = null) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title,
        description: event.description || '',
        date: event.date,
        start_time: event.start_time,
        end_time: event.end_time,
        location: event.location,
        max_staff: event.max_staff || '',
      });
    } else {
      setEditingEvent(null);
      setFormData({
        title: '',
        description: '',
        date: '',
        start_time: '',
        end_time: '',
        location: '',
        max_staff: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingEvent(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        await axios.put(`/api/events/${editingEvent.id}`, formData);
      } else {
        await axios.post('/api/events', formData);
      }
      handleCloseDialog();
      fetchEvents();
    } catch (error) {
      console.error('Failed to save event:', error);
      setError('Failed to save event');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }
    try {
      await axios.delete(`/api/events/${id}`);
      fetchEvents();
    } catch (error) {
      console.error('Failed to delete event:', error);
      setError('Failed to delete event');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming':
        return 'primary';
      case 'active':
        return 'success';
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Events</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Create Event
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Staff</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {events.map((event) => (
              <TableRow
                key={event.id}
                hover
                sx={{ cursor: 'pointer' }}
                onClick={() => navigate(`/events/${event.id}`)}
              >
                <TableCell>{event.title}</TableCell>
                <TableCell>
                  {format(new Date(event.date), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell>
                  {event.start_time} - {event.end_time}
                </TableCell>
                <TableCell>{event.location}</TableCell>
                <TableCell>
                  {event.approved_staff_count || 0}
                  {event.max_staff && ` / ${event.max_staff}`}
                </TableCell>
                <TableCell>
                  <Chip
                    label={event.status}
                    color={getStatusColor(event.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(event)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(event.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingEvent ? 'Edit Event' : 'Create Event'}
          </DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              label="Title"
              fullWidth
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Date"
              type="date"
              fullWidth
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            <Box display="flex" gap={2} sx={{ mb: 2 }}>
              <TextField
                margin="dense"
                label="Start Time"
                type="time"
                fullWidth
                required
                value={formData.start_time}
                onChange={(e) =>
                  setFormData({ ...formData, start_time: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                margin="dense"
                label="End Time"
                type="time"
                fullWidth
                required
                value={formData.end_time}
                onChange={(e) =>
                  setFormData({ ...formData, end_time: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <TextField
              margin="dense"
              label="Location"
              fullWidth
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Max Staff"
              type="number"
              fullWidth
              value={formData.max_staff}
              onChange={(e) =>
                setFormData({ ...formData, max_staff: e.target.value })
              }
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingEvent ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

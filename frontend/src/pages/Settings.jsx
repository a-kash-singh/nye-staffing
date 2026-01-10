import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Avatar,
  Alert,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

export default function Settings() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone_number: user?.phone_number || '',
    password: '',
    confirmPassword: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const updateData = {
        name: formData.name,
        phone_number: formData.phone_number,
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      await axios.put(`/api/users/${user.id}`, updateData);
      setMessage('Profile updated successfully');
      setFormData({ ...formData, password: '', confirmPassword: '' });
    } catch (error) {
      console.error('Failed to update profile:', error);
      setError('Failed to update profile');
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Paper sx={{ p: 3, maxWidth: 600 }}>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}>
            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
          </Avatar>
          <Box>
            <Typography variant="h6">{user?.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.email}
            </Typography>
          </Box>
        </Box>

        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            margin="normal"
            fullWidth
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <TextField
            margin="normal"
            fullWidth
            label="Phone Number"
            value={formData.phone_number}
            onChange={(e) =>
              setFormData({ ...formData, phone_number: e.target.value })
            }
          />
          <TextField
            margin="normal"
            fullWidth
            label="New Password"
            type="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />
          <TextField
            margin="normal"
            fullWidth
            label="Confirm Password"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) =>
              setFormData({ ...formData, confirmPassword: e.target.value })
            }
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 3 }}
          >
            Update Profile
          </Button>
        </form>
      </Paper>
    </Box>
  );
}

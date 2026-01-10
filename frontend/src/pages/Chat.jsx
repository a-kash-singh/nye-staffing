import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import axios from 'axios';
import io from 'socket.io-client';

export default function Chat() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    fetchRooms();
    const token = localStorage.getItem('token');
    const newSocket = io('http://localhost:3000', {
      auth: { token },
    });

    newSocket.on('connect', () => {
      console.log('Connected to chat server');
    });

    newSocket.on('new_message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (selectedRoom && socket) {
      socket.emit('join_room', selectedRoom.id);
      fetchMessages(selectedRoom.id);
    }
  }, [selectedRoom, socket]);

  const fetchRooms = async () => {
    try {
      const response = await axios.get('/api/chat/my-rooms');
      setRooms(response.data.rooms);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
      setError('Failed to load chat rooms');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (roomId) => {
    try {
      const response = await axios.get(`/api/chat/rooms/${roomId}/messages`);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRoom) return;

    if (socket) {
      socket.emit('send_message', {
        roomId: selectedRoom.id,
        message: newMessage,
      });
    } else {
      try {
        await axios.post(`/api/chat/rooms/${selectedRoom.id}/messages`, {
          message: newMessage,
        });
        fetchMessages(selectedRoom.id);
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    }

    setNewMessage('');
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
      <Typography variant="h4" gutterBottom>
        Chat
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}

      <Box display="flex" gap={2} sx={{ mt: 2 }}>
        <Paper sx={{ width: 300, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Chat Rooms
          </Typography>
          <List>
            {rooms.map((room) => (
              <ListItem
                key={room.id}
                button
                selected={selectedRoom?.id === room.id}
                onClick={() => setSelectedRoom(room)}
              >
                <ListItemText
                  primary={room.name || room.event_title}
                  secondary={room.message_count || 0 + ' messages'}
                />
              </ListItem>
            ))}
          </List>
        </Paper>

        <Paper sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column' }}>
          {selectedRoom ? (
            <>
              <Typography variant="h6" gutterBottom>
                {selectedRoom.name || selectedRoom.event_title}
              </Typography>
              <Box sx={{ flex: 1, overflow: 'auto', mb: 2, minHeight: 400 }}>
                {messages.map((message) => (
                  <Box
                    key={message.id}
                    sx={{
                      mb: 1,
                      p: 1,
                      bgcolor: 'grey.100',
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {message.user_name} - {new Date(message.created_at).toLocaleString()}
                    </Typography>
                    <Typography variant="body1">{message.message}</Typography>
                  </Box>
                ))}
              </Box>
              <form onSubmit={handleSendMessage}>
                <Box display="flex" gap={1}>
                  <TextField
                    fullWidth
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                  />
                  <Button type="submit" variant="contained" startIcon={<SendIcon />}>
                    Send
                  </Button>
                </Box>
              </form>
            </>
          ) : (
            <Typography color="text.secondary">
              Select a chat room to start messaging
            </Typography>
          )}
        </Paper>
      </Box>
    </Box>
  );
}

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const pool = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const shiftRoutes = require('./routes/shifts');
const attendanceRoutes = require('./routes/attendance');
const chatRoutes = require('./routes/chat');
const notificationRoutes = require('./routes/notifications');
const userRoutes = require('./routes/users');
const dashboardRoutes = require('./routes/dashboard');
const { authenticateToken } = require('./middleware/auth');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Make io available to routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.IO connection handling
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    socket.userRole = decoded.role;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.userId}`);

  // Join user-specific room
  socket.join(`user_${socket.userId}`);

  // Join chat rooms
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.userId} joined room ${roomId}`);
  });

  socket.on('leave_room', (roomId) => {
    socket.leave(roomId);
    console.log(`User ${socket.userId} left room ${roomId}`);
  });

  // Handle chat messages
  socket.on('send_message', async (data) => {
    try {
      const { roomId, message } = data;

      if (!roomId || !message) {
        return socket.emit('error', { message: 'Missing roomId or message' });
      }

      // Verify access and save message
      const result = await pool.query(
        `INSERT INTO chat_messages (chat_room_id, user_id, message)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [roomId, socket.userId, message]
      );

      // Get message with user info
      const messageResult = await pool.query(
        `SELECT 
          cm.*,
          u.name as user_name,
          u.email as user_email,
          u.profile_photo_url
         FROM chat_messages cm
         JOIN users u ON cm.user_id = u.id
         WHERE cm.id = $1`,
        [result.rows[0].id]
      );

      // Broadcast to room
      io.to(roomId).emit('new_message', messageResult.rows[0]);

      // Create notifications for room members (except sender)
      const roomUsers = await pool.query(
        `SELECT DISTINCT user_id FROM chat_messages WHERE chat_room_id = $1 AND user_id != $2`,
        [roomId, socket.userId]
      );

      for (const row of roomUsers.rows) {
        await pool.query(
          `INSERT INTO notifications (user_id, type, title, message, related_event_id)
           SELECT $1, 'chat_message', 'New Message', $2, cr.event_id
           FROM chat_rooms cr WHERE cr.id = $3`,
          [row.user_id, `New message in chat`, roomId]
        );

        io.to(`user_${row.user_id}`).emit('new_notification', {
          type: 'chat_message',
          title: 'New Message',
          message: `New message in chat`,
        });
      }
    } catch (error) {
      console.error('Send message error:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.userId}`);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    pool.end(() => {
      console.log('Database pool closed');
      process.exit(0);
    });
  });
});

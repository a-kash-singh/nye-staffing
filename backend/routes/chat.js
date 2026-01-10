const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// Get or create event chat room
router.get('/rooms/event/:eventId', authenticateToken, async (req, res) => {
  try {
    const { eventId } = req.params;

    // Verify user has access to this event
    if (req.user.role === 'staff') {
      const signupResult = await pool.query(
        'SELECT status FROM event_signup WHERE event_id = $1 AND user_id = $2',
        [eventId, req.user.id]
      );
      if (signupResult.rows.length === 0 || signupResult.rows[0].status !== 'approved') {
        return res.status(403).json({ error: 'Not approved for this event' });
      }
    }

    // Get or create chat room
    let roomResult = await pool.query(
      'SELECT * FROM chat_rooms WHERE event_id = $1 AND type = $2',
      [eventId, 'event']
    );

    if (roomResult.rows.length === 0) {
      const eventResult = await pool.query('SELECT title FROM events WHERE id = $1', [eventId]);
      const roomName = eventResult.rows[0]?.title || `Event ${eventId}`;

      roomResult = await pool.query(
        'INSERT INTO chat_rooms (event_id, name, type) VALUES ($1, $2, $3) RETURNING *',
        [eventId, roomName, 'event']
      );
    }

    res.json({ room: roomResult.rows[0] });
  } catch (error) {
    console.error('Get chat room error:', error);
    res.status(500).json({ error: 'Failed to get chat room' });
  }
});

// Get chat messages
router.get('/rooms/:roomId/messages', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // Verify access to room
    const roomResult = await pool.query(
      `SELECT cr.*, e.id as event_id 
       FROM chat_rooms cr 
       LEFT JOIN events e ON cr.event_id = e.id 
       WHERE cr.id = $1`,
      [roomId]
    );

    if (roomResult.rows.length === 0) {
      return res.status(404).json({ error: 'Chat room not found' });
    }

    const room = roomResult.rows[0];

    // Check access
    if (room.type === 'event' && room.event_id) {
      if (req.user.role === 'staff') {
        const signupResult = await pool.query(
          'SELECT status FROM event_signup WHERE event_id = $1 AND user_id = $2',
          [room.event_id, req.user.id]
        );
        if (signupResult.rows.length === 0 || signupResult.rows[0].status !== 'approved') {
          return res.status(403).json({ error: 'Not approved for this event' });
        }
      }
    }

    // Get messages
    const messagesResult = await pool.query(
      `SELECT 
        cm.*,
        u.name as user_name,
        u.email as user_email,
        u.profile_photo_url
       FROM chat_messages cm
       JOIN users u ON cm.user_id = u.id
       WHERE cm.chat_room_id = $1
       ORDER BY cm.created_at DESC
       LIMIT $2 OFFSET $3`,
      [roomId, limit, offset]
    );

    res.json({ messages: messagesResult.rows.reverse() });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send message (handled via Socket.IO, but REST endpoint for compatibility)
router.post('/rooms/:roomId/messages',
  authenticateToken,
  [
    body('message').trim().notEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { roomId } = req.params;
      const { message } = req.body;

      // Verify access (same as get messages)
      const roomResult = await pool.query(
        `SELECT cr.*, e.id as event_id 
         FROM chat_rooms cr 
         LEFT JOIN events e ON cr.event_id = e.id 
         WHERE cr.id = $1`,
        [roomId]
      );

      if (roomResult.rows.length === 0) {
        return res.status(404).json({ error: 'Chat room not found' });
      }

      const room = roomResult.rows[0];

      if (room.type === 'event' && room.event_id) {
        if (req.user.role === 'staff') {
          const signupResult = await pool.query(
            'SELECT status FROM event_signup WHERE event_id = $1 AND user_id = $2',
            [room.event_id, req.user.id]
          );
          if (signupResult.rows.length === 0 || signupResult.rows[0].status !== 'approved') {
            return res.status(403).json({ error: 'Not approved for this event' });
          }
        }
      }

      // Insert message
      const result = await pool.query(
        `INSERT INTO chat_messages (chat_room_id, user_id, message)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [roomId, req.user.id, message]
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

      // Emit via Socket.IO if available
      if (req.app.get('io')) {
        req.app.get('io').to(roomId).emit('new_message', messageResult.rows[0]);
      }

      res.status(201).json({ message: messageResult.rows[0] });
    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  }
);

// Flag message (Admin only)
router.post('/messages/:messageId/flag', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { messageId } = req.params;

    const result = await pool.query(
      'UPDATE chat_messages SET is_flagged = TRUE WHERE id = $1 RETURNING *',
      [messageId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json({ message: result.rows[0] });
  } catch (error) {
    console.error('Flag message error:', error);
    res.status(500).json({ error: 'Failed to flag message' });
  }
});

// Get my chat rooms
router.get('/my-rooms', authenticateToken, async (req, res) => {
  try {
    let query = `
      SELECT DISTINCT
        cr.*,
        e.title as event_title,
        e.date as event_date,
        (SELECT COUNT(*) FROM chat_messages cm WHERE cm.chat_room_id = cr.id) as message_count,
        (SELECT MAX(created_at) FROM chat_messages cm WHERE cm.chat_room_id = cr.id) as last_message_at
      FROM chat_rooms cr
      LEFT JOIN events e ON cr.event_id = e.id
      LEFT JOIN event_signup es ON cr.event_id = es.event_id
      WHERE 1=1
    `;

    const params = [];

    if (req.user.role === 'staff') {
      query += ` AND (es.user_id = $1 AND es.status = 'approved')`;
      params.push(req.user.id);
    }

    query += ` ORDER BY last_message_at DESC NULLS LAST`;

    const result = await pool.query(query, params);

    res.json({ rooms: result.rows });
  } catch (error) {
    console.error('Get my rooms error:', error);
    res.status(500).json({ error: 'Failed to fetch chat rooms' });
  }
});

module.exports = router;

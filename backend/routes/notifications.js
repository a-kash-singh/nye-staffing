const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// Get my notifications
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { is_read, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT 
        n.*,
        e.title as event_title
      FROM notifications n
      LEFT JOIN events e ON n.related_event_id = e.id
      WHERE n.user_id = $1
    `;
    const params = [req.user.id];
    let paramCount = 2;

    if (is_read !== undefined) {
      query += ` AND n.is_read = $${paramCount++}`;
      params.push(is_read === 'true');
    }

    query += ` ORDER BY n.created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    res.json({ notifications: result.rows });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
router.patch('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE notifications 
       SET is_read = TRUE 
       WHERE id = $1 AND user_id = $2 
       RETURNING *`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ notification: result.rows[0] });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// Mark all notifications as read
router.patch('/read-all', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE notifications 
       SET is_read = TRUE 
       WHERE user_id = $1 AND is_read = FALSE 
       RETURNING COUNT(*)`,
      [req.user.id]
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({ error: 'Failed to update notifications' });
  }
});

// Get unread count
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = FALSE',
      [req.user.id]
    );

    res.json({ count: parseInt(result.rows[0].count) });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

// Create notification (Admin only)
router.post('/',
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { user_id, type, title, message, related_event_id } = req.body;

      if (!user_id || !type || !title || !message) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const result = await pool.query(
        `INSERT INTO notifications (user_id, type, title, message, related_event_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [user_id, type, title, message, related_event_id || null]
      );

      // Emit via Socket.IO if available
      if (req.app.get('io')) {
        req.app.get('io').to(`user_${user_id}`).emit('new_notification', result.rows[0]);
      }

      res.status(201).json({ notification: result.rows[0] });
    } catch (error) {
      console.error('Create notification error:', error);
      res.status(500).json({ error: 'Failed to create notification' });
    }
  }
);

module.exports = router;

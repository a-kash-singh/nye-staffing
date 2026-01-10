const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireAdmin, requireStaff } = require('../middleware/auth');
const router = express.Router();

// Sign up for a shift (Staff only)
router.post('/:eventId/signup', authenticateToken, requireStaff, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    // Check if event exists and is available
    const eventResult = await pool.query(
      'SELECT id, max_staff, status, date FROM events WHERE id = $1',
      [eventId]
    );

    if (eventResult.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const event = eventResult.rows[0];

    if (event.status !== 'upcoming') {
      return res.status(400).json({ error: 'Event is not available for signup' });
    }

    // Check if already signed up
    const existingSignup = await pool.query(
      'SELECT id, status FROM event_signup WHERE event_id = $1 AND user_id = $2',
      [eventId, userId]
    );

    if (existingSignup.rows.length > 0) {
      return res.status(400).json({ error: 'Already signed up for this event' });
    }

    // Check max staff limit
    if (event.max_staff) {
      const approvedCount = await pool.query(
        'SELECT COUNT(*) FROM event_signup WHERE event_id = $1 AND status = $2',
        [eventId, 'approved']
      );
      if (parseInt(approvedCount.rows[0].count) >= event.max_staff) {
        return res.status(400).json({ error: 'Event is full' });
      }
    }

    // Create signup
    const result = await pool.query(
      `INSERT INTO event_signup (event_id, user_id, status)
       VALUES ($1, $2, 'pending')
       RETURNING *`,
      [eventId, userId]
    );

    // Create notification for admin
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, related_event_id)
       SELECT id, 'shift_update', 'New Shift Sign-Up', $1, $2
       FROM users WHERE role = 'admin'`,
      [`${req.user.email} signed up for event`, eventId]
    );

    res.status(201).json({ signup: result.rows[0] });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to sign up for shift' });
  }
});

// Withdraw from shift (Staff only)
router.post('/:eventId/withdraw', authenticateToken, requireStaff, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      `UPDATE event_signup 
       SET status = 'withdrawn'
       WHERE event_id = $1 AND user_id = $2 AND status IN ('pending', 'approved')
       RETURNING *`,
      [eventId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Signup not found or cannot be withdrawn' });
    }

    res.json({ message: 'Successfully withdrawn from shift', signup: result.rows[0] });
  } catch (error) {
    console.error('Withdraw error:', error);
    res.status(500).json({ error: 'Failed to withdraw from shift' });
  }
});

// Approve/Reject signup (Admin only)
router.post('/:eventId/approve/:userId',
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { eventId, userId } = req.params;
      const { action } = req.body; // 'approve' or 'reject'

      if (!['approve', 'reject'].includes(action)) {
        return res.status(400).json({ error: 'Invalid action. Use "approve" or "reject"' });
      }

      const status = action === 'approve' ? 'approved' : 'rejected';

      const result = await pool.query(
        `UPDATE event_signup 
         SET status = $1, approved_at = CURRENT_TIMESTAMP, approved_by = $2
         WHERE event_id = $3 AND user_id = $4
         RETURNING *`,
        [status, req.user.id, eventId, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Signup not found' });
      }

      // Create notification for staff
      const eventResult = await pool.query('SELECT title FROM events WHERE id = $1', [eventId]);
      const eventTitle = eventResult.rows[0]?.title || 'Event';

      await pool.query(
        `INSERT INTO notifications (user_id, type, title, message, related_event_id)
         VALUES ($1, 'shift_approval', 'Shift ${action === 'approve' ? 'Approved' : 'Rejected'}', $2, $3)`,
        [
          userId,
          `Your signup for "${eventTitle}" has been ${action === 'approve' ? 'approved' : 'rejected'}`,
          eventId,
        ]
      );

      res.json({ message: `Signup ${action}d successfully`, signup: result.rows[0] });
    } catch (error) {
      console.error('Approve/Reject error:', error);
      res.status(500).json({ error: 'Failed to update signup status' });
    }
  }
);

// Get available shifts (Staff only)
router.get('/available', authenticateToken, requireStaff, async (req, res) => {
  try {
    const { date_from, date_to, location } = req.query;

    let query = `
      SELECT 
        e.*,
        COUNT(DISTINCT es.user_id) FILTER (WHERE es.status = 'approved') as approved_staff_count,
        CASE WHEN my_signup.id IS NOT NULL THEN my_signup.status ELSE NULL END as my_signup_status
      FROM events e
      LEFT JOIN event_signup es ON e.id = es.event_id
      LEFT JOIN event_signup my_signup ON e.id = my_signup.event_id AND my_signup.user_id = $1
      WHERE e.status = 'upcoming'
    `;
    const params = [req.user.id];
    let paramCount = 2;

    if (date_from) {
      query += ` AND e.date >= $${paramCount++}`;
      params.push(date_from);
    }

    if (date_to) {
      query += ` AND e.date <= $${paramCount++}`;
      params.push(date_to);
    }

    if (location) {
      query += ` AND e.location ILIKE $${paramCount++}`;
      params.push(`%${location}%`);
    }

    query += ` GROUP BY e.id, my_signup.id, my_signup.status 
               HAVING (e.max_staff IS NULL OR COUNT(DISTINCT es.user_id) FILTER (WHERE es.status = 'approved') < e.max_staff)
               ORDER BY e.date ASC, e.start_time ASC`;

    const result = await pool.query(query, params);

    res.json({ shifts: result.rows });
  } catch (error) {
    console.error('Get available shifts error:', error);
    res.status(500).json({ error: 'Failed to fetch available shifts' });
  }
});

// Get my shifts (Staff only)
router.get('/my-shifts', authenticateToken, requireStaff, async (req, res) => {
  try {
    const { status } = req.query; // 'pending', 'approved', 'all'

    let query = `
      SELECT 
        e.*,
        es.status as signup_status,
        es.applied_at,
        es.approved_at
      FROM event_signup es
      JOIN events e ON es.event_id = e.id
      WHERE es.user_id = $1
    `;
    const params = [req.user.id];

    if (status && status !== 'all') {
      query += ` AND es.status = $2`;
      params.push(status);
    }

    query += ` ORDER BY e.date ASC, e.start_time ASC`;

    const result = await pool.query(query, params);

    res.json({ shifts: result.rows });
  } catch (error) {
    console.error('Get my shifts error:', error);
    res.status(500).json({ error: 'Failed to fetch shifts' });
  }
});

module.exports = router;

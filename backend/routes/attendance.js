const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { authenticateToken, requireAdmin, requireStaff } = require('../middleware/auth');
const router = express.Router();

// Clock in (Staff only)
router.post('/clock-in',
  authenticateToken,
  requireStaff,
  [
    body('event_id').isUUID(),
    body('location').optional().isObject(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { event_id, location } = req.body;
      const userId = req.user.id;

      // Verify user is approved for this event
      const signupResult = await pool.query(
        'SELECT status FROM event_signup WHERE event_id = $1 AND user_id = $2',
        [event_id, userId]
      );

      if (signupResult.rows.length === 0 || signupResult.rows[0].status !== 'approved') {
        return res.status(403).json({ error: 'Not approved for this event' });
      }

      // Check if already clocked in
      const existingLog = await pool.query(
        `SELECT id, status FROM attendance_log 
         WHERE event_id = $1 AND user_id = $2 AND status = 'on_duty'`,
        [event_id, userId]
      );

      if (existingLog.rows.length > 0) {
        return res.status(400).json({ error: 'Already clocked in' });
      }

      // Get event details for time checking
      const eventResult = await pool.query(
        'SELECT date, start_time FROM events WHERE id = $1',
        [event_id]
      );

      if (eventResult.rows.length === 0) {
        return res.status(404).json({ error: 'Event not found' });
      }

      const event = eventResult.rows[0];
      const clockInTime = new Date();
      const eventDateTime = new Date(`${event.date}T${event.start_time}`);
      const isLate = clockInTime > new Date(eventDateTime.getTime() + 15 * 60000); // 15 min grace period

      // Create attendance log
      const locationPoint = location
        ? `(${location.lat},${location.lng})`
        : null;

      const result = await pool.query(
        `INSERT INTO attendance_log 
         (user_id, event_id, clock_in, clock_in_location, status, is_late)
         VALUES ($1, $2, $3, $4, 'on_duty', $5)
         RETURNING *`,
        [userId, event_id, clockInTime, locationPoint, isLate]
      );

      // Create notification for admin if late
      if (isLate) {
        await pool.query(
          `INSERT INTO notifications (user_id, type, title, message, related_event_id)
           SELECT id, 'attendance_alert', 'Late Clock-In', $1, $2
           FROM users WHERE role = 'admin'`,
          [`${req.user.email} clocked in late for event`, event_id]
        );
      }

      res.status(201).json({ attendance: result.rows[0] });
    } catch (error) {
      console.error('Clock in error:', error);
      res.status(500).json({ error: 'Failed to clock in' });
    }
  }
);

// Clock out (Staff only)
router.post('/clock-out',
  authenticateToken,
  requireStaff,
  [
    body('event_id').isUUID(),
    body('location').optional().isObject(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { event_id, location } = req.body;
      const userId = req.user.id;

      // Find active attendance log
      const logResult = await pool.query(
        `SELECT id, clock_in FROM attendance_log 
         WHERE event_id = $1 AND user_id = $2 AND status = 'on_duty'`,
        [event_id, userId]
      );

      if (logResult.rows.length === 0) {
        return res.status(400).json({ error: 'Not clocked in' });
      }

      const log = logResult.rows[0];

      // Get event details for time checking
      const eventResult = await pool.query(
        'SELECT date, end_time FROM events WHERE id = $1',
        [event_id]
      );

      const event = eventResult.rows[0];
      const clockOutTime = new Date();
      const eventEndDateTime = new Date(`${event.date}T${event.end_time}`);
      const isEarlyClockout = clockOutTime < eventEndDateTime;

      // Update attendance log
      const locationPoint = location
        ? `(${location.lat},${location.lng})`
        : null;

      const result = await pool.query(
        `UPDATE attendance_log 
         SET clock_out = $1, 
             clock_out_location = $2, 
             status = 'off_duty',
             is_early_clockout = $3
         WHERE id = $4
         RETURNING *`,
        [clockOutTime, locationPoint, isEarlyClockout, log.id]
      );

      // Create notification for admin if early clockout
      if (isEarlyClockout) {
        await pool.query(
          `INSERT INTO notifications (user_id, type, title, message, related_event_id)
           SELECT id, 'attendance_alert', 'Early Clock-Out', $1, $2
           FROM users WHERE role = 'admin'`,
          [`${req.user.email} clocked out early from event`, event_id]
        );
      }

      res.json({ attendance: result.rows[0] });
    } catch (error) {
      console.error('Clock out error:', error);
      res.status(500).json({ error: 'Failed to clock out' });
    }
  }
);

// Get attendance status (Staff only)
router.get('/status/:eventId', authenticateToken, requireStaff, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT * FROM attendance_log 
       WHERE event_id = $1 AND user_id = $2 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [eventId, userId]
    );

    if (result.rows.length === 0) {
      return res.json({ status: 'not_clocked_in', attendance: null });
    }

    res.json({ status: result.rows[0].status, attendance: result.rows[0] });
  } catch (error) {
    console.error('Get attendance status error:', error);
    res.status(500).json({ error: 'Failed to get attendance status' });
  }
});

// Get my attendance logs (Staff only)
router.get('/my-logs', authenticateToken, requireStaff, async (req, res) => {
  try {
    const { date_from, date_to, event_id } = req.query;

    let query = `
      SELECT 
        al.*,
        e.title as event_title,
        e.location as event_location,
        e.date as event_date
      FROM attendance_log al
      JOIN events e ON al.event_id = e.id
      WHERE al.user_id = $1
    `;
    const params = [req.user.id];
    let paramCount = 2;

    if (date_from) {
      query += ` AND al.clock_in::date >= $${paramCount++}`;
      params.push(date_from);
    }

    if (date_to) {
      query += ` AND al.clock_in::date <= $${paramCount++}`;
      params.push(date_to);
    }

    if (event_id) {
      query += ` AND al.event_id = $${paramCount++}`;
      params.push(event_id);
    }

    query += ` ORDER BY al.clock_in DESC`;

    const result = await pool.query(query, params);

    res.json({ logs: result.rows });
  } catch (error) {
    console.error('Get attendance logs error:', error);
    res.status(500).json({ error: 'Failed to fetch attendance logs' });
  }
});

// Get all attendance logs (Admin only)
router.get('/logs', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { date_from, date_to, event_id, user_id } = req.query;

    let query = `
      SELECT 
        al.*,
        u.name as user_name,
        u.email as user_email,
        e.title as event_title,
        e.location as event_location,
        e.date as event_date
      FROM attendance_log al
      JOIN users u ON al.user_id = u.id
      JOIN events e ON al.event_id = e.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (date_from) {
      query += ` AND al.clock_in::date >= $${paramCount++}`;
      params.push(date_from);
    }

    if (date_to) {
      query += ` AND al.clock_in::date <= $${paramCount++}`;
      params.push(date_to);
    }

    if (event_id) {
      query += ` AND al.event_id = $${paramCount++}`;
      params.push(event_id);
    }

    if (user_id) {
      query += ` AND al.user_id = $${paramCount++}`;
      params.push(user_id);
    }

    query += ` ORDER BY al.clock_in DESC`;

    const result = await pool.query(query, params);

    res.json({ logs: result.rows });
  } catch (error) {
    console.error('Get all attendance logs error:', error);
    res.status(500).json({ error: 'Failed to fetch attendance logs' });
  }
});

// Get attendance report (Admin only)
router.get('/report', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { date_from, date_to, event_id, user_id, format } = req.query;

    let query = `
      SELECT 
        u.id as user_id,
        u.name as user_name,
        u.email as user_email,
        e.id as event_id,
        e.title as event_title,
        e.date as event_date,
        al.clock_in,
        al.clock_out,
        al.is_late,
        al.is_early_clockout,
        EXTRACT(EPOCH FROM (al.clock_out - al.clock_in))/3600 as hours_worked
      FROM attendance_log al
      JOIN users u ON al.user_id = u.id
      JOIN events e ON al.event_id = e.id
      WHERE al.status = 'off_duty'
    `;
    const params = [];
    let paramCount = 1;

    if (date_from) {
      query += ` AND al.clock_in::date >= $${paramCount++}`;
      params.push(date_from);
    }

    if (date_to) {
      query += ` AND al.clock_in::date <= $${paramCount++}`;
      params.push(date_to);
    }

    if (event_id) {
      query += ` AND al.event_id = $${paramCount++}`;
      params.push(event_id);
    }

    if (user_id) {
      query += ` AND al.user_id = $${paramCount++}`;
      params.push(user_id);
    }

    query += ` ORDER BY al.clock_in DESC`;

    const result = await pool.query(query, params);

    if (format === 'csv') {
      // Simple CSV export
      const csv = [
        'User Name,Email,Event,Date,Clock In,Clock Out,Hours Worked,Is Late,Early Clockout',
        ...result.rows.map((row) =>
          [
            row.user_name,
            row.user_email,
            row.event_title,
            row.event_date,
            row.clock_in,
            row.clock_out,
            row.hours_worked?.toFixed(2) || '0',
            row.is_late ? 'Yes' : 'No',
            row.is_early_clockout ? 'Yes' : 'No',
          ].join(',')
        ),
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=attendance-report.csv');
      return res.send(csv);
    }

    res.json({ report: result.rows });
  } catch (error) {
    console.error('Get attendance report error:', error);
    res.status(500).json({ error: 'Failed to generate attendance report' });
  }
});

module.exports = router;

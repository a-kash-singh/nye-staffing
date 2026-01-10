const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// Get admin dashboard stats
router.get('/admin', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = await pool.query(
      `SELECT 
        (SELECT COUNT(*) FROM events WHERE status = 'upcoming') as upcoming_events,
        (SELECT COUNT(*) FROM events WHERE status = 'active') as active_events,
        (SELECT COUNT(*) FROM users WHERE role = 'staff' AND status = 'active') as active_staff,
        (SELECT COUNT(*) FROM event_signup WHERE status = 'pending') as pending_signups,
        (SELECT COUNT(*) FROM attendance_log WHERE status = 'on_duty') as on_duty_count,
        (SELECT COUNT(*) FROM notifications WHERE is_read = FALSE) as unread_notifications
      `
    );

    // Recent events
    const recentEvents = await pool.query(
      `SELECT e.*, COUNT(DISTINCT es.user_id) FILTER (WHERE es.status = 'approved') as staff_count
       FROM events e
       LEFT JOIN event_signup es ON e.id = es.event_id
       WHERE e.status IN ('upcoming', 'active')
       GROUP BY e.id
       ORDER BY e.date ASC, e.start_time ASC
       LIMIT 5`
    );

    // Recent signups
    const recentSignups = await pool.query(
      `SELECT es.*, u.name as user_name, u.email as user_email, e.title as event_title
       FROM event_signup es
       JOIN users u ON es.user_id = u.id
       JOIN events e ON es.event_id = e.id
       WHERE es.status = 'pending'
       ORDER BY es.applied_at DESC
       LIMIT 5`
    );

    res.json({
      stats: stats.rows[0],
      recent_events: recentEvents.rows,
      recent_signups: recentSignups.rows,
    });
  } catch (error) {
    console.error('Get admin dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Get staff dashboard stats
router.get('/staff', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'staff') {
      return res.status(403).json({ error: 'Staff access required' });
    }

    const stats = await pool.query(
      `SELECT 
        (SELECT COUNT(*) FROM event_signup WHERE user_id = $1 AND status = 'approved') as approved_shifts,
        (SELECT COUNT(*) FROM event_signup WHERE user_id = $1 AND status = 'pending') as pending_shifts,
        (SELECT COUNT(*) FROM attendance_log WHERE user_id = $1 AND status = 'on_duty') as on_duty_count,
        (SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = FALSE) as unread_notifications
      `,
      [req.user.id]
    );

    // Upcoming shifts
    const upcomingShifts = await pool.query(
      `SELECT e.*, es.status as signup_status
       FROM event_signup es
       JOIN events e ON es.event_id = e.id
       WHERE es.user_id = $1 AND es.status = 'approved' AND e.status = 'upcoming'
       ORDER BY e.date ASC, e.start_time ASC
       LIMIT 5`,
      [req.user.id]
    );

    res.json({
      stats: stats.rows[0],
      upcoming_shifts: upcomingShifts.rows,
    });
  } catch (error) {
    console.error('Get staff dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

module.exports = router;

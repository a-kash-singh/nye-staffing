const express = require('express');
const { body, validationResult, query } = require('express-validator');
const pool = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// Get all events (with filters)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, date_from, date_to, location } = req.query;
    let query = `
      SELECT 
        e.*,
        u.name as created_by_name,
        COUNT(DISTINCT es.user_id) FILTER (WHERE es.status = 'approved') as approved_staff_count
      FROM events e
      LEFT JOIN users u ON e.created_by = u.id
      LEFT JOIN event_signup es ON e.id = es.event_id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (status) {
      query += ` AND e.status = $${paramCount++}`;
      params.push(status);
    }

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

    query += ` GROUP BY e.id, u.name ORDER BY e.date ASC, e.start_time ASC`;

    const result = await pool.query(query, params);

    // Get signup status for current user if staff
    if (req.user.role === 'staff') {
      for (let event of result.rows) {
        const signupResult = await pool.query(
          'SELECT status FROM event_signup WHERE event_id = $1 AND user_id = $2',
          [event.id, req.user.id]
        );
        event.user_signup_status = signupResult.rows[0]?.status || null;
      }
    }

    res.json({ events: result.rows });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get single event
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const eventResult = await pool.query(
      `SELECT 
        e.*,
        u.name as created_by_name
       FROM events e
       LEFT JOIN users u ON e.created_by = u.id
       WHERE e.id = $1`,
      [id]
    );

    if (eventResult.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const event = eventResult.rows[0];

    // Get assigned staff
    const staffResult = await pool.query(
      `SELECT 
        u.id, u.name, u.email, u.profile_photo_url,
        es.status, es.applied_at, es.approved_at
       FROM event_signup es
       JOIN users u ON es.user_id = u.id
       WHERE es.event_id = $1 AND es.status = 'approved'
       ORDER BY es.approved_at ASC`,
      [id]
    );

    event.assigned_staff = staffResult.rows;

    // Get user's signup status if staff
    if (req.user.role === 'staff') {
      const signupResult = await pool.query(
        'SELECT status FROM event_signup WHERE event_id = $1 AND user_id = $2',
        [id, req.user.id]
      );
      event.user_signup_status = signupResult.rows[0]?.status || null;
    }

    res.json({ event });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// Create event (Admin only)
router.post('/',
  authenticateToken,
  requireAdmin,
  [
    body('title').trim().notEmpty(),
    body('date').isISO8601().toDate(),
    body('start_time').matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/),
    body('end_time').matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/),
    body('location').trim().notEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        title,
        description,
        date,
        start_time,
        end_time,
        location,
        location_coordinates,
        requirements,
        max_staff,
      } = req.body;

      const result = await pool.query(
        `INSERT INTO events 
         (title, description, date, start_time, end_time, location, location_coordinates, requirements, max_staff, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [
          title,
          description || null,
          date,
          start_time,
          end_time,
          location,
          location_coordinates ? `(${location_coordinates.lat},${location_coordinates.lng})` : null,
          requirements || null,
          max_staff || null,
          req.user.id,
        ]
      );

      res.status(201).json({ event: result.rows[0] });
    } catch (error) {
      console.error('Create event error:', error);
      res.status(500).json({ error: 'Failed to create event' });
    }
  }
);

// Update event (Admin only)
router.put('/:id',
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const {
        title,
        description,
        date,
        start_time,
        end_time,
        location,
        location_coordinates,
        requirements,
        max_staff,
        status,
      } = req.body;

      const updates = [];
      const values = [];
      let paramCount = 1;

      if (title !== undefined) {
        updates.push(`title = $${paramCount++}`);
        values.push(title);
      }
      if (description !== undefined) {
        updates.push(`description = $${paramCount++}`);
        values.push(description);
      }
      if (date !== undefined) {
        updates.push(`date = $${paramCount++}`);
        values.push(date);
      }
      if (start_time !== undefined) {
        updates.push(`start_time = $${paramCount++}`);
        values.push(start_time);
      }
      if (end_time !== undefined) {
        updates.push(`end_time = $${paramCount++}`);
        values.push(end_time);
      }
      if (location !== undefined) {
        updates.push(`location = $${paramCount++}`);
        values.push(location);
      }
      if (location_coordinates !== undefined) {
        updates.push(`location_coordinates = $${paramCount++}`);
        values.push(location_coordinates ? `(${location_coordinates.lat},${location_coordinates.lng})` : null);
      }
      if (requirements !== undefined) {
        updates.push(`requirements = $${paramCount++}`);
        values.push(requirements);
      }
      if (max_staff !== undefined) {
        updates.push(`max_staff = $${paramCount++}`);
        values.push(max_staff);
      }
      if (status !== undefined) {
        updates.push(`status = $${paramCount++}`);
        values.push(status);
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      values.push(id);
      const query = `UPDATE events SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;

      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Event not found' });
      }

      res.json({ event: result.rows[0] });
    } catch (error) {
      console.error('Update event error:', error);
      res.status(500).json({ error: 'Failed to update event' });
    }
  }
);

// Delete event (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM events WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

module.exports = router;

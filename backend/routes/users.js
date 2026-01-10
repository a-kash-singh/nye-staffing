const express = require('express');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  },
});

// Get all users (Admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { role, status, search } = req.query;

    let query = 'SELECT id, name, email, role, status, profile_photo_url, phone_number, created_at FROM users WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (role) {
      query += ` AND role = $${paramCount++}`;
      params.push(role);
    }

    if (status) {
      query += ` AND status = $${paramCount++}`;
      params.push(status);
    }

    if (search) {
      query += ` AND (name ILIKE $${paramCount} OR email ILIKE $${paramCount++})`;
      params.push(`%${search}%`);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);

    res.json({ users: result.rows });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get single user
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Staff can only view their own profile, admin can view any
    if (req.user.role === 'staff' && req.user.id !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await pool.query(
      'SELECT id, name, email, role, status, profile_photo_url, phone_number, created_at FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user profile
router.put('/:id', authenticateToken, upload.single('profile_photo'), async (req, res) => {
  try {
    const { id } = req.params;

    // Staff can only update their own profile
    if (req.user.role === 'staff' && req.user.id !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { name, phone_number, password } = req.body;
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }

    if (phone_number !== undefined) {
      updates.push(`phone_number = $${paramCount++}`);
      values.push(phone_number);
    }

    if (password) {
      const passwordHash = await bcrypt.hash(password, 10);
      updates.push(`password_hash = $${paramCount++}`);
      values.push(passwordHash);
    }

    if (req.file) {
      const photoUrl = `/uploads/${req.file.filename}`;
      updates.push(`profile_photo_url = $${paramCount++}`);
      values.push(photoUrl);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);
    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING id, name, email, role, status, profile_photo_url, phone_number`;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Update user status (Admin only)
router.patch('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive', 'suspended'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await pool.query(
      'UPDATE users SET status = $1 WHERE id = $2 RETURNING id, name, email, role, status',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// Get user statistics (Admin only)
router.get('/:id/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const statsResult = await pool.query(
      `SELECT 
        (SELECT COUNT(*) FROM event_signup WHERE user_id = $1 AND status = 'approved') as approved_shifts,
        (SELECT COUNT(*) FROM event_signup WHERE user_id = $1 AND status = 'pending') as pending_shifts,
        (SELECT COUNT(*) FROM attendance_log WHERE user_id = $1) as total_clock_ins,
        (SELECT SUM(EXTRACT(EPOCH FROM (clock_out - clock_in))/3600) FROM attendance_log WHERE user_id = $1 AND status = 'off_duty') as total_hours_worked,
        (SELECT COUNT(*) FROM attendance_log WHERE user_id = $1 AND is_late = TRUE) as late_count
      `,
      [id]
    );

    res.json({ stats: statsResult.rows[0] });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
});

module.exports = router;

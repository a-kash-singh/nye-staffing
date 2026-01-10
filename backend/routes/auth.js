const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const router = express.Router();

// Register
router.post('/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('name').trim().notEmpty(),
    body('role').isIn(['admin', 'staff']),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, name, role, firebase_uid, phone_number } = req.body;

      // Check if user exists
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Hash password
      const passwordHash = password ? await bcrypt.hash(password, 10) : null;

      // Create user
      const result = await pool.query(
        `INSERT INTO users (name, email, password_hash, role, firebase_uid, phone_number)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, name, email, role, status, created_at`,
        [name, email, passwordHash, role, firebase_uid || null, phone_number || null]
      );

      const user = result.rows[0];

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }
);

// Login
router.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find user
      const result = await pool.query(
        'SELECT id, name, email, password_hash, role, status FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const user = result.rows[0];

      if (user.status !== 'active') {
        return res.status(403).json({ error: 'Account is not active' });
      }

      // Verify password
      if (user.password_hash) {
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }
);

// Firebase Auth Verification
router.post('/verify-firebase', async (req, res) => {
  try {
    const { firebase_uid, email, name } = req.body;

    if (!firebase_uid) {
      return res.status(400).json({ error: 'Firebase UID required' });
    }

    // Find or create user
    let result = await pool.query(
      'SELECT id, name, email, role, status FROM users WHERE firebase_uid = $1',
      [firebase_uid]
    );

    let user;
    if (result.rows.length === 0) {
      // Create new user if doesn't exist
      result = await pool.query(
        `INSERT INTO users (name, email, firebase_uid, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, email, role, status`,
        [name || 'User', email, firebase_uid, 'staff']
      );
      user = result.rows[0];
    } else {
      user = result.rows[0];
    }

    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Account is not active' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Firebase authentication successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Firebase verification error:', error);
    res.status(500).json({ error: 'Firebase verification failed' });
  }
});

// Get current user
const { authenticateToken } = require('../middleware/auth');
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, status, profile_photo_url, phone_number, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

module.exports = router;

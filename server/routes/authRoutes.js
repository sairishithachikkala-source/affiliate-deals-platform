import express from 'express';
import db from '../db.js';
import { hashPassword, comparePassword, generateToken, verifyToken } from '../auth.js';

const router = express.Router();

// Dedicated Admin Portal Login
// Uses admin login identifier "Sai Krishna Chikkala" and server-side ADMIN_PASSWORD
router.post('/admin-login', (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Admin identifier and password are required.' });
    }

    const adminIdentifier = process.env.ADMIN_IDENTIFIER || 'Sai Krishna Chikkala';
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return res.status(503).json({
        error: 'Admin authentication is not configured on the server. Please set the ADMIN_PASSWORD environment variable in the server environment.'
      });
    }

    // Validate identifier (case-insensitive)
    const normalizedIdentifier = identifier.trim().toLowerCase();
    const isIdentifierValid = (
      normalizedIdentifier === adminIdentifier.trim().toLowerCase() ||
      normalizedIdentifier === (process.env.ADMIN_EMAIL || 'admin@dealnest.in').toLowerCase()
    );

    if (!isIdentifierValid) {
      return res.status(401).json({ error: 'Invalid admin identifier or password.' });
    }

    // Verify password against environment variable or DB hash
    const adminUser = db.prepare('SELECT * FROM users WHERE role = ?').get('admin');
    let isPasswordValid = false;

    if (adminUser) {
      isPasswordValid = comparePassword(password, adminUser.password_hash);
    } else {
      isPasswordValid = (password === adminPassword);
    }

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid admin identifier or password.' });
    }

    const adminData = {
      id: adminUser?.id || 1,
      name: adminIdentifier,
      email: adminUser?.email || process.env.ADMIN_EMAIL || 'admin@dealnest.in',
      role: 'admin',
      preferred_language: adminUser?.preferred_language || 'en',
    };

    const token = generateToken(adminData);
    res.json({ user: adminData, token });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ error: 'Failed to process admin login.' });
  }
});

// Register new user (ordinary user accounts only)
router.post('/register', (req, res) => {
  try {
    const { name, email, password, preferred_language = 'en' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name.trim();

    // Prevent registering with admin identifier or admin email
    const adminIdentifier = (process.env.ADMIN_IDENTIFIER || 'Sai Krishna Chikkala').toLowerCase();
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@dealnest.in').toLowerCase();
    if (cleanName.toLowerCase() === adminIdentifier || cleanEmail === adminEmail) {
      return res.status(403).json({ error: 'This name and email are reserved for system administration.' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const passwordHash = hashPassword(password);
    // Explicit server-side enforcement: role is strictly 'user'
    const result = db.prepare(`
      INSERT INTO users (name, email, password_hash, role, preferred_language)
      VALUES (?, ?, ?, 'user', ?)
    `).run(cleanName, cleanEmail, passwordHash, preferred_language);

    const newUser = {
      id: Number(result.lastInsertRowid),
      name: cleanName,
      email: cleanEmail,
      role: 'user',
      preferred_language,
    };

    const token = generateToken(newUser);
    res.status(201).json({ user: newUser, token });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Failed to create user account.' });
  }
});

// User Login (email + website password)
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(cleanEmail);

    if (!user || !comparePassword(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid email address or password.' });
    }

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      preferred_language: user.preferred_language,
    };

    const token = generateToken(userData);
    res.json({ user: userData, token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Failed to process login.' });
  }
});

// Forgot Password - Initiate password reset
router.post('/forgot-password', (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email address is required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = db.prepare('SELECT id, name FROM users WHERE email = ?').get(cleanEmail);

    if (!user) {
      // Do not leak whether an email exists
      return res.json({
        success: true,
        message: 'If an account exists with this email, password reset instructions have been generated.',
      });
    }

    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date(Date.now() + 3600000).toISOString(); // 1 hour validity

    db.prepare('DELETE FROM password_resets WHERE email = ?').run(cleanEmail);
    db.prepare(`
      INSERT INTO password_resets (email, token, expires_at)
      VALUES (?, ?, ?)
    `).run(cleanEmail, resetToken, expiresAt);

    res.json({
      success: true,
      message: 'Password reset token generated successfully.',
      resetToken,
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Failed to process password reset request.' });
  }
});

// Reset Password - Complete password reset
router.post('/reset-password', (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return res.status(400).json({ error: 'Email, reset token, and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const record = db.prepare(`
      SELECT * FROM password_resets 
      WHERE email = ? AND token = ? AND expires_at > datetime('now')
    `).get(cleanEmail, token);

    if (!record) {
      return res.status(400).json({ error: 'Invalid or expired password reset token.' });
    }

    const newHash = hashPassword(newPassword);
    db.prepare(`
      UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE email = ?
    `).run(newHash, cleanEmail);

    db.prepare('DELETE FROM password_resets WHERE email = ?').run(cleanEmail);

    res.json({ success: true, message: 'Password has been reset successfully. Please log in with your new password.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Failed to reset password.' });
  }
});

// Get current authenticated user
router.get('/me', verifyToken, (req, res) => {
  try {
    const user = db.prepare('SELECT id, name, email, role, preferred_language, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user profile.' });
  }
});

// Update profile / preferred language
router.put('/profile', verifyToken, (req, res) => {
  try {
    const { name, preferred_language } = req.body;
    const updates = [];
    const params = [];

    if (name && name.trim()) {
      updates.push('name = ?');
      params.push(name.trim());
    }

    if (preferred_language) {
      updates.push('preferred_language = ?');
      params.push(preferred_language);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields provided to update.' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(req.user.id);

    db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...params);

    const updatedUser = db.prepare('SELECT id, name, email, role, preferred_language FROM users WHERE id = ?').get(req.user.id);
    const newToken = generateToken(updatedUser);

    res.json({ user: updatedUser, token: newToken });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Failed to update user profile.' });
  }
});

export default router;

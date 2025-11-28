const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { withCors } = require('../_lib/cors');
const { query } = require('../_lib/db');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, email, password, fullName } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const avatar = fullName
      ? fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
      : username.substring(0, 2).toUpperCase();

    const result = await query(
      'INSERT INTO users (username, email, password, "fullName", avatar) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, "fullName", avatar, role',
      [username, email, hashedPassword, fullName, avatar]
    );

    const user = result.rows[0];

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        avatar: user.avatar,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    if (error.message?.includes('duplicate') || error.code === '23505') {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = withCors(handler);

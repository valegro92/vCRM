const { withCors } = require('../_lib/cors');
const authMiddleware = require('../_lib/auth');
const { query, queryOne } = require('../_lib/db');

async function handler(req, res) {
  const userId = req.user.userId;

  if (req.method === 'GET') {
    // Get profile
    try {
      const user = await queryOne(
        'SELECT id, username, email, "fullName", avatar, role, phone, company, "createdAt" FROM users WHERE id = $1',
        [userId]
      );

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'PUT') {
    // Update profile
    const { fullName, email, phone, company } = req.body;

    try {
      const avatar = fullName
        ? fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
        : null;

      const result = await query(
        'UPDATE users SET "fullName" = $1, email = $2, phone = $3, company = $4, avatar = COALESCE($5, avatar) WHERE id = $6 RETURNING id, username, email, "fullName", avatar, role, phone, company',
        [fullName, email, phone, company, avatar, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Update profile error:', error);
      if (error.code === '23505') {
        return res.status(400).json({ error: 'Email already in use' });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

module.exports = withCors(authMiddleware(handler));

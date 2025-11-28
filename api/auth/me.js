const { withCors } = require('../_lib/cors');
const authMiddleware = require('../_lib/auth');
const { queryOne } = require('../_lib/db');

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userId = req.user.userId;

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
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = withCors(authMiddleware(handler));

const { withCors } = require('../_lib/cors');
const authMiddleware = require('../_lib/auth');
const { query, queryAll } = require('../_lib/db');

async function handler(req, res) {
  const userId = req.userId;

  if (req.method === 'GET') {
    // Get all contacts
    try {
      const contacts = await queryAll(
        'SELECT * FROM contacts WHERE "userId" = $1 OR "userId" IS NULL ORDER BY "createdAt" DESC',
        [userId]
      );
      res.json(contacts);
    } catch (error) {
      console.error('Get contacts error:', error);
      res.status(500).json({ error: 'Database error' });
    }
  } else if (req.method === 'POST') {
    // Create contact
    const { name, company, email, phone, value, status, avatar, lastContact, notes } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    try {
      const result = await query(
        `INSERT INTO contacts (name, company, email, phone, value, status, avatar, "lastContact", notes, "userId")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [name, company, email, phone, value || 0, status || 'Lead', avatar, lastContact, notes, userId]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Create contact error:', error);
      res.status(500).json({ error: 'Database error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

module.exports = withCors(authMiddleware(handler));

const { withCors } = require('../_lib/cors');
const authMiddleware = require('../_lib/auth');
const { query, queryOne } = require('../_lib/db');

async function handler(req, res) {
  const userId = req.userId;
  const { id } = req.query;

  if (req.method === 'GET') {
    // Get single contact
    try {
      const contact = await queryOne(
        'SELECT * FROM contacts WHERE id = $1 AND ("userId" = $2 OR "userId" IS NULL)',
        [id, userId]
      );

      if (!contact) {
        return res.status(404).json({ error: 'Contact not found' });
      }

      res.json(contact);
    } catch (error) {
      console.error('Get contact error:', error);
      res.status(500).json({ error: 'Database error' });
    }
  } else if (req.method === 'PUT') {
    // Update contact
    const { name, company, email, phone, value, status, avatar, lastContact, notes } = req.body;

    try {
      const result = await query(
        `UPDATE contacts
         SET name = $1, company = $2, email = $3, phone = $4, value = $5, status = $6,
             avatar = $7, "lastContact" = $8, notes = $9, "updatedAt" = CURRENT_TIMESTAMP
         WHERE id = $10 AND ("userId" = $11 OR "userId" IS NULL)
         RETURNING *`,
        [name, company, email, phone, value, status, avatar, lastContact, notes, id, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Contact not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Update contact error:', error);
      res.status(500).json({ error: 'Database error' });
    }
  } else if (req.method === 'DELETE') {
    // Delete contact
    try {
      const result = await query(
        'DELETE FROM contacts WHERE id = $1 AND ("userId" = $2 OR "userId" IS NULL)',
        [id, userId]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Contact not found' });
      }

      res.json({ message: 'Contact deleted successfully' });
    } catch (error) {
      console.error('Delete contact error:', error);
      res.status(500).json({ error: 'Database error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

module.exports = withCors(authMiddleware(handler));

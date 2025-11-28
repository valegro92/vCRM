const { withCors } = require('../_lib/cors');
const authMiddleware = require('../_lib/auth');
const { query, queryOne } = require('../_lib/db');

async function handler(req, res) {
  const userId = req.userId;
  const { id } = req.query;

  if (req.method === 'GET') {
    // Get single opportunity
    try {
      const opportunity = await queryOne(
        'SELECT * FROM opportunities WHERE id = $1 AND ("userId" = $2 OR "userId" IS NULL)',
        [id, userId]
      );

      if (!opportunity) {
        return res.status(404).json({ error: 'Opportunity not found' });
      }

      res.json(opportunity);
    } catch (error) {
      console.error('Get opportunity error:', error);
      res.status(500).json({ error: 'Database error' });
    }
  } else if (req.method === 'PUT') {
    // Update opportunity
    const { title, company, value, stage, probability, openDate, closeDate, owner, contactId, originalStage, notes } = req.body;

    try {
      const result = await query(
        `UPDATE opportunities
         SET title = $1, company = $2, value = $3, stage = $4, probability = $5,
             "openDate" = $6, "closeDate" = $7, owner = $8, "contactId" = $9,
             "originalStage" = $10, notes = $11, "updatedAt" = CURRENT_TIMESTAMP
         WHERE id = $12 AND ("userId" = $13 OR "userId" IS NULL)
         RETURNING *`,
        [title, company, value, stage, probability, openDate, closeDate, owner, contactId, originalStage, notes, id, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Opportunity not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Update opportunity error:', error);
      res.status(500).json({ error: 'Database error' });
    }
  } else if (req.method === 'DELETE') {
    // Delete opportunity
    try {
      const result = await query(
        'DELETE FROM opportunities WHERE id = $1 AND ("userId" = $2 OR "userId" IS NULL)',
        [id, userId]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Opportunity not found' });
      }

      res.json({ message: 'Opportunity deleted successfully' });
    } catch (error) {
      console.error('Delete opportunity error:', error);
      res.status(500).json({ error: 'Database error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

module.exports = withCors(authMiddleware(handler));

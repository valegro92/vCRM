const { withCors } = require('../../_lib/cors');
const authMiddleware = require('../../_lib/auth');
const { query } = require('../../_lib/db');

async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userId = req.userId;
  const { id } = req.query;
  const { stage, probability } = req.body;

  try {
    const result = await query(
      `UPDATE opportunities
       SET stage = $1, probability = $2, "updatedAt" = CURRENT_TIMESTAMP
       WHERE id = $3 AND ("userId" = $4 OR "userId" IS NULL)
       RETURNING *`,
      [stage, probability, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update opportunity stage error:', error);
    res.status(500).json({ error: 'Database error' });
  }
}

module.exports = withCors(authMiddleware(handler));

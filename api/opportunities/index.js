const { withCors } = require('../_lib/cors');
const authMiddleware = require('../_lib/auth');
const { query, queryAll } = require('../_lib/db');

async function handler(req, res) {
  const userId = req.userId;

  if (req.method === 'GET') {
    // Get all opportunities
    const { year } = req.query;

    try {
      let queryText = 'SELECT * FROM opportunities WHERE "userId" = $1 OR "userId" IS NULL';
      const params = [userId];

      if (year) {
        queryText += ' AND EXTRACT(YEAR FROM "closeDate") = $2';
        params.push(year);
      }

      queryText += ' ORDER BY "createdAt" DESC';

      const opportunities = await queryAll(queryText, params);
      res.json(opportunities);
    } catch (error) {
      console.error('Get opportunities error:', error);
      res.status(500).json({ error: 'Database error' });
    }
  } else if (req.method === 'POST') {
    // Create opportunity
    const { title, company, value, stage, probability, openDate, closeDate, owner, contactId, originalStage, notes } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    try {
      const result = await query(
        `INSERT INTO opportunities (title, company, value, stage, probability, "openDate", "closeDate", owner, "contactId", "userId", "originalStage", notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING *`,
        [title, company, value || 0, stage || 'Lead', probability || 0, openDate, closeDate, owner, contactId, userId, originalStage, notes]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Create opportunity error:', error);
      res.status(500).json({ error: 'Database error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

module.exports = withCors(authMiddleware(handler));

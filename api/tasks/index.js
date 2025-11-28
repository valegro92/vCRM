const { withCors } = require('../_lib/cors');
const authMiddleware = require('../_lib/auth');
const { query, queryAll } = require('../_lib/db');

async function handler(req, res) {
  const userId = req.userId;

  if (req.method === 'GET') {
    // Get all tasks
    try {
      const tasks = await queryAll(
        'SELECT * FROM tasks WHERE "userId" = $1 OR "userId" IS NULL ORDER BY "dueDate" ASC, "createdAt" DESC',
        [userId]
      );
      res.json(tasks);
    } catch (error) {
      console.error('Get tasks error:', error);
      res.status(500).json({ error: 'Database error' });
    }
  } else if (req.method === 'POST') {
    // Create task
    const { title, type, priority, dueDate, status, contactId, opportunityId, description } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    try {
      const result = await query(
        `INSERT INTO tasks (title, type, priority, "dueDate", status, "contactId", "opportunityId", "userId", description)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [title, type || 'Chiamata', priority || 'Media', dueDate, status || 'Da fare', contactId, opportunityId, userId, description]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Create task error:', error);
      res.status(500).json({ error: 'Database error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

module.exports = withCors(authMiddleware(handler));

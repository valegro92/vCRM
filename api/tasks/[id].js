const { withCors } = require('../_lib/cors');
const authMiddleware = require('../_lib/auth');
const { query, queryOne } = require('../_lib/db');

async function handler(req, res) {
  const userId = req.userId;
  const { id } = req.query;

  if (req.method === 'GET') {
    // Get single task
    try {
      const task = await queryOne(
        'SELECT * FROM tasks WHERE id = $1 AND ("userId" = $2 OR "userId" IS NULL)',
        [id, userId]
      );

      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      res.json(task);
    } catch (error) {
      console.error('Get task error:', error);
      res.status(500).json({ error: 'Database error' });
    }
  } else if (req.method === 'PUT') {
    // Update task
    const { title, type, priority, dueDate, status, contactId, opportunityId, description } = req.body;

    const completedAt = status === 'Completata' ? new Date().toISOString() : null;

    try {
      const result = await query(
        `UPDATE tasks
         SET title = $1, type = $2, priority = $3, "dueDate" = $4, status = $5,
             "contactId" = $6, "opportunityId" = $7, description = $8,
             "completedAt" = $9, "updatedAt" = CURRENT_TIMESTAMP
         WHERE id = $10 AND ("userId" = $11 OR "userId" IS NULL)
         RETURNING *`,
        [title, type, priority, dueDate, status, contactId, opportunityId, description, completedAt, id, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Update task error:', error);
      res.status(500).json({ error: 'Database error' });
    }
  } else if (req.method === 'DELETE') {
    // Delete task
    try {
      const result = await query(
        'DELETE FROM tasks WHERE id = $1 AND ("userId" = $2 OR "userId" IS NULL)',
        [id, userId]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }

      res.json({ message: 'Task deleted successfully' });
    } catch (error) {
      console.error('Delete task error:', error);
      res.status(500).json({ error: 'Database error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

module.exports = withCors(authMiddleware(handler));

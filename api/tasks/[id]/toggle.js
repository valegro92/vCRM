const { withCors } = require('../../_lib/cors');
const authMiddleware = require('../../_lib/auth');
const { query, queryOne } = require('../../_lib/db');

async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userId = req.userId;
  const { id } = req.query;

  try {
    // Get current task
    const task = await queryOne(
      'SELECT * FROM tasks WHERE id = $1 AND ("userId" = $2 OR "userId" IS NULL)',
      [id, userId]
    );

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Toggle status
    const newStatus = task.status === 'Completata' ? 'Da fare' : 'Completata';
    const completedAt = newStatus === 'Completata' ? new Date().toISOString() : null;

    const result = await query(
      `UPDATE tasks
       SET status = $1, "completedAt" = $2, "updatedAt" = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [newStatus, completedAt, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Toggle task error:', error);
    res.status(500).json({ error: 'Database error' });
  }
}

module.exports = withCors(authMiddleware(handler));

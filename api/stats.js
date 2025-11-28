const { withCors } = require('./_lib/cors');
const authMiddleware = require('./_lib/auth');
const { queryOne } = require('./_lib/db');

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const [
      { count: contacts },
      { count: opportunities },
      { count: tasks },
      { total: pipelineValue },
      wonDeals,
      { count: openTasks }
    ] = await Promise.all([
      queryOne('SELECT COUNT(*) as count FROM contacts'),
      queryOne('SELECT COUNT(*) as count FROM opportunities'),
      queryOne('SELECT COUNT(*) as count FROM tasks'),
      queryOne('SELECT SUM(value) as total FROM opportunities WHERE stage NOT LIKE \'%Chiuso%\''),
      queryOne('SELECT COUNT(*) as count, SUM(value) as total FROM opportunities WHERE stage LIKE \'%Vinto%\''),
      queryOne('SELECT COUNT(*) as count FROM tasks WHERE status != \'Completata\'')
    ]);

    res.json({
      contacts: Number(contacts) || 0,
      opportunities: Number(opportunities) || 0,
      tasks: Number(tasks) || 0,
      pipelineValue: Number(pipelineValue) || 0,
      wonDeals: Number(wonDeals.count) || 0,
      wonValue: Number(wonDeals.total) || 0,
      openTasks: Number(openTasks) || 0
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Error fetching stats' });
  }
}

module.exports = withCors(authMiddleware(handler));

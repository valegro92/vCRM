const { withCors } = require('./_lib/cors');
const authMiddleware = require('./_lib/auth');
const { queryAll } = require('./_lib/db');

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const query = req.query.q || '';

  if (query.length < 2) {
    return res.json({ contacts: [], opportunities: [], tasks: [] });
  }

  const searchTerm = `%${query}%`;

  try {
    const [contacts, opportunities, tasks] = await Promise.all([
      queryAll(
        'SELECT * FROM contacts WHERE name ILIKE $1 OR company ILIKE $1 OR email ILIKE $1 LIMIT 10',
        [searchTerm]
      ),
      queryAll(
        'SELECT * FROM opportunities WHERE title ILIKE $1 OR company ILIKE $1 LIMIT 10',
        [searchTerm]
      ),
      queryAll(
        'SELECT * FROM tasks WHERE title ILIKE $1 OR description ILIKE $1 LIMIT 10',
        [searchTerm]
      )
    ]);

    res.json({ contacts, opportunities, tasks });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search error' });
  }
}

module.exports = withCors(authMiddleware(handler));

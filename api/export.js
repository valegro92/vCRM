const { withCors } = require('./_lib/cors');
const authMiddleware = require('./_lib/auth');
const { queryAll } = require('./_lib/db');

function generateCSV(data, columns) {
  if (!data || data.length === 0) return '';

  const header = columns.join(',');
  const rows = data.map(item =>
    columns.map(col => {
      const value = item[col];
      if (value === null || value === undefined) return '';
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',')
  );

  return [header, ...rows].join('\n');
}

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const format = req.query.format || 'json';

  try {
    const [contacts, opportunities, tasks] = await Promise.all([
      queryAll('SELECT * FROM contacts'),
      queryAll('SELECT * FROM opportunities'),
      queryAll('SELECT * FROM tasks')
    ]);

    if (format === 'csv') {
      const contactsCsv = generateCSV(contacts, ['id', 'name', 'company', 'email', 'phone', 'value', 'status', 'lastContact']);
      const opportunitiesCsv = generateCSV(opportunities, ['id', 'title', 'company', 'value', 'stage', 'probability', 'closeDate', 'owner']);
      const tasksCsv = generateCSV(tasks, ['id', 'title', 'type', 'priority', 'status', 'dueDate', 'contactId']);

      res.json({
        format: 'csv',
        data: {
          contacts: contactsCsv,
          opportunities: opportunitiesCsv,
          tasks: tasksCsv
        }
      });
    } else {
      res.json({
        format: 'json',
        exportDate: new Date().toISOString(),
        data: {
          contacts,
          opportunities,
          tasks
        }
      });
    }
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Error exporting data' });
  }
}

module.exports = withCors(authMiddleware(handler));

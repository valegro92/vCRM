const { getAll } = require('./database/helpers');

async function checkInvoices() {
    try {
        const invoices = await getAll('SELECT * FROM invoices');
        console.log('Invoices:', JSON.stringify(invoices, null, 2));

        const stats = await getAll(`
        SELECT 
          COUNT(*) as total,
          SUM(amount) as totalAmount,
          typeof(amount) as amountType
        FROM invoices
    `);
        console.log('Stats Check:', JSON.stringify(stats, null, 2));
    } catch (err) {
        console.error(err);
    }
}

checkInvoices();

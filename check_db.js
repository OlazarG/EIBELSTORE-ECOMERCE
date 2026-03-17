require('dotenv').config({ path: 'backend/.env' });
const pool = require('./backend/config/db');

async function checkDB() {
    try {
        const res = await pool.query('SELECT * FROM products');
        console.log('Products in DB:', res.rows.length);
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error('DB Error:', err.message);
    } finally {
        pool.end();
    }
}

checkDB();

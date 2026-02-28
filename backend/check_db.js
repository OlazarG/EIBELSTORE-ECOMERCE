const pool = require('./config/db');
require('dotenv').config();

async function checkDb() {
    try {
        const res = await pool.query('SELECT NOW()');
        console.log('Database connection successful:', res.rows[0]);

        const users = await pool.query('SELECT username, role FROM users');
        console.log('Current users in DB:', users.rows);
    } catch (err) {
        console.error('Database check failed:', err);
    } finally {
        pool.end();
    }
}

checkDb();

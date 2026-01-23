require('dotenv').config();
const pool = require('../config/db');

async function updateSchema() {
    const client = await pool.connect();
    try {
        console.log('Adding is_active column...');
        await client.query('ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true');
        console.log('Column added successfully!');
    } catch (err) {
        console.error('Error updating schema:', err);
    } finally {
        client.release();
        pool.end();
    }
}

updateSchema();

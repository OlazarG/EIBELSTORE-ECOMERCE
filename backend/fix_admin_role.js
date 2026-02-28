const pool = require('./config/db');
require('dotenv').config();

async function fix() {
    try {
        await pool.query("UPDATE users SET role = 'admin' WHERE username = 'admin'");
        console.log('Admin role updated successfully');
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}

fix();

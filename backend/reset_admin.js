const bcrypt = require('bcryptjs');
const pool = require('./config/db');
require('dotenv').config();

async function resetAdmin() {
    const password = 'admin';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    try {
        await pool.query('UPDATE users SET password = $1 WHERE username = $2', [hash, 'admin']);
        console.log('Admin password reset to: admin');
    } catch (err) {
        console.error('Error resetting password:', err);
    } finally {
        pool.end();
    }
}

resetAdmin();

const bcrypt = require('bcryptjs');
const pool = require('./config/db');

async function reset() {
    const hash = await bcrypt.hash('admin123', 10);
    try {
        await pool.query('UPDATE users SET password = $1 WHERE username = $2', [hash, 'admin']);
        console.log('Password reset successfully to: admin123');
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

reset();

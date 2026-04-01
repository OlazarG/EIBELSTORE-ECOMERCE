const bcrypt = require('bcryptjs');
const pool = require('./config/db');

async function reset() {
    const hash = await bcrypt.hash('w1nd0wsp1n', 10);
    try {
        await pool.query('UPDATE users SET password = $1 WHERE username = $2', [hash, 'admin']);
        console.log('Password reset successfully to: w1nd0wsp1n');
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

reset();

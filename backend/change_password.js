const bcrypt = require('bcryptjs');
const pool = require('./config/db');

async function changePassword(username, newPassword) {
    if (!username || !newPassword) {
        console.error('Usage: node change_password.js <username> <new_password>');
        process.exit(1);
    }

    try {
        console.log(`Updating password for user: ${username}...`);
        const hash = await bcrypt.hash(newPassword, 10);
        const result = await pool.query('UPDATE users SET password = $1 WHERE username = $2 RETURNING id', [hash, username]);
        
        if (result.rowCount === 0) {
            console.error(`User "${username}" not found.`);
        } else {
            console.log('Password updated successfully!');
        }
    } catch (err) {
        console.error('Error updating password:', err.message);
    } finally {
        await pool.end();
    }
}

const args = process.argv.slice(2);
changePassword(args[0] || 'admin', args[1]);

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

if (!process.env.JWT_SECRET) {
    throw new Error('FATAL: JWT_SECRET environment variable is not set.');
}
const SECRET_KEY = process.env.JWT_SECRET;

exports.login = async (req, res) => {
    const { username, password } = req.body;
    console.log(`Login attempt for username: ${username}`);

    try {
        console.log('Querying database for user...');
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = result.rows[0];

        if (!user) {
            console.warn(`FAILED LOGIN: User not found - ${username}`);
            return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
        }

        console.log('Comparing passwords...');
        const passwordIsValid = await bcrypt.compare(password, user.password);

        if (!passwordIsValid) {
            console.warn(`FAILED LOGIN: Invalid password for user - ${username}`);
            return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
        }

        console.log('Generating JWT token...');
        const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, {
            expiresIn: '2h' // Reduced to 2 hours for security
        });

        console.log(`Login successful for user: ${username}`);
        res.status(200).send({
            id: user.id,
            username: user.username,
            role: user.role,
            accessToken: token
        });
    } catch (err) {
        console.error('SERVER ERROR DURING LOGIN:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

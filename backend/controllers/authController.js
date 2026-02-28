const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

const SECRET_KEY = process.env.JWT_SECRET || 'supersecretkey';

exports.login = async (req, res) => {
    const { username, password } = req.body;
    console.log(`Login attempt for username: ${username}`);

    try {
        console.log('Querying database for user...');
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = result.rows[0];

        if (!user) {
            console.log(`User not found: ${username}`);
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('Comparing passwords...');
        const passwordIsValid = await bcrypt.compare(password, user.password);

        if (!passwordIsValid) {
            console.log(`Invalid password for user: ${username}`);
            return res.status(401).json({ message: 'Invalid password' });
        }

        console.log('Generating JWT token...');
        const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, {
            expiresIn: 86400 // 24 hours
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

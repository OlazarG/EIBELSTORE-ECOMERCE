require('dotenv').config({ path: './.env' });
const pool = require('./config/db');

async function testPut15() {
    const result = await pool.query("SELECT * FROM users WHERE role = 'admin' LIMIT 1");
    const admin = result.rows[0];
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: admin.id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: '1h', algorithm: 'HS256' });

    const form = new FormData();
    form.append('title', 'TEST PUT ID 15');
    form.append('price', '120000');
    form.append('stock', '10');
    form.append('category', 'Anillos');
    form.append('subcategory', 'AS');
    form.append('discount_percentage', '10');
    form.append('is_active', 'true');
    form.append('description', 'OLA');
    form.append('badge', 'OJO');

    console.log(`Sending PUT to /api/products/15...`);
    
    try {
        const response = await fetch(`http://localhost:3000/api/products/15`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: form
        });

        const text = await response.text();
        console.log("Status:", response.status);
        console.log("Response:", text);
    } catch (err) {
        console.error("Fetch Error:", err);
    }
    process.exit(0);
}

testPut15();

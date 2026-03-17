const fs = require('fs');
require('dotenv').config({ path: './.env' });
const pool = require('./config/db');

async function testPutNoImage() {
    const result = await pool.query("SELECT * FROM users WHERE role = 'admin' LIMIT 1");
    if (result.rows.length === 0) {
        console.error("No admin user found to test");
        process.exit(1);
    }
    const admin = result.rows[0];
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: admin.id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: '1h', algorithm: 'HS256' });

    const form = new FormData();
    form.append('title', 'TEST PUT NO IMAGE');
    form.append('price', '120000');
    form.append('stock', '10');
    
    const productResult = await pool.query("SELECT id FROM products LIMIT 1");
    const productId = productResult.rows[0].id;

    console.log(`Sending PUT (NO IMAGE) to /api/products/${productId}...`);
    
    try {
        const response = await fetch(`http://localhost:3000/api/products/${productId}`, {
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

testPutNoImage();

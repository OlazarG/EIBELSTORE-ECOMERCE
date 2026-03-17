const fs = require('fs');
require('dotenv').config({ path: './.env' });
const pool = require('./config/db');

async function testPut() {
    // 1. Get an admin token
    const result = await pool.query("SELECT * FROM users WHERE role = 'admin' LIMIT 1");
    if (result.rows.length === 0) {
        console.error("No admin user found to test");
        process.exit(1);
    }
    const admin = result.rows[0];
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: admin.id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: '1h', algorithm: 'HS256' });

    console.log("Got token for admin:", admin.username);

    // 2. Create a dummy image
    fs.writeFileSync('dummy.jpg', Buffer.from('ffd8ffe000104a46494600010101004800480000ffdb004300080606070605080707070909080a0c140d0c0b0b0c1912130f141d1a1f1e1d1a1c1c20242e2720222c231c1c2837292c30313434341f27393d38323c2e333432ffdb0043010909090c0b0c180d0d1832211c213232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232ffc0001108000a000a03012200021101031101ffc4001500010100000000000000000000000000000008ffc40014100100000000000000000000000000000000ffc4001501010100000000000000000000000000000006ffc40014110100000000000000000000000000000000ffda000c03010002110311003f00a000', 'hex'));

    const form = new FormData();
    form.append('title', 'TEST PUT SCRIPT');
    // Ensure numbers for express-validator
    form.append('price', '120000');
    form.append('stock', '10');
    
    // In Node fetch, appending a file requires a Blob or File. We can construct a blob
    const buffer = fs.readFileSync('dummy.jpg');
    const blob = new Blob([buffer], { type: 'image/jpeg' });
    form.append('images', blob, 'dummy.jpg');
    
    // 3. Find a product ID to update
    const productResult = await pool.query("SELECT id FROM products LIMIT 1");
    if (productResult.rows.length === 0) {
        console.error("No products found to update");
        process.exit(1);
    }
    const productId = productResult.rows[0].id;

    console.log(`Sending PUT to /api/products/${productId}...`);
    
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

testPut();

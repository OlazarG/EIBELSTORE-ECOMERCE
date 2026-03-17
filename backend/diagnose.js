const pool = require('./config/db');
const cloudinary = require('cloudinary').v2;
require('dotenv').config({ path: './.env' });

async function diagnose() {
    console.log("--- DB DIAGNOSIS ---");
    try {
        const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'products'");
        console.log("Products table columns:");
        res.rows.forEach(row => console.log(` - ${row.column_name}: ${row.data_type}`));
    } catch (err) {
        console.error("DB Error:", err.message);
    }

    console.log("\n--- CLOUDINARY DIAGNOSIS ---");
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    try {
        const result = await cloudinary.api.ping();
        console.log("Cloudinary Ping:", result.status);
    } catch (err) {
        console.error("Cloudinary Error:", err.message);
    }
    
    process.exit();
}

diagnose();

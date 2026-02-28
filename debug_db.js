require('dotenv').config({ path: './backend/.env' });
const pool = require('./backend/config/db');

async function debugProducts() {
    try {
        const res = await pool.query('SELECT id, title, gallery_urls FROM products');
        console.log('--- Product Gallery URLs ---');
        res.rows.forEach(row => {
            console.log(`ID: ${row.id}, Title: ${row.title}, Gallery URLs: "${row.gallery_urls}" (Length: ${row.gallery_urls ? row.gallery_urls.length : 0})`);
            if (row.gallery_urls) {
                try {
                    JSON.parse(row.gallery_urls);
                    console.log('   Status: Valid JSON');
                } catch (e) {
                    console.log('   Status: INVALID JSON -', e.message);
                }
            } else {
                console.log('   Status: NULL or empty');
            }
        });
        console.log('---------------------------');
    } catch (err) {
        console.error('Debug script failed:', err);
    } finally {
        pool.end();
    }
}

debugProducts();

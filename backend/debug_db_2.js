require('dotenv').config();
const pool = require('./config/db');

async function debugProducts() {
    try {
        const res = await pool.query('SELECT id, title, gallery_urls FROM products');
        console.log('--- Product Gallery URLs ---');
        res.rows.forEach(row => {
            const val = row.gallery_urls;
            const type = typeof val;
            const representation = val === null ? "NULL" : `"${val}"`;
            console.log(`ID: ${row.id}, Title: "${row.title}"`);
            console.log(`   Value: ${representation}, Type: ${type}, Length: ${val ? val.length : 0}`);

            if (val !== null && type === 'string') {
                if (val.trim() === "") {
                    console.log('   Status: Empty or whitespace string (Falsy if empty, Truthy if whitespace)');
                } else {
                    try {
                        JSON.parse(val);
                        console.log('   Status: Valid JSON');
                    } catch (e) {
                        console.log('   Status: INVALID JSON -', e.message);
                    }
                }
            } else if (val === null) {
                console.log('   Status: NULL');
            } else {
                console.log('   Status: Not a string and not NULL');
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

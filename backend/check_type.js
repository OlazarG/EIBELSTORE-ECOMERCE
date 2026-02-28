require('dotenv').config({ path: './.env' });
const pool = require('./config/db');

async function checkColumnType() {
    try {
        const res = await pool.query(`
            SELECT column_name, data_type, udt_name 
            FROM information_schema.columns 
            WHERE table_name = 'products' AND column_name = 'gallery_urls'
        `);
        console.log('--- Column Info for gallery_urls ---');
        console.table(res.rows);

        const sample = await pool.query('SELECT gallery_urls FROM products LIMIT 1');
        if (sample.rows.length > 0) {
            console.log('Sample gallery_urls value:', sample.rows[0].gallery_urls);
            console.log('Sample type of:', typeof sample.rows[0].gallery_urls);
            console.log('Is Array?', Array.isArray(sample.rows[0].gallery_urls));
        }
    } catch (err) {
        console.error('Check failed:', err);
    } finally {
        pool.end();
    }
}

checkColumnType();

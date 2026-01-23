const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

const usersPath = path.join(__dirname, '../data/users.json');
const productsPath = path.join(__dirname, '../data/products.json');
const schemaPath = path.join(__dirname, '../database/schema.sql');

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('Creating tables...');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        await client.query(schema);

        console.log('Migrating users...');
        if (fs.existsSync(usersPath)) {
            const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
            for (const user of users) {
                // Check if exists
                const res = await client.query('SELECT id FROM users WHERE username = $1', [user.username]);
                if (res.rows.length === 0) {
                    await client.query(
                        'INSERT INTO users (username, password, role) VALUES ($1, $2, $3)',
                        [user.username, user.password, user.role]
                    );
                }
            }
        }

        console.log('Migrating products...');
        if (fs.existsSync(productsPath)) {
            const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
            for (const p of products) {
                // Check if exists (by title for simplicity during migration, or just insert)
                // Since IDs in JSON might be timestamps, we can try to preserve them or let DB assign new ones.
                // Let's let DB assign new IDs but try to match if title exists to avoid dupes.
                const res = await client.query('SELECT id FROM products WHERE title = $1', [p.title]);
                if (res.rows.length === 0) {
                    await client.query(
                        'INSERT INTO products (title, category, subcategory, price, stock, description, badge, image, gallery_urls) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
                        [
                            p.title,
                            p.category,
                            p.subcategory || '',
                            p.price,
                            p.stock || 0,
                            p.description || '',
                            p.badge || '',
                            p.image || '',
                            JSON.stringify(p.gallery_urls || [])
                        ]
                    );
                }
            }
        }

        console.log('Migration complete!');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        client.release();
        pool.end();
    }
}

migrate();

const pool = require('../config/db');

class ProductService {
    async getAllProducts() {
        const result = await pool.query('SELECT * FROM products ORDER BY id ASC');
        return result.rows.map(p => {
            let gallery = p.gallery_urls;
            if (typeof gallery === 'string') {
                try { gallery = JSON.parse(gallery); } catch (e) { gallery = []; }
            }
            return {
                ...p,
                gallery_urls: gallery || []
            };
        });
    }

    async getProductById(id) {
        const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
        const product = result.rows[0];
        if (product && typeof product.gallery_urls === 'string') {
            try { product.gallery_urls = JSON.parse(product.gallery_urls); } catch (e) { product.gallery_urls = []; }
        } else if (product && !product.gallery_urls) {
            product.gallery_urls = [];
        }
        return product;
    }

    async createProduct({ title, category, subcategory, price, stock, description, badge, is_active, discount_percentage, image, gallery_urls }) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const result = await client.query(
                `INSERT INTO products 
                (title, category, subcategory, price, stock, description, badge, image, gallery_urls, is_active, discount_percentage) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
                [
                    title,
                    category,
                    subcategory,
                    parseFloat(price) || 0,
                    parseInt(stock) || 0,
                    description,
                    badge,
                    image,
                    JSON.stringify(gallery_urls),
                    is_active === 'true' || is_active === true || is_active === undefined,
                    parseInt(discount_percentage) || 0
                ]
            );
            await client.query('COMMIT');
            return result.rows[0];
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    async updateProduct(id, { title, category, subcategory, price, stock, description, badge, is_active, discount_percentage, image, gallery_urls }) {
        const productId = parseInt(id);
        if (isNaN(productId)) {
            throw new Error('Invalid product ID format');
        }

        const activeStatus = is_active !== undefined ? (is_active === 'true' || is_active === true || is_active === '1') : undefined;
        const discountStatus = discount_percentage !== undefined ? parseInt(discount_percentage) : undefined;
        // Stringify here because we handle the json logic before injecting in SQL
        const gUrlsParam = gallery_urls ? JSON.stringify(gallery_urls) : null; 

        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const result = await client.query(
                `UPDATE products SET 
                    title = COALESCE($1, title), 
                    category = COALESCE($2, category), 
                    subcategory = COALESCE($3, subcategory), 
                    price = COALESCE($4, price), 
                    stock = COALESCE($5, stock), 
                    description = COALESCE($6, description), 
                    badge = COALESCE($7, badge), 
                    image = COALESCE($8, image), 
                    gallery_urls = COALESCE($9, gallery_urls), 
                    is_active = COALESCE($10, is_active), 
                    discount_percentage = COALESCE($11, discount_percentage) 
                WHERE id = $12 RETURNING *`,
                [
                    title !== undefined ? title : null,
                    category !== undefined ? category : null,
                    subcategory !== undefined ? subcategory : null,
                    price !== undefined ? parseFloat(price) : null,
                    stock !== undefined ? parseInt(stock) : null,
                    description !== undefined ? description : null,
                    badge !== undefined ? badge : null,
                    image !== undefined ? image : null,
                    gUrlsParam !== undefined ? gUrlsParam : null,
                    activeStatus !== undefined ? activeStatus : null,
                    discountStatus !== undefined ? discountStatus : null,
                    productId
                ]
            );

            if (result.rows.length === 0) {
                await client.query('ROLLBACK');
                return null;
            }

            await client.query('COMMIT');
            return result.rows[0];
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    async deleteProduct(id) {
        const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
        const product = result.rows[0];
        if (product && typeof product.gallery_urls === 'string') {
            try { product.gallery_urls = JSON.parse(product.gallery_urls); } catch (e) { product.gallery_urls = []; }
        }
        return product;
    }
}

module.exports = new ProductService();

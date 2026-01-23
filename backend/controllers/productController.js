const pool = require('../config/db');

exports.getAllProducts = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products ORDER BY id ASC');
        const products = result.rows.map(p => ({
            ...p,
            gallery_urls: p.gallery_urls ? JSON.parse(p.gallery_urls) : []
        }));
        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching products' });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
        const product = result.rows[0];
        if (!product) return res.status(404).json({ message: 'Product not found' });

        product.gallery_urls = product.gallery_urls ? JSON.parse(product.gallery_urls) : [];
        res.json(product);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching product' });
    }
};

exports.createProduct = async (req, res) => {
    const { title, category, subcategory, price, stock, description, badge, is_active } = req.body;
    const image = req.files && req.files.length > 0 ? `/uploads/${req.files[0].filename}` : '';
    const gallery_urls = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];

    try {
        const result = await pool.query(
            'INSERT INTO products (title, category, subcategory, price, stock, description, badge, image, gallery_urls, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
            [title, category, subcategory, price, stock, description, badge, image, JSON.stringify(gallery_urls), is_active !== undefined ? is_active : true]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating product' });
    }
};

exports.updateProduct = async (req, res) => {
    const { id } = req.params;
    const { title, category, subcategory, price, stock, description, badge, is_active } = req.body;

    try {
        const oldRes = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
        if (oldRes.rows.length === 0) return res.status(404).json({ message: 'Product not found' });
        const oldProduct = oldRes.rows[0];

        let image = oldProduct.image;
        let gallery_urls = oldProduct.gallery_urls ? JSON.parse(oldProduct.gallery_urls) : [];

        if (req.files && req.files.length > 0) {
            image = `/uploads/${req.files[0].filename}`;
            gallery_urls = req.files.map(f => `/uploads/${f.filename}`);
        }

        const activeStatus = is_active !== undefined ? is_active : oldProduct.is_active;

        const result = await pool.query(
            'UPDATE products SET title=$1, category=$2, subcategory=$3, price=$4, stock=$5, description=$6, badge=$7, image=$8, gallery_urls=$9, is_active=$10 WHERE id=$11 RETURNING *',
            [title, category, subcategory, price, stock, description, badge, image, JSON.stringify(gallery_urls), activeStatus, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating product' });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error deleting product' });
    }
};

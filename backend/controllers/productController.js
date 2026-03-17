const productService = require('../services/productService');

exports.getAllProducts = async (req, res) => {
    try {
        const products = await productService.getAllProducts();
        res.json(products);
    } catch (err) {
        console.error("ERROR FETCHING PRODUCTS:", err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const product = await productService.getProductById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

exports.createProduct = async (req, res) => {
    const { title, category, subcategory, price, stock, description, badge, is_active, discount_percentage } = req.body;
    
    // Cloudinary automatically adds the secure URL to `file.path`
    const image = req.files && req.files.length > 0 ? req.files[0].path : '';
    const gallery_urls = req.files ? req.files.map(f => f.path) : [];

    try {
        const newProduct = await productService.createProduct({
            title, category, subcategory, price, stock, description, badge, 
            is_active, discount_percentage, image, gallery_urls
        });
        res.status(201).json(newProduct);
    } catch (err) {
        console.error("CREATE ERROR:", err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

exports.updateProduct = async (req, res) => {
    const { id } = req.params;
    const { title, category, subcategory, price, stock, description, badge, is_active, discount_percentage } = req.body;

    let image = undefined;
    let gallery_urls = undefined;

    if (req.files && req.files.length > 0) {
        image = req.files[0].path;
        gallery_urls = req.files.map(f => f.path);
    }

    try {
        const updatedProduct = await productService.updateProduct(id, {
            title, category, subcategory, price, stock, description, badge, 
            is_active, discount_percentage, image, gallery_urls
        });

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(updatedProduct);
    } catch (err) {
        console.error("UPDATE ERROR:", err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const deleted = await productService.deleteProduct(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const productService = require('../services/productService');
const { deleteFromCloudinary } = require('../utils/cloudinary');

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
        // Handle image deletions if provided
        const deletedImages = req.body.deleted_images ? (typeof req.body.deleted_images === 'string' ? JSON.parse(req.body.deleted_images) : req.body.deleted_images) : [];
        if (deletedImages.length > 0) {
            console.log("Images to delete from Cloudinary:", deletedImages);
            for (const imageUrl of deletedImages) {
                await deleteFromCloudinary(imageUrl);
            }
        }

        // Fetch current product to handle gallery filtering
        const currentProduct = await productService.getProductById(id);
        if (!currentProduct) return res.status(404).json({ message: 'Product not found' });

        // Filter out deleted images from existing gallery
        let updatedGallery = (currentProduct.gallery_urls || []).filter(url => !deletedImages.includes(url));
        
        // Add new images if any
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(f => f.path);
            updatedGallery = [...updatedGallery, ...newImages];
        }

        // Determine main image
        // If main image was deleted, pick the first from the updated gallery, or empty
        let mainImage = currentProduct.image;
        if (deletedImages.includes(mainImage)) {
            mainImage = updatedGallery.length > 0 ? updatedGallery[0] : '';
        } else if (req.files && req.files.length > 0 && !mainImage) {
            mainImage = req.files[0].path;
        }

        const updatedProduct = await productService.updateProduct(id, {
            title, category, subcategory, price, stock, description, badge, 
            is_active, discount_percentage, 
            image: mainImage, 
            gallery_urls: updatedGallery
        });

        res.json(updatedProduct);
    } catch (err) {
        console.error("UPDATE ERROR:", err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const deletedProduct = await productService.deleteProduct(req.params.id);
        if (!deletedProduct) return res.status(404).json({ message: 'Product not found' });

        // Clean up Cloudinary
        if (deletedProduct.image) await deleteFromCloudinary(deletedProduct.image);
        if (deletedProduct.gallery_urls && Array.isArray(deletedProduct.gallery_urls)) {
            for (const url of deletedProduct.gallery_urls) {
                await deleteFromCloudinary(url);
            }
        }

        res.json({ message: 'Product deleted successfully and images removed' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

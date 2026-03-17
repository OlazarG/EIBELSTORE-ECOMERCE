const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const verifyRole = require('../middleware/roleMiddleware');
const upload = require('../middleware/upload');

// Validation Middleware
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

const productValidations = [
    body('title').isString().trim().escape().notEmpty(),
    body('price').isFloat({ min: 0.1, max: 1000000 }).withMessage('Precio inválido'),
    body('stock').isInt({ min: 0 }).withMessage('El stock no puede ser negativo'),
    body('discount_percentage').optional().isInt({ min: 0, max: 100 }).withMessage('Descuento fuera de rango lógico'),
    body('description').optional().isString().trim().escape(),
];

// Public routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Protected routes (Admin only)
router.post('/', authMiddleware, verifyRole('admin'), upload.array('images', 5), productValidations, validateRequest, productController.createProduct);
router.put('/:id', authMiddleware, verifyRole('admin'), upload.array('images', 5), productValidations, validateRequest, productController.updateProduct);
router.delete('/:id', authMiddleware, verifyRole('admin'), productController.deleteProduct);

module.exports = router;


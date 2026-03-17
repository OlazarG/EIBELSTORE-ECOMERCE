const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 5, 
    message: { error: 'Demasiados intentos de inicio de sesión, por favor intenta en 15 minutos.' },
    standardHeaders: true,
    legacyHeaders: false,
});

router.post('/login', authLimiter, authController.login);

module.exports = router;

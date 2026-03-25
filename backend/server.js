require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Trust Nginx reverse proxy (important for DigitalOcean)
if (NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

app.use((req, res, next) => { console.log('--- RAW REQUEST RECEIVED ---', req.method, req.url); next(); });

// Security Headers with custom CSP for images
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "img-src": ["'self'", "data:", "res.cloudinary.com", "placehold.co", "*.placehold.co"],
            "script-src": ["'self'", "'unsafe-inline'"], // Permitiendo inline temporalmente para migración suave si fuera necesario, o mantener restrictivo si ya externalizamos todo.
        },
    },
}));

// Request Logger
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Ensure uploads & logs directories exist
const uploadsDir = path.join(__dirname, 'uploads');
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);

// Middleware
const allowedOrigins = NODE_ENV === 'production'
    ? [process.env.CORS_ORIGIN].filter(Boolean)
    : [
        'http://localhost:3000',
        'http://localhost:3001',
        process.env.CORS_ORIGIN
    ].filter(Boolean);

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

app.use(express.json({ limit: '10kb', strict: true }));
app.use(bodyParser.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// Serve frontend files (if you want to serve the whole site from here, or just admin)
app.use(express.static(path.join(__dirname, '../'))); // Serve root for images/css/js


app.get('/', (req, res) => {
    res.send('E-commerce Backend is running');
});

// Global error handler
const util = require('util');
app.use((err, req, res, next) => {
    const errorLog = `${new Date().toISOString()} - GLOBAL ERROR: ${util.inspect(err, { depth: null })}\n`;
    fs.appendFileSync(path.join(__dirname, 'error_debug.log'), errorLog);
    console.error("FULL GLOBAL ERROR:", util.inspect(err, { depth: null }));

    res.status(err.status || 500).json({
        error: 'Error interno del servidor',
        details: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT} [VERSION_FIX_UPLOADS]`);
});

// Force event-loop to stay alive for debugging
setInterval(() => {}, 1000000);

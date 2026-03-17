require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;

// Security Headers
app.use(helmet());

// Request Logger
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.CORS_ORIGIN
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins
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

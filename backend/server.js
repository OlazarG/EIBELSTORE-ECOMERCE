const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Middleware
app.use(cors());
app.use(bodyParser.json());
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

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT} [VERSION_FIX_UPLOADS]`);
});

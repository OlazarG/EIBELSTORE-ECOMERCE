const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure cloudinary just in case it's not globally configured
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Extracts public_id from a Cloudinary URL and deletes the image.
 * Cloudinary URL format: 
 * https://res.cloudinary.com/<cloud_name>/image/upload/v<version>/<folder>/<public_id>.<ext>
 */
async function deleteFromCloudinary(url) {
    if (!url || typeof url !== 'string' || !url.includes('cloudinary.com')) {
        console.log('Not a Cloudinary URL or empty:', url);
        return;
    }

    try {
        // Find the part after /upload/ (usually contains v<version>/<folder>/<public_id>)
        const uploadIndex = url.indexOf('/upload/');
        if (uploadIndex === -1) return;

        const pathAfterUpload = url.substring(uploadIndex + 8); // Skip "/upload/"
        
        // Split by '/' and ignore the first part if it's a version (starts with 'v')
        const parts = pathAfterUpload.split('/');
        if (parts[0].startsWith('v')) {
            parts.shift();
        }

        // The remaining parts are <folder>/<public_id>.<ext>
        // We need to remove the extension
        const lastPart = parts[parts.length - 1];
        parts[parts.length - 1] = lastPart.split('.')[0];

        const publicId = parts.join('/');
        
        console.log(`Deleting from Cloudinary. Public ID: ${publicId}`);
        const result = await cloudinary.uploader.destroy(publicId);
        console.log('Cloudinary destroy result:', result);
        return result;
    } catch (err) {
        console.error('Error deleting from Cloudinary:', err.message);
        throw err;
    }
}

module.exports = { deleteFromCloudinary };

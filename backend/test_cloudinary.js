const cloudinary = require('cloudinary').v2;
require('dotenv').config({ path: './.env' });

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

async function testUpload() {
    console.log("Testing Cloudinary Upload...");
    console.log("Config:", {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY
    });
    
    try {
        // Use a simple base64 image or a remote one
        const result = await cloudinary.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/a3/June_odd-eyed_white_cat.jpg", {
            folder: "test_folder"
        });
        console.log("Upload Success:", result.secure_url);
    } catch (err) {
        console.error("Upload Error Details:");
        console.error(JSON.stringify(err, null, 2));
    }
    process.exit();
}

testUpload();

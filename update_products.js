const fs = require('fs');
const path = 'c:\\Users\\Computer\\Documents\\ECOMERCE\\products.html';

try {
    let content = fs.readFileSync(path, 'utf8');
    const target = '<li><a href="products.html" class="active">Colección</a></li>';
    const replacement = '<li><a href="products.html" class="active">Colección</a></li>\n                <li><a href="backend/public/admin/login.html">Login</a></li>';

    if (content.includes(target) && !content.includes('backend/public/admin/login.html')) {
        const newContent = content.replace(target, replacement);
        fs.writeFileSync(path, newContent, 'utf8');
        console.log('Successfully updated products.html');
    } else {
        console.log('Target not found or already updated');
    }
} catch (err) {
    console.error('Error:', err);
}

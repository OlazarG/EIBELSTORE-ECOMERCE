const token = localStorage.getItem('token');

// Redirect if no token
if (!token) window.location.href = 'login.html';

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// Load Products
async function loadProducts() {
    const grid = document.getElementById('productsGrid');
    try {
        const res = await fetch('/api/products');
        if (res.ok) {
            const products = await res.json();
            if (products.length === 0) {
                grid.innerHTML = '<p style="color:white; grid-column: 1/-1; text-align:center;">No hay productos</p>';
                return;
            }
            grid.innerHTML = products.map(p => {
                const img = p.image_url || p.image || 'https://placehold.co/300x200';
                const displayImg = img;
                const discount = parseInt(p.discount_percentage) || 0;
                const originalPrice = Number(p.price);
                const discountedPrice = discount > 0 ? originalPrice * (1 - discount / 100) : originalPrice;
                const isActive = p.is_active !== false;

                // Data attribute encoding for the product object
                const productData = btoa(unescape(encodeURIComponent(JSON.stringify(p))));

                return `
                <div class="product-card">
                    <div class="card-header">
                        <span class="status-badge ${isActive ? 'status-active' : 'status-inactive'}">
                            ${isActive ? 'Active' : 'Inactive'}
                        </span>
                        ${discount > 0 ? `<span class="status-badge status-inactive" style="top: 40px; background: #ff4757;">-${discount}%</span>` : ''}
                        <img src="${displayImg}" alt="${p.title}">
                    </div>
                    <div class="card-body">
                        <h3 class="card-title">${p.title}</h3>
                        <p class="card-desc">${p.description || 'Sin descripción'}</p>
                        
                        <div class="card-row">
                            <span class="category-badge">${p.category || 'GENERAL'}</span>
                            <div class="price-container">
                                ${discount > 0 ? `<div style="text-decoration: line-through; color: #a4b0be; font-size: 0.8rem;">Gs. ${originalPrice.toLocaleString('es-PY')}</div>` : ''}
                                <div class="card-price">Gs. ${discountedPrice.toLocaleString('es-PY')}</div>
                            </div>
                        </div>

                        <div class="card-row">
                            <span class="stock-text">Stock: ${p.stock || 0}</span>
                            <span class="date-text">12/10/2025</span>
                        </div>

                        <div class="card-actions">
                            <button class="action-btn edit-btn" data-product="${productData}">
                                Edit 📝
                            </button>
                            <button class="action-btn delete-btn" data-id="${p.id}">
                                Delete 🗑️
                            </button>
                            <button class="action-btn toggle-btn" data-id="${p.id}" data-status="${isActive}">
                                ${isActive ? 'Unpublish 🚫' : 'Publish ✅'}
                            </button>
                        </div>
                    </div>
                </div>
            `}).join('');
        } else {
            console.error('API Error:', res.status);
        }
    } catch (e) {
        console.error(e);
    }
}

// Toggle Publish
async function togglePublish(id, currentStatus) {
    try {
        const res = await fetch(`/api/products/${id}`);
        const product = await res.json();

        const data = new FormData();
        data.append('title', product.title);
        data.append('category', product.category);
        data.append('subcategory', product.subcategory || '');
        data.append('price', product.price);
        data.append('stock', product.stock);
        data.append('description', product.description || '');
        data.append('badge', product.badge || '');
        data.append('is_active', !currentStatus);
        data.append('discount_percentage', product.discount_percentage || 0);

        const updateRes = await fetch(`/api/products/${id}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: data
        });

        if (updateRes.ok) {
            loadProducts();
        } else {
            alert('Error updating status');
        }
    } catch (e) {
        console.error(e);
        alert('Error de conexión');
    }
}

// Modal Logic
let selectedFiles = [];
let deletedURLs = [];
const modal = document.getElementById('productModal');
const form = document.getElementById('productForm');

function openModal(product = null) {
    selectedFiles = [];
    deletedURLs = [];
    updateImagePreviews();
    updateExistingImagePreviews(product);

    if (product) {
        document.getElementById('modalTitle').textContent = 'Editar Producto';
        document.getElementById('productId').value = product.id;
        document.getElementById('title').value = product.title;
        document.getElementById('category').value = product.category;
        document.getElementById('subcategory').value = product.subcategory || '';
        document.getElementById('price').value = product.price;
        document.getElementById('stock').value = product.stock || 0;
        document.getElementById('badge').value = product.badge || '';
        document.getElementById('discount_percentage').value = product.discount_percentage || 0;
        document.getElementById('description').value = product.description || '';
        document.getElementById('is_active').checked = product.is_active !== false;
    } else {
        document.getElementById('modalTitle').textContent = 'Nuevo Producto';
        if (form) form.reset();
        document.getElementById('productId').value = '';
        document.getElementById('is_active').checked = true;
    }
    if (modal) {
        modal.style.display = 'flex';
        document.body.classList.add('modal-open');
    }
}

function closeModal() {
    if (modal) {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
    }
}

// Event Delegation for products grid
document.getElementById('productsGrid').addEventListener('click', (e) => {
    const target = e.target;
    
    // Edit Button
    if (target.classList.contains('edit-btn')) {
        const productData = target.getAttribute('data-product');
        const product = JSON.parse(decodeURIComponent(escape(atob(productData))));
        openModal(product);
    }
    
    // Delete Button
    if (target.classList.contains('delete-btn')) {
        const id = target.getAttribute('data-id');
        deleteProduct(id);
    }
    
    // Toggle Button
    if (target.classList.contains('toggle-btn')) {
        const id = target.getAttribute('data-id');
        const status = target.getAttribute('data-status') === 'true';
        togglePublish(id, status);
    }
});

// Static Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Load products
    loadProducts();

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });

    // Add Product
    const addProductBtn = document.getElementById('addProductBtn');
    if (addProductBtn) addProductBtn.addEventListener('click', () => openModal());

    // Close Modals
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', closeModal);
    });
});

// File Input
const fileInput = document.getElementById('images');
if (fileInput) {
    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        selectedFiles = [...selectedFiles, ...files];
        updateImagePreviews();
        fileInput.value = '';
    });
}

    // Render Existing Images
    function updateExistingImagePreviews(product) {
        const container = document.getElementById('existingImagePreviews');
        if (!container) return;
        container.innerHTML = '';

        if (!product) return;

        const allImages = [];
        if (product.image) allImages.push(product.image);
        if (product.gallery_urls && Array.isArray(product.gallery_urls)) {
            product.gallery_urls.forEach(url => {
                if (url !== product.image) allImages.push(url);
            });
        }

        allImages.forEach(url => {
            if (deletedURLs.includes(url)) return;

            const div = document.createElement('div');
            div.className = 'preview-item';
            div.style.cssText = 'position: relative; display: inline-block;';

            const img = document.createElement('img');
            img.src = url;
            img.style.cssText = 'width: 80px; height: 80px; object-fit: cover; border-radius: 4px; border: 1px solid #555;';

            const btn = document.createElement('button');
            btn.innerHTML = '×';
            btn.type = 'button';
            btn.style.cssText = 'position: absolute; top: -5px; right: -5px; background: #ff4444; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);';
            btn.onclick = () => {
                deletedURLs.push(url);
                updateExistingImagePreviews(product);
            };

            div.appendChild(img);
            div.appendChild(btn);
            container.appendChild(div);
        });
    }

    // Render New Image Previews
    function updateImagePreviews() {
    const container = document.getElementById('imagePreviews');
    if (!container) return;
    container.innerHTML = '';
    selectedFiles.forEach((file, index) => {
        const div = document.createElement('div');
        div.style.cssText = 'position: relative; display: inline-block; margin: 5px;';

        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.style.cssText = 'width: 80px; height: 80px; object-fit: cover; border-radius: 4px; border: 1px solid #555;';

        const btn = document.createElement('button');
        btn.innerHTML = '×';
        btn.style.cssText = 'position: absolute; top: -5px; right: -5px; background: red; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; font-size: 12px; line-height: 1;';
        btn.type = 'button';
        btn.onclick = () => {
            selectedFiles.splice(index, 1);
            updateImagePreviews();
        };

        div.appendChild(img);
        div.appendChild(btn);
        container.appendChild(div);
    });
}

if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('productId').value;
        const formData = new FormData(e.target);
        if (!id) formData.delete('id');

        formData.delete('images');
        selectedFiles.forEach(file => formData.append('images', file));

        // Fix for checkbox state
        formData.set('is_active', document.getElementById('is_active').checked);

        // Process deletions
        formData.append('deleted_images', JSON.stringify(deletedURLs));

        const method = id ? 'PUT' : 'POST';
        const url = id ? `/api/products/${id}` : '/api/products';

        try {
            const res = await fetch(url, {
                method: method,
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: formData
            });
            if (res.ok) {
                closeModal();
                loadProducts();
            } else {
                alert('Error al guardar');
            }
        } catch (e) {
            console.error(e);
            alert('Error de conexión');
        }
    });
}

async function deleteProduct(id) {
    if (!confirm('¿Eliminar?')) return;
    try {
        const res = await fetch(`/api/products/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) loadProducts();
        else alert('Error al eliminar');
    } catch (e) {
        console.error(e);
    }
}

// --- Navigation View Switching ---
const navInventoryBtn = document.getElementById('navInventoryBtn');
const navUserBtn = document.getElementById('navUserBtn');
const productsView = document.getElementById('productsView');
const userManagementView = document.getElementById('userManagementView');

if (navInventoryBtn && navUserBtn) {
    navInventoryBtn.addEventListener('click', (e) => {
        e.preventDefault();
        navInventoryBtn.classList.add('active');
        navUserBtn.classList.remove('active');
        productsView.style.display = 'block';
        userManagementView.style.display = 'none';
        loadProducts();
    });

    navUserBtn.addEventListener('click', (e) => {
        e.preventDefault();
        navUserBtn.classList.add('active');
        navInventoryBtn.classList.remove('active');
        userManagementView.style.display = 'block';
        productsView.style.display = 'none';
    });
}

// --- Update Password Form Handling ---
const updatePasswordForm = document.getElementById('updatePasswordForm');
if (updatePasswordForm) {
    updatePasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newPassword = document.getElementById('newAdminPassword').value;
        const msgEl = document.getElementById('passwordUpdateMsg');
        
        try {
            const res = await fetch('/api/auth/update-password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ newPassword })
            });
            const data = await res.json();
            
            msgEl.style.display = 'block';
            if (res.ok) {
                msgEl.style.color = '#4cd137'; // success color matches retro theme slightly
                msgEl.textContent = 'Contraseña actualizada correctamente';
                updatePasswordForm.reset();
                setTimeout(() => { msgEl.style.display = 'none'; }, 3000);
            } else {
                msgEl.style.color = '#ff4757'; // error color
                msgEl.textContent = data.message || 'Error al actualizar contraseña';
            }
        } catch (error) {
            console.error(error);
            msgEl.style.display = 'block';
            msgEl.style.color = '#ff4757';
            msgEl.textContent = 'Error de conexión';
        }
    });
}

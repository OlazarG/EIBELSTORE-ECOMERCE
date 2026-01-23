const API_URL = 'http://localhost:3000/api/products';
const STATIC_URL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', async function () {
    const productsGrid = document.getElementById('productsGrid');
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const productsCount = document.getElementById('productsCount');

    // Fetch Products
    try {
        const response = await fetch(API_URL);
        if (response.ok) {
            const apiProducts = await response.json();
            // Normalize image URLs from API
            window.products = apiProducts.map(p => {
                // If it's a backend upload, prepend URL. If it's a static file path, leave it (or handle mixed data)
                // Assuming new products from backend start with /uploads
                let img = p.image_url || p.image;
                if (img && img.startsWith('/uploads')) {
                    img = STATIC_URL + img;
                }

                // Handle Gallery for rotation
                let images = [];
                if (p.gallery_urls) {
                    // Try parsing if it's a string, or use if array
                    try {
                        const parsed = typeof p.gallery_urls === 'string' ? JSON.parse(p.gallery_urls) : p.gallery_urls;
                        images = Array.isArray(parsed) ? parsed : [];
                    } catch (e) { images = []; }
                }

                // URL Prefixing for Gallery
                images = images.map(url => {
                    if (url && url.startsWith('/uploads')) {
                        return STATIC_URL + url;
                    }
                    return url;
                });

                // If gallery is empty but we have main image, use that
                if (images.length === 0 && img) images = [img];

                return {
                    ...p,
                    price: Number(p.price), // Ensure number
                    image: img,
                    images: images
                };
            });
            if (window.products.length === 0) {
                console.warn('API returned empty, using static backup for demo/testing if initialized');
                if (typeof products !== 'undefined' && products.length > 0) window.products = products;
            }
        } else {
            console.warn('API Error, falling back to static data');
            if (typeof products !== 'undefined') window.products = products;
        }
    } catch (e) {
        console.warn('API Connection Failed, falling back to static data', e);
        if (typeof products !== 'undefined') window.products = products;
    }

    // Initial Load
    renderProducts(window.products || []);

    // Filter Logic
    window.applyFilters = function () {
        let filtered = window.products || [];

        // Category
        const cat = categoryFilter.value;
        if (cat) {
            filtered = filtered.filter(p => p.category && p.category.toLowerCase() === cat.toLowerCase());
        }

        // Search
        const query = searchInput.value.toLowerCase();
        if (query) {
            filtered = filtered.filter(p =>
                (p.title && p.title.toLowerCase().includes(query)) ||
                (p.description && p.description.toLowerCase().includes(query))
            );
        }

        renderProducts(filtered);
    };

    window.clearFilters = function () {
        categoryFilter.value = "";
        searchInput.value = "";
        currentSubcategory = "";
        document.getElementById('subcatFilterDiv').style.display = 'none';

        // Clean URL
        const url = new URL(window.location);
        url.searchParams.delete('category');
        url.searchParams.delete('subcategory');
        url.searchParams.delete('search');
        window.history.pushState({}, '', url);

        renderProducts(window.products || []);
    };

    function renderProducts(items) {
        if (!productsGrid) return;
        productsGrid.innerHTML = '';

        if (!items || items.length === 0) {
            productsGrid.innerHTML = '<div class="no-products">No se encontraron joyas que coincidan.</div>';
            if (productsCount) productsCount.textContent = 'Mostrando 0 productos';
            return;
        }

        if (productsCount) productsCount.textContent = `Mostrando ${items.length} productos`;

        items.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';

            card.onclick = (e) => {
                if (!e.target.closest('.card-btn-add')) {
                    window.location.href = `product-detail.html?id=${product.id}`;
                }
            };

            const badgeHtml = product.badge ? `<div class="product-badge">${product.badge}</div>` : '';

            // Image Logic
            const hasMultipleImages = product.images && product.images.length > 1;
            const displayImage = (product.images && product.images.length > 0) ? product.images[0] : (product.image || 'image/placeholder.jpg');
            const imgId = `prod-img-${product.id}`;

            card.innerHTML = `
                <div class="product-image">
                    <img id="${imgId}" src="${displayImage}" alt="${product.title || 'Producto'}" style="width: 100%; height: 100%; object-fit: contain; transition: opacity 0.5s ease;" onerror="this.src='https://placehold.co/300x300?text=No+Image'">
                    ${badgeHtml}
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.title}</h3>
                    <p class="product-category">${product.category}</p>
                    <p class="product-price">Gs. ${product.price.toLocaleString('es-PY')}</p>
                    <div class="product-actions">
                        ${isAdmin ? `
                            <button class="card-btn-edit" onclick="event.stopPropagation(); openProductModal(${JSON.stringify(product).replace(/"/g, '&quot;')})">Editar</button>
                            <button class="card-btn-delete" onclick="event.stopPropagation(); deleteProduct(${product.id})">Eliminar</button>
                        ` : `
                            <button class="card-btn-add" data-id="${product.id}">Añadir al Carrito</button>
                        `}
                    </div>
                </div>
            `;
            productsGrid.appendChild(card);

            // Add to Cart Logic
            const btn = card.querySelector('.card-btn-add');
            btn.onclick = (e) => {
                e.stopPropagation();
                if (typeof Cart !== 'undefined') {
                    Cart.addItem(product);
                    btn.textContent = "¡Añadido!";
                    btn.classList.add('added');
                    setTimeout(() => {
                        btn.textContent = "Añadir al Carrito";
                        btn.classList.remove('added');
                    }, 2000);
                } else {
                    console.error("Cart module not found");
                }
            };

            // Hover Rotate Images
            if (hasMultipleImages) {
                let intervalId = null;
                let imgIdx = 0;
                const imgEl = document.getElementById(imgId);

                card.addEventListener('mouseenter', () => {
                    if (intervalId) return;

                    intervalId = setInterval(() => {
                        imgEl.style.opacity = 0;
                        setTimeout(() => {
                            imgIdx = (imgIdx + 1) % product.images.length;
                            imgEl.src = product.images[imgIdx];
                            imgEl.style.opacity = 1;
                        }, 200);
                    }, 1500);
                });

                card.addEventListener('mouseleave', () => {
                    if (intervalId) {
                        clearInterval(intervalId);
                        intervalId = null;
                    }
                    // Reset to main image
                    imgEl.style.opacity = 0;
                    setTimeout(() => {
                        imgIdx = 0;
                        imgEl.src = displayImage;
                        imgEl.style.opacity = 1;
                    }, 200);
                });
            }
        });
    }

    // Check URL params for category
    // URL Params Logic
    const urlParams = new URLSearchParams(window.location.search);
    const catParam = urlParams.get('category');
    const subParam = urlParams.get('subcategory');
    const searchParam = urlParams.get('search'); // Capture search query

    let currentSubcategory = subParam || "";

    if (catParam) {
        categoryFilter.value = catParam;
    }

    if (currentSubcategory) {
        document.getElementById('subcatFilterDiv').style.display = 'block';
        document.getElementById('active-subcat').textContent = currentSubcategory;
    }

    if (searchParam) {
        searchInput.value = searchParam; // Pre-fill search input
    }

    // Filter Logic
    window.applyFilters = function () {
        let filtered = window.products || [];

        // Category
        const cat = categoryFilter.value;
        if (cat) {
            filtered = filtered.filter(p => p.category && p.category.toLowerCase() === cat.toLowerCase());
        }

        // Subcategory (Global variable logic)
        if (currentSubcategory) {
            // Ensure case insensitive and trimmed match
            filtered = filtered.filter(p => p.subcategory && p.subcategory.trim().toLowerCase() === currentSubcategory.trim().toLowerCase());
        }

        // Search
        const query = searchInput.value.toLowerCase();
        if (query) {
            filtered = filtered.filter(p =>
                (p.title && p.title.toLowerCase().includes(query)) ||
                (p.description && p.description.toLowerCase().includes(query))
            );
        }

        renderProducts(filtered);
    };

    window.clearSubcat = function () {
        currentSubcategory = "";
        document.getElementById('subcatFilterDiv').style.display = 'none';
        applyFilters();
        // Update URL strictly cosmetically or leave it? Ideally update:
        const url = new URL(window.location);
        url.searchParams.delete('subcategory');
        window.history.pushState({}, '', url);
    }

    // --- Admin Logic for Products Page ---
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = token && user.role === 'admin';

    // Expose admin functions globally if not already (website.js might load first, but let's be safe)
    if (!window.deleteProduct) {
        window.deleteProduct = async function (id) {
            if (!confirm('¿Eliminar producto?')) return;
            try {
                const response = await fetch(`http://localhost:3000/api/products/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) window.location.reload();
                else alert('Error al eliminar');
            } catch (error) {
                console.error(error);
            }
        };
    }

    if (!window.openProductModal) {
        // Rely on website.js or duplicate logic if website.js is not loaded here (it is)
        // But products.html loads website.js, so it should be fine.
    }
    // --- End Admin Logic ---

    // Initial Filter Apply
    window.applyFilters();
});

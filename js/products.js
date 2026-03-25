const API_URL = '/api/products';
const STATIC_URL = '';

document.addEventListener('DOMContentLoaded', async function () {
    const productsGrid = document.getElementById('productsGrid');
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const productsCount = document.getElementById('productsCount');

    // Admin state
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = token && user.role === 'admin';

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
                    discount_percentage: parseInt(p.discount_percentage) || 0,
                    image: img,
                    images: images
                };
            });

            // Filter for Clients: only show active products
            if (!isAdmin) {
                window.products = window.products.filter(p => p.is_active !== false);
            }

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
    // We don't call renderProducts directly here, applyFilters will be called at the end


    window.clearFilters = function () {
        // Fade out existing cards
        const cards = productsGrid.querySelectorAll('.reveal');
        cards.forEach(card => card.classList.add('fade-out'));

        setTimeout(() => {
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
        }, 300);
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

        items.forEach((product, index) => {
            const card = document.createElement('div');
            card.className = `group relative overflow-hidden rounded-lg border bg-background flex flex-col hover:shadow-lg transition-all cursor-pointer h-full reveal`;
            card.style.transitionDelay = `${(index % 12) * 50}ms`; // Staggered entrance

            card.onclick = (e) => {
                if (!e.target.closest('.card-btn-add, .btn-outline, .btn-ghost')) {
                    window.location.href = `product-detail.html?id=${product.id}`;
                }
            };

            const badgeHtml = product.badge ? `<div class="absolute top-2 right-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-sm z-10 shadow-sm">${product.badge}</div>` : '';
            const statusBadgeHtml = isAdmin ? `
                <div class="absolute z-20 px-2 py-1 rounded-br-lg shadow-sm text-[10px] font-bold text-white tracking-tight" 
                     style="top: 0; left: 0; background-color: ${product.is_active !== false ? '#22c55e' : '#ef4444'};">
                    ${product.is_active !== false ? 'ACTIVO' : 'INACTIVO'}
                </div>
            ` : '';

            // Image Logic
            const displayImage = (product.images && product.images.length > 0) ? product.images[0] : (product.image || 'image/placeholder.jpg');
            const displayImg = displayImage; // For consistency
            const imgId = `prod-img-${product.id}`;

            card.innerHTML = `
                <div class="relative w-full aspect-square bg-muted/30 overflow-hidden flex items-center justify-center">
                    <img id="${imgId}" src="${displayImage}" alt="${product.title || 'Producto'}" class="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal transition-all duration-500 group-hover:scale-105" onerror="this.src='https://placehold.co/300x300?text=No+Image'">
                    ${badgeHtml}
                    ${product.discount_percentage > 0 ? `<div class="absolute top-10 right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-sm z-10 shadow-sm">-${product.discount_percentage}%</div>` : ''}
                    ${statusBadgeHtml}
                </div>
                <div class="p-4 flex flex-col flex-1">
                    <p class="text-xs uppercase tracking-widest text-primary mb-1 font-semibold">${product.category}</p>
                    <h3 class="text-lg font-bold tracking-tight mb-2 line-clamp-1">${product.title}</h3>
                    <div class="mt-auto flex items-center justify-between pt-4 border-t">
                        <div class="flex flex-col">
                            ${product.discount_percentage > 0 ? `
                                <span style="text-decoration: line-through; color: #9ca3af; font-size: 0.85rem;">Gs. ${product.price.toLocaleString('es-PY')}</span>
                                <p class="text-lg font-bold text-primary">Gs. ${(product.price * (1 - product.discount_percentage / 100)).toLocaleString('es-PY')}</p>
                            ` : `
                                <p class="text-lg font-medium text-foreground">Gs. ${product.price.toLocaleString('es-PY')}</p>
                            `}
                        </div>
                        ${isAdmin ? `
                            <div class="flex gap-2">
                                <button class="btn btn-outline btn-sm px-2 py-1 h-8 text-xs product-edit-btn" data-product="${JSON.stringify(product).replace(/"/g, '&quot;')}">Editar</button>
                                <button class="btn btn-ghost btn-sm px-2 py-1 h-8 text-xs text-destructive hover:bg-destructive/10 product-delete-btn" data-id="${product.id}">Del</button>
                            </div>
                        ` : `
                            <button class="btn btn-default btn-sm card-btn-add flex items-center shadow-sm hover:shadow-md transition-all" data-id="${product.id}">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                                Añadir
                            </button>
                        `}
                    </div>
                </div>
            `;
            productsGrid.appendChild(card);

            // Add to Cart Logic
            const btn = card.querySelector('.card-btn-add');
            if (btn) {
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
            }

            // Hover Rotate Images
            const hasMultipleImages = product.images && product.images.length > 1;
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

            // Click Delegation for Edit/Delete
            card.addEventListener('click', (e) => {
                const target = e.target;
                if (target.classList.contains('product-edit-btn')) {
                    e.stopPropagation();
                    const productData = JSON.parse(target.getAttribute('data-product'));
                    if (typeof window.openProductModal === 'function') {
                        window.openProductModal(productData);
                    }
                } else if (target.classList.contains('product-delete-btn')) {
                    e.stopPropagation();
                    const id = target.getAttribute('data-id');
                    if (typeof window.deleteProduct === 'function') {
                        window.deleteProduct(id);
                    }
                }
            });
        });

        // Initialize reveal for new cards
        if (typeof applyReveal === 'function') {
            applyReveal(productsGrid.querySelectorAll('.reveal'));
        } else if (window.revealObserver) {
            productsGrid.querySelectorAll('.reveal').forEach(el => window.revealObserver.observe(el));
        }
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
        // Fade out existing cards
        const cards = productsGrid.querySelectorAll('.reveal');
        cards.forEach(card => card.classList.add('fade-out'));

        // Short delay to allow animation to start
        setTimeout(() => {
            let filtered = [...(window.products || [])];

            // Category
            const cat = categoryFilter.value;
            if (cat) {
                filtered = filtered.filter(p => p.category && p.category.toLowerCase() === cat.toLowerCase());
            }

            // Subcategory
            if (currentSubcategory) {
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

            // Price Range
            const priceRange = document.getElementById('priceRange');
            if (priceRange) {
                const maxPrice = Number(priceRange.value);
                filtered = filtered.filter(p => p.price <= maxPrice);
            }

            // Sort
            const sort = document.getElementById('sortFilter')?.value || 'newest';
            if (sort === 'price-asc') filtered.sort((a, b) => a.price - b.price);
            else if (sort === 'price-desc') filtered.sort((a, b) => b.price - a.price);
            else if (sort === 'name-asc') filtered.sort((a, b) => a.title.localeCompare(b.title));
            else if (sort === 'newest') filtered.sort((a, b) => b.id - a.id);

            renderProducts(filtered);
        }, 300);
    };

    // Event Listeners for Filters
    if (searchInput) {
        let timeout;
        searchInput.addEventListener('input', () => {
            clearTimeout(timeout);
            timeout = setTimeout(applyFilters, 500);
        });
    }

    if (categoryFilter) categoryFilter.addEventListener('change', applyFilters);
    
    const sortFilter = document.getElementById('sortFilter');
    if (sortFilter) sortFilter.addEventListener('change', applyFilters);

    const priceRange = document.getElementById('priceRange');
    const priceDisplay = document.getElementById('priceDisplay');
    if (priceRange) {
        // Initialize display
        if (priceDisplay) priceDisplay.textContent = `Gs. ${Number(priceRange.value).toLocaleString('es-PY')}`;

        priceRange.addEventListener('input', () => {
            if (priceDisplay) priceDisplay.textContent = `Gs. ${Number(priceRange.value).toLocaleString('es-PY')}`;
        });
        priceRange.addEventListener('change', applyFilters);
    }

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

    // Expose admin functions globally if not already (website.js might load first, but let's be safe)
    if (!window.deleteProduct) {
        window.deleteProduct = async function (id) {
            if (!confirm('¿Eliminar producto?')) return;
            try {
                const response = await fetch(`/api/products/${id}`, {
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

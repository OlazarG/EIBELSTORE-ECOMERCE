document.addEventListener('DOMContentLoaded', function () {
    // --- Variables ---
    let currentImageIndex = 0;
    const heroImagesData = [
        {
            main: "image/156c3183-d57e-4321-9a7d-4e5263f5e4c5.jpeg",
            secondary: "image/156c3183-d57e-4321-9a7d-4e5263f5e4c5 (1).jpeg"
        },
        {
            main: "image/bde6f323-dd11-468f-ac11-82cd4ae4a488.jpeg",
            secondary: "image/db13b532-77c8-4cdf-b828-e1d1e9a8138a.jpeg"
        }
    ];

    // --- Initialization ---
    initEvents();
    loadFeaturedProducts();
    initHeroCarousel();

    // Auto-rotate Hero
    setInterval(() => changeHeroImage(1), 5000);

    // --- Functions ---

    function initHeroCarousel() {
        const track = document.querySelector('.carousel-track');
        if (!track) return;

        // Clear track
        track.innerHTML = '';

        heroImagesData.forEach(imgData => {
            const slide = document.createElement('div');
            slide.className = 'carousel-slide';
            slide.innerHTML = `<img src="${imgData.main}" alt="Hero Image">`;
            track.appendChild(slide);
        });
    }

    function initEvents() {
        // Mobile Menu
        const menuToggle = document.querySelector('.menu-toggle');
        const sidebar = document.querySelector('.sidebar');

        if (menuToggle && sidebar) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
                sidebar.classList.toggle('hidden');

                if (sidebar.classList.contains('hidden')) {
                    menuToggle.innerHTML = '☰';
                } else {
                    menuToggle.innerHTML = '✕';
                }
            });
        }

        // Hero Navigation
        const prevBtn = document.querySelector('.nav-arrow.prev');
        const nextBtn = document.querySelector('.nav-arrow.next');

        if (prevBtn) prevBtn.addEventListener('click', () => changeHeroImage(-1));
        if (nextBtn) nextBtn.addEventListener('click', () => changeHeroImage(1));

        // Shop Button
        const shopBtn = document.querySelector('.shop-button');
        if (shopBtn) {
            shopBtn.addEventListener('click', () => {
                window.location.href = 'products.html';
            });
        }
    }

    function changeHeroImage(direction) {
        const track = document.querySelector('.carousel-track');
        if (!track) return;

        currentImageIndex = (currentImageIndex + direction + heroImagesData.length) % heroImagesData.length;

        // Slide Track
        track.style.transform = `translateX(-${currentImageIndex * 100}%)`;

        // Also update secondary image for sync (optional, keeping design consistency)
        const secContainer = document.querySelector('.hero-image.secondary .product-placeholder');
        if (secContainer && heroImagesData[currentImageIndex].secondary) {
            secContainer.innerHTML = `<img src="${heroImagesData[currentImageIndex].secondary}" style="width:100%; height:100%; object-fit:cover; border-radius:inherit;">`;
        }
    }

    async function loadFeaturedProducts() {
        const productsGrid = document.querySelector('.products-grid');
        if (!productsGrid) return;

        const API_URL = 'http://localhost:3000/api/products';
        const STATIC_URL = 'http://localhost:3000';

        let products = [];

        try {
            const res = await fetch(API_URL);
            if (res.ok) {
                const apiProducts = await res.json();

                // Process Products (Image paths & Types)
                products = apiProducts.map(p => {
                    // Normalize Images
                    let mainImg = p.image_url || p.image;
                    if (mainImg && mainImg.startsWith('/uploads')) {
                        mainImg = STATIC_URL + mainImg;
                    }

                    // Normalize Gallery
                    let images = [];
                    if (p.gallery_urls) {
                        try {
                            const parsed = typeof p.gallery_urls === 'string' ? JSON.parse(p.gallery_urls) : p.gallery_urls;
                            images = Array.isArray(parsed) ? parsed : [];
                        } catch (e) { images = []; }
                    }

                    // Add URL prefix to gallery items
                    images = images.map(img => img.startsWith('/uploads') ? STATIC_URL + img : img);

                    // Ensure Main Image is first in array for logic consistency
                    if (images.length === 0 && mainImg) images = [mainImg];
                    else if (mainImg && !images.includes(mainImg)) images.unshift(mainImg);

                    return {
                        ...p,
                        id: p.id,
                        price: Number(p.price),
                        image: mainImg,
                        images: images
                    };
                });
            } else {
                console.warn('API error, falling back to static');
                products = window.products || [];
            }
        } catch (err) {
            console.warn('Fetch error, falling back to static', err);
            products = window.products || [];
        }

        productsGrid.innerHTML = '';

        // Show first 8 products (recent ones likely at end of DB, so maybe reverse?)
        // Let's just take the last 8 to show "Newest" or just the first 8. 
        // User asked "products added appear", so usually they appear at the end.
        // Let's reverse to show newest first if they are ID sorted.
        const featured = products.length > 0 ? products.slice(-8).reverse() : [];

        featured.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';

            // Navigate to detail on card click (except button)
            card.onclick = (e) => {
                if (!e.target.closest('.card-btn-add')) {
                    window.location.href = `product-detail.html?id=${product.id}`;
                }
            };

            const badgeHtml = product.badge ? `<div class="product-badge">${product.badge}</div>` : '';

            // Image Logic
            const hasMultipleImages = product.images && product.images.length > 1;
            const displayImage = product.image || 'https://placehold.co/300x300?text=No+Image';
            const imgId = `prod-img-${product.id}`;

            card.innerHTML = `
                <div class="product-image">
                    <img id="${imgId}" src="${displayImage}" alt="${product.title}" style="width: 100%; height: 100%; object-fit: contain; transition: opacity 0.5s ease;">
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
                Cart.addItem(product);
                btn.textContent = "¡Añadido!";
                btn.classList.add('added');
                setTimeout(() => {
                    btn.textContent = "Añadir al Carrito";
                    btn.classList.remove('added');
                }, 2000);
            };

            // Hover Rotate Images
            if (hasMultipleImages) {
                let intervalId = null;
                let imgIdx = 0;
                const imgEl = document.getElementById(imgId);

                card.addEventListener('mouseenter', () => {
                    if (intervalId) return; // Prevent multiple intervals

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

    // Expose for HTML OnClick
    window.toggleSubmenu = function (e, id) {
        e.preventDefault();
        const sub = document.getElementById('sub-' + id);
        const parent = sub.parentElement;
        if (sub) {
            sub.classList.toggle('active');
            parent.classList.toggle('open');
        }
    };

    // --- Admin Logic ---
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = token && user.role === 'admin';

    if (isAdmin) {
        renderAdminSidebar();
    }

    function renderAdminSidebar() {
        const sidebarMenu = document.querySelector('.sidebar-menu');
        if (!sidebarMenu) return;

        const adminSection = document.createElement('div');
        adminSection.innerHTML = `
            <h3>ADMINISTRACIÓN</h3>
            <ul class="category-links">
                <li><a href="products.html" class="active" style="background: var(--primary-red-dark); color: white; border-color: var(--primary-red);">Inventario</a></li>
                <li><a href="#" onclick="openProductModal(null); return false;">+ Nuevo Producto</a></li>
                <li><a href="#" onclick="logout(); return false;">Cerrar Sesión</a></li>
            </ul>
        `;
        sidebarMenu.insertBefore(adminSection, sidebarMenu.firstChild);
    }

    window.logout = function () {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload();
    };

    // Global file tracking
    let selectedFiles = [];

    window.openProductModal = function (product) {
        const modal = document.getElementById('productModal');
        const title = document.getElementById('modalTitle');
        const form = document.getElementById('productForm');

        // Reset files
        selectedFiles = [];
        updateImagePreviews();

        if (product) {
            title.textContent = 'Editar Producto';
            document.getElementById('productId').value = product.id;
            document.getElementById('title').value = product.title;
            document.getElementById('category').value = product.category;
            document.getElementById('price').value = product.price;
            document.getElementById('description').value = product.description || '';
            document.getElementById('badge').value = product.badge || '';
            if (document.getElementById('stock')) document.getElementById('stock').value = product.stock || 0;
            if (document.getElementById('subcategory')) document.getElementById('subcategory').value = product.subcategory || '';

            // Show existing images (read-only for now, or could implement delete for existing)
            // For simplicity, we just show them. To delete existing, we'd need backend support to remove specific URLs.
            // Let's focus on NEW files for now as requested "que se agregan".
        } else {
            title.textContent = 'Nuevo Producto';
            form.reset();
            document.getElementById('productId').value = '';
        }

        // Setup File Input Listener
        const fileInput = form.querySelector('input[type="file"]');
        // Remove old listener to avoid duplicates if any (cloning node is a trick, or just re-assign)
        const newFileInput = fileInput.cloneNode(true);
        fileInput.parentNode.replaceChild(newFileInput, fileInput);

        newFileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            selectedFiles = [...selectedFiles, ...files];
            updateImagePreviews();
            // Clear input so same file can be selected again if needed (though we track in array)
            newFileInput.value = '';
        });

        modal.style.display = 'flex';
    };

    function updateImagePreviews() {
        const container = document.getElementById('imagePreviews');
        if (!container) return; // Needs to be added to HTML

        container.innerHTML = '';
        selectedFiles.forEach((file, index) => {
            const div = document.createElement('div');
            div.className = 'preview-item';
            div.style.cssText = 'position: relative; display: inline-block; margin: 5px;';

            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.style.cssText = 'width: 80px; height: 80px; object-fit: cover; border-radius: 4px; border: 1px solid #555;';

            const btn = document.createElement('button');
            btn.innerHTML = '×';
            btn.style.cssText = 'position: absolute; top: -5px; right: -5px; background: red; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; font-size: 12px; line-height: 1;';
            btn.onclick = (e) => {
                e.preventDefault(); // Prevent form submit
                selectedFiles.splice(index, 1);
                updateImagePreviews();
            };

            div.appendChild(img);
            div.appendChild(btn);
            container.appendChild(div);
        });
    }

    window.closeModal = function () {
        document.getElementById('productModal').style.display = 'none';
        selectedFiles = []; // Clear on close
    };

    window.handleFormSubmit = async function (e) {
        e.preventDefault();
        const id = document.getElementById('productId').value;
        const formData = new FormData(e.target);
        if (!id) formData.delete('id');

        // Append tracked files
        // First, remove any 'images' from the input (since we cleared it or it might have partials)
        formData.delete('images');
        selectedFiles.forEach(file => {
            formData.append('images', file);
        });

        const method = id ? 'PUT' : 'POST';
        const url = id ? `http://localhost:3000/api/products/${id}` : 'http://localhost:3000/api/products';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (response.ok) {
                closeModal();
                window.location.reload();
            } else {
                alert('Error al guardar');
            }
        } catch (error) {
            console.error(error);
            alert('Error de conexión');
        }
    };

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

    // --- End Admin Logic ---

    // Sidebar Search Logic
    const searchSubmit = document.querySelector('.search-submit');
    const searchInput = document.querySelector('.search-input');

    if (searchSubmit && searchInput) {
        searchSubmit.addEventListener('click', () => {
            const query = searchInput.value;
            if (query) {
                window.location.href = `products.html?search=${encodeURIComponent(query)}`;
            }
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value;
                if (query) {
                    window.location.href = `products.html?search=${encodeURIComponent(query)}`;
                }
            }
        });
    }
});

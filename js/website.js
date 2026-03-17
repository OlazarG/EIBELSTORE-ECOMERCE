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

    // --- Admin state ---
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = token && user.role === 'admin';

    // --- Initialization ---
    initEvents();
    loadFeaturedProducts();
    initHeroCarousel();
    initRevealOnScroll();
    applyReveal(document.querySelectorAll('.reveal'));

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

    // Scroll Reveal Logic
    function initRevealOnScroll() {
        const observerOptions = {
            threshold: 0.01,
            rootMargin: '0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                } else {
                    entry.target.classList.remove('active');
                }
            });
        }, observerOptions);

        window.revealObserver = observer;
    }

    function applyReveal(elements) {
        if (!window.revealObserver) return;
        elements.forEach(el => window.revealObserver.observe(el));
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
                        discount_percentage: parseInt(p.discount_percentage) || 0,
                        image: mainImg,
                        images: images
                    };
                });

                // Filter for Clients: only show active products
                if (!isAdmin) {
                    products = products.filter(p => p.is_active !== false);
                }
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

        featured.forEach((product, index) => {
            const card = document.createElement('div');
            card.className = `group relative overflow-hidden rounded-lg border bg-background flex flex-col hover:shadow-lg transition-all cursor-pointer h-full reveal`;
            card.style.transitionDelay = `${index * 80}ms`;

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
            const hasMultipleImages = product.images && product.images.length > 1;
            const displayImage = product.image || 'https://placehold.co/300x300?text=No+Image';
            const imgId = `prod-img-${product.id}`;

            card.innerHTML = `
                <div class="relative w-full aspect-square bg-muted/30 overflow-hidden flex items-center justify-center">
                    <img id="${imgId}" src="${displayImage}" alt="${product.title}" class="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal transition-all duration-500 group-hover:scale-105" onerror="this.src='https://placehold.co/300x300?text=No+Image'">
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
                                <button class="btn btn-outline btn-sm px-2 py-1 h-8 text-xs" onclick="event.stopPropagation(); openProductModal(${JSON.stringify(product).replace(/"/g, '&quot;')})">Editar</button>
                                <button class="btn btn-ghost btn-sm px-2 py-1 h-8 text-xs text-destructive hover:bg-destructive/10" onclick="event.stopPropagation(); deleteProduct(${product.id})">Del</button>
                            </div>
                        ` : `
                            <button class="btn btn-default btn-sm card-btn-add flex items-center shadow-sm hover:shadow-md transition-all bg-black text-white hover:bg-neutral-800" data-id="${product.id}">
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
                    Cart.addItem(product);
                    btn.textContent = "¡Añadido!";
                    btn.classList.add('added');
                    setTimeout(() => {
                        btn.textContent = "Añadir al Carrito";
                        btn.classList.remove('added');
                    }, 2000);
                };
            }

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
                    imgEl.style.opacity = 0;
                    setTimeout(() => {
                        imgIdx = 0;
                        imgEl.src = displayImage;
                        imgEl.style.opacity = 1;
                    }, 200);
                });
            }
        });

        // Initialize reveal for new cards
        applyReveal(productsGrid.querySelectorAll('.reveal'));
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

    if (isAdmin) {
        renderAdminSidebar();
    }

    function renderAdminSidebar() {
        // 1. Update Sidebar
        const sidebarMenu = document.querySelector('.sidebar-menu');
        if (sidebarMenu) {
            const adminSection = document.createElement('div');
            adminSection.className = "mb-6 pb-6 border-b border-border";
            adminSection.innerHTML = `
                <h3 class="text-sm font-bold tracking-tight uppercase text-primary mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-settings"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                    PANEL ADMIN
                </h3>
                <ul class="space-y-2">
                    <li><a href="products.html" class="flex w-full items-center rounded-md px-3 py-2 text-sm font-semibold bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors">📦 Inventario Completo</a></li>
                    <li><button onclick="openProductModal(null); return false;" class="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors text-left">➕ Nuevo Producto</button></li>
                    <li><button onclick="logout(); return false;" class="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors text-left mt-2">🚪 Cerrar Sesión</button></li>
                </ul>
            `;
            sidebarMenu.insertBefore(adminSection, sidebarMenu.firstChild);
        }

        // 2. Update Header Login Icon to show Admin state
        const loginBtn = document.querySelector('a[href*="login.html"]');
        if (loginBtn) {
            loginBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-settings"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                <span class="hidden sm:inline-block font-bold">Admin</span>
            `;
            // Change style to highlight it
            loginBtn.className = "btn btn-outline btn-sm gap-2 border-primary text-primary hover:bg-primary/10 ml-2";
            loginBtn.href = "products.html"; // Make it go to the inventory
            loginBtn.title = "Panel de Control";
        }
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
            if (document.getElementById('discount_percentage')) {
                document.getElementById('discount_percentage').value = product.discount_percentage || 0;
            }
            if (document.getElementById('stock')) document.getElementById('stock').value = product.stock || 0;
            if (document.getElementById('subcategory')) document.getElementById('subcategory').value = product.subcategory || '';
            if (document.getElementById('is_active')) document.getElementById('is_active').checked = product.is_active !== false;

            // Show existing images (read-only for now, or could implement delete for existing)
            // For simplicity, we just show them. To delete existing, we'd need backend support to remove specific URLs.
            // Let's focus on NEW files for now as requested "que se agregan".
        } else {
            title.textContent = 'Nuevo Producto';
            form.reset();
            document.getElementById('productId').value = '';
            if (document.getElementById('is_active')) document.getElementById('is_active').checked = true;
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

        // Ensure we get the ID correctly from the hidden input field
        const idInput = document.getElementById('productId');
        const id = idInput ? idInput.value : '';

        const formData = new FormData(e.target);
        if (!id) formData.delete('id'); // Remove empty ID field if creating

        // Process tracked images
        formData.delete('images');
        selectedFiles.forEach(file => {
            formData.append('images', file);
        });

        // Ensure is_active is sent
        const activeCheck = document.getElementById('is_active');
        if (activeCheck) {
            formData.set('is_active', activeCheck.checked);
        }

        // Determine method and URL based on presence of a valid ID
        const method = id ? 'PUT' : 'POST';
        const url = id ? `http://localhost:3000/api/products/${id}` : 'http://localhost:3000/api/products';

        console.log(`Submitting form to ${url} via ${method} with ID: ${id || 'NEW'}`);

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

document.addEventListener('DOMContentLoaded', function () {
    const productsGrid = document.getElementById('productsGrid');
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const productsCount = document.getElementById('productsCount');

    // Initial Load
    renderProducts(window.products);

    // Filter Logic
    window.applyFilters = function () {
        let filtered = window.products;

        // Category
        const cat = categoryFilter.value;
        if (cat) {
            filtered = filtered.filter(p => p.category.toLowerCase() === cat.toLowerCase());
        }

        // Search
        const query = searchInput.value.toLowerCase();
        if (query) {
            filtered = filtered.filter(p =>
                p.title.toLowerCase().includes(query) ||
                p.description.toLowerCase().includes(query)
            );
        }

        renderProducts(filtered);
    };

    window.clearFilters = function () {
        categoryFilter.value = "";
        searchInput.value = "";
        renderProducts(window.products);
    };

    function renderProducts(items) {
        if (!productsGrid) return;
        productsGrid.innerHTML = '';

        if (items.length === 0) {
            productsGrid.innerHTML = '<div class="no-products">No se encontraron joyas que coincidan.</div>';
            productsCount.textContent = 'Mostrando 0 productos';
            return;
        }

        productsCount.textContent = `Mostrando ${items.length} productos`;

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
            const displayImage = (product.images && product.images.length > 0) ? product.images[0] : product.image;
            const imgId = `prod-img-${product.id}`;

            card.innerHTML = `
                <div class="product-image">
                    <img id="${imgId}" src="${displayImage}" alt="${product.title}" style="width: 100%; height: 100%; object-fit: contain; transition: opacity 0.5s ease;">
                    ${badgeHtml}
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.title}</h3>
                    <p class="product-category">${product.category}</p>
                    <p class="product-price">$${product.price.toLocaleString()}</p>
                    <div class="product-actions">
                        <button class="card-btn-add" data-id="${product.id}">Añadir al Carrito</button>
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
    const urlParams = new URLSearchParams(window.location.search);
    const cat = urlParams.get('category');
    if (cat) {
        categoryFilter.value = cat;
        window.applyFilters();
    }
});

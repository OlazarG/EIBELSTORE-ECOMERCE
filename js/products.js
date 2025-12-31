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
            card.onclick = () => {
                window.location.href = `product-detail.html?id=${product.id}`;
            };

            const badgeHtml = product.badge ? `<div class="product-badge">${product.badge}</div>` : '';

            card.innerHTML = `
                <div class="product-image">
                    <img src="${product.image}" alt="${product.title}" style="width: 100%; height: 100%; object-fit: contain;">
                    ${badgeHtml}
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.title}</h3>
                    <p class="product-category">${product.category}</p>
                    <p class="product-price">$${product.price.toLocaleString()}</p>
                </div>
            `;
            productsGrid.appendChild(card);
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

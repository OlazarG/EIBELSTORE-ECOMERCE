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
    // Load initial images immediately
    changeHeroImage(0);
    // Auto-rotate Hero
    setInterval(() => changeHeroImage(1), 5000);

    // --- Functions ---

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
        currentImageIndex = (currentImageIndex + direction + heroImagesData.length) % heroImagesData.length;

        const mainContainer = document.querySelector('.hero-image.main-image .product-placeholder');
        const secContainer = document.querySelector('.hero-image.secondary .product-placeholder');

        if (mainContainer && secContainer) {
            // Apply OUT animation
            mainContainer.classList.remove('hero-image-animate-in');
            mainContainer.classList.add('hero-image-animate-out');

            secContainer.classList.remove('hero-image-animate-in');
            secContainer.classList.add('hero-image-animate-out');

            setTimeout(() => {
                // Update Content
                mainContainer.innerHTML = `<img src="${heroImagesData[currentImageIndex].main}" style="width:100%; height:100%; object-fit:cover; border-radius:inherit;">`;
                secContainer.innerHTML = `<img src="${heroImagesData[currentImageIndex].secondary}" style="width:100%; height:100%; object-fit:cover; border-radius:inherit;">`;

                // Apply IN animation
                mainContainer.classList.remove('hero-image-animate-out');
                mainContainer.classList.add('hero-image-animate-in');

                secContainer.classList.remove('hero-image-animate-out');
                secContainer.classList.add('hero-image-animate-in');
            }, 600); // 600ms overlap for smooth transition (animation is 800ms)
        }
    }

    function loadFeaturedProducts() {
        const productsGrid = document.querySelector('.products-grid');
        if (!productsGrid || !window.products) return;

        productsGrid.innerHTML = '';

        // Show first 4 products as featured
        const featured = window.products.slice(0, 6);

        featured.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.onclick = () => {
                window.location.href = `product-detail.html?id=${product.id}`;
            };

            const badgeHtml = product.badge ? `<div class="product-badge">${product.badge}</div>` : '';

            // Use array of images if available, else single image
            const displayImage = (product.images && product.images.length > 0) ? product.images[0] : product.image;

            card.innerHTML = `
                <div class="product-image">
                    <img src="${displayImage}" alt="${product.title}" style="width: 100%; height: 100%; object-fit: contain;">
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
});

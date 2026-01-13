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

    function loadFeaturedProducts() {
        const productsGrid = document.querySelector('.products-grid');
        if (!productsGrid || !window.products) return;

        productsGrid.innerHTML = '';

        // Show first 4 products as featured
        const featured = window.products.slice(0, 6);

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
});

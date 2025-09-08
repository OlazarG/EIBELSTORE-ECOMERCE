// ====================================================
// RETRO WEBSITE - FUNCIONALIDAD INTERACTIVA
// ====================================================

document.addEventListener('DOMContentLoaded', function() {
    // Variables globales
    let currentImageIndex = 0;
    let cartCount = 0;

    // Inicialización
    initializeEventListeners();
    initializeProductCarousel();
    loadFeaturedProducts();

    // Event Listeners
    function initializeEventListeners() {
        // Toggle menu móvil - funcionalidad para ocultar/mostrar sidebar
        const menuToggle = document.querySelector('.menu-toggle');
        const sidebar = document.querySelector('.sidebar');
        const contentArea = document.querySelector('.content-area');
        
        if (menuToggle && sidebar && contentArea) {
            menuToggle.addEventListener('click', function() {
                sidebar.classList.toggle('hidden');
                contentArea.classList.toggle('sidebar-hidden');
                
                // Cambiar icono del botón
                if (sidebar.classList.contains('hidden')) {
                    menuToggle.innerHTML = '→';
                    menuToggle.style.transform = 'rotate(0deg)';
                } else {
                    menuToggle.innerHTML = '☰';
                    menuToggle.style.transform = 'rotate(0deg)';
                }
            });
        }

        // Navegación del carousel
        const prevBtn = document.querySelector('.nav-arrow.prev');
        const nextBtn = document.querySelector('.nav-arrow.next');
        
        if (prevBtn) prevBtn.addEventListener('click', () => changeHeroImage(-1));
        if (nextBtn) nextBtn.addEventListener('click', () => changeHeroImage(1));

        // Botón Go To Shop
        const shopButton = document.querySelector('.shop-button');
        if (shopButton) {
            shopButton.addEventListener('click', function() {
                document.querySelector('.featured-section').scrollIntoView({
                    behavior: 'smooth'
                });
            });
        }

        // Botones de categoría
        const categoryLinks = document.querySelectorAll('.category-links a');
        categoryLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Remover active de otros links
                categoryLinks.forEach(l => l.classList.remove('active'));
                
                // Agregar active al link clickeado
                this.classList.add('active');
                
                // Filtrar productos por categoría
                filterProductsByCategory(this.getAttribute('href').substring(1));
            });
        });

        // Búsqueda
        const searchInput = document.querySelector('.search-input');
        const searchSubmit = document.querySelector('.search-submit');
        
        if (searchSubmit) {
            searchSubmit.addEventListener('click', function() {
                const query = searchInput.value.trim();
                if (query) {
                    searchProducts(query);
                }
            });
        }

        if (searchInput) {
            searchInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    const query = this.value.trim();
                    if (query) {
                        searchProducts(query);
                    }
                }
            });
        }
    }

    // Carousel de imágenes del hero
    function initializeProductCarousel() {
        const heroImages = [
            {
                main: 'Retro Gaming Console',
                secondary: 'Pixel Art T-Shirt'
            },
            {
                main: 'Arcade Joystick Pro',
                secondary: 'Neon Hoodie'
            },
            {
                main: 'Vintage Headphones',
                secondary: 'LED Backpack'
            }
        ];

        window.heroImages = heroImages;
    }

    function changeHeroImage(direction) {
        const heroImages = window.heroImages;
        currentImageIndex = (currentImageIndex + direction + heroImages.length) % heroImages.length;
        
        const mainImage = document.querySelector('.hero-image.main-image .product-placeholder');
        const secondaryImage = document.querySelector('.hero-image.secondary .product-placeholder');
        
        if (mainImage && secondaryImage) {
            // Animación de fade
            mainImage.style.opacity = '0';
            secondaryImage.style.opacity = '0';
            
            setTimeout(() => {
                mainImage.textContent = heroImages[currentImageIndex].main;
                secondaryImage.textContent = heroImages[currentImageIndex].secondary;
                mainImage.style.opacity = '1';
                secondaryImage.style.opacity = '1';
            }, 200);
        }
    }

    // Cargar productos destacados
    function loadFeaturedProducts() {
        const products = [
            {
                id: 1,
                title: 'Retro Console Mini',
                category: 'Gaming',
                price: 299.99,
                badge: 'NEW',
                image: 'Retro Console'
            },
            {
                id: 2,
                title: '8-Bit Hoodie',
                category: 'Clothing',
                price: 89.99,
                badge: 'SALE',
                image: 'Pixel Art Hoodie'
            },
            {
                id: 3,
                title: 'Pixel Backpack',
                category: 'Accessories',
                price: 59.99,
                badge: '',
                image: 'Retro Backpack'
            },
            {
                id: 4,
                title: 'Gaming Guide Book',
                category: 'Books',
                price: 24.99,
                badge: '',
                image: 'Gaming Guide'
            },
            {
                id: 5,
                title: '8-Bit Sneakers',
                category: 'Footwear',
                price: 149.99,
                badge: 'HOT',
                image: 'Pixel Sneakers'
            },
            {
                id: 6,
                title: 'Digital Watch',
                category: 'Accessories',
                price: 79.99,
                badge: '',
                image: 'Retro Watch'
            },
            {
                id: 7,
                title: 'Neon T-Shirt',
                category: 'Clothing',
                price: 49.99,
                badge: 'NEW',
                image: 'Neon Shirt'
            },
            {
                id: 8,
                title: 'Arcade Joystick',
                category: 'Gaming',
                price: 129.99,
                badge: '',
                image: 'Gaming Controller'
            }
        ];

        window.allProducts = products;
        displayProducts(products);
    }

    function displayProducts(products) {
        const productsGrid = document.querySelector('.products-grid');
        if (!productsGrid) return;

        productsGrid.innerHTML = '';

        products.forEach(product => {
            const productCard = createProductCard(product);
            productsGrid.appendChild(productCard);
        });
    }

    function createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-image">
                <div class="product-placeholder">${product.image}</div>
                ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.title}</h3>
                <p class="product-category">${product.category}</p>
                <p class="product-price">$${product.price}</p>
            </div>
        `;

        // Agregar evento click para agregar al carrito
        card.addEventListener('click', function() {
            addToCart(product);
        });

        return card;
    }

    function addToCart(product) {
        cartCount++;
        updateCartDisplay();
        showNotification(`${product.title} agregado al carrito`);
    }

    function updateCartDisplay() {
        const cartCountElement = document.querySelector('.cart-count');
        if (cartCountElement) {
            cartCountElement.textContent = cartCount;
        }
    }

    function showNotification(message) {
        // Crear notificación temporal
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: #333;
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            z-index: 10000;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Mostrar notificación
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Ocultar después de 3 segundos
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    function filterProductsByCategory(category) {
        const allProducts = window.allProducts;
        if (!allProducts) return;

        let filteredProducts;
        
        if (category === 'men' || category === 'women' || category === 'kids') {
            // Simular filtrado por demografía
            filteredProducts = allProducts.filter((product, index) => {
                if (category === 'men') return index % 3 === 0;
                if (category === 'women') return index % 3 === 1;
                if (category === 'kids') return index % 3 === 2;
            });
        } else {
            filteredProducts = allProducts;
        }

        displayProducts(filteredProducts);
    }

    function searchProducts(query) {
        const allProducts = window.allProducts;
        if (!allProducts) return;

        const filteredProducts = allProducts.filter(product =>
            product.title.toLowerCase().includes(query.toLowerCase()) ||
            product.category.toLowerCase().includes(query.toLowerCase())
        );

        displayProducts(filteredProducts);
        
        if (filteredProducts.length === 0) {
            showNotification(`No se encontraron productos para "${query}"`);
        } else {
            showNotification(`${filteredProducts.length} productos encontrados`);
        }
    }

    // Auto-cambio de imágenes del carousel
    setInterval(() => {
        changeHeroImage(1);
    }, 5000);

    // Scroll suave para navegación
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});
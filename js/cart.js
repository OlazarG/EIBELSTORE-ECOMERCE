// Cart Logic
const Cart = {
    items: [],
    isOpen: false,

    init() {
        // Load from LocalStorage
        const savedCart = localStorage.getItem('retroCart');
        if (savedCart) {
            this.items = JSON.parse(savedCart);
        }

        // Render initial state
        this.renderCartCount();
        this.renderCartItems();

        // Event Listeners for UI
        this.setupEventListeners();
    },

    setupEventListeners() {
        // Cart Toggle Button (in Header)
        const cartBtns = document.querySelectorAll('.cart-btn');
        cartBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleCart();
            });
        });

        // Close Button in Drawer
        document.addEventListener('click', (e) => {
            if (e.target.matches('.cart-close') || e.target.matches('.cart-overlay')) {
                this.closeCart();
            }
        });

        // Remove Item
        document.addEventListener('click', (e) => {
            if (e.target.matches('.remove-item')) {
                const id = parseInt(e.target.dataset.id);
                this.removeItem(id);
            }
        });
    },

    addItem(product) {
        // Check if exists
        const existing = this.items.find(item => item.id === product.id);
        if (existing) {
            existing.quantity++;
        } else {
            this.items.push({
                ...product,
                quantity: 1
            });
        }

        this.save();
        this.renderCartCount();
        this.renderCartItems();
        this.openCart(); // Open drawer on add
    },

    removeItem(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.save();
        this.renderCartCount();
        this.renderCartItems();
    },

    save() {
        localStorage.setItem('retroCart', JSON.stringify(this.items));
    },

    toggleCart() {
        this.isOpen = !this.isOpen;
        this.updateDrawerState();
    },

    openCart() {
        this.isOpen = true;
        this.updateDrawerState();
    },

    closeCart() {
        this.isOpen = false;
        this.updateDrawerState();
    },

    updateDrawerState() {
        const drawer = document.querySelector('.cart-drawer');
        const overlay = document.querySelector('.cart-overlay');
        if (drawer && overlay) {
            if (this.isOpen) {
                drawer.classList.add('active');
                overlay.classList.add('active');
            } else {
                drawer.classList.remove('active');
                overlay.classList.remove('active');
            }
        }
    },

    renderCartCount() {
        const count = this.items.reduce((sum, item) => sum + item.quantity, 0);
        document.querySelectorAll('.cart-count').forEach(el => {
            el.textContent = count;
        });
    },

    renderCartItems() {
        const container = document.querySelector('.cart-items');
        const totalEl = document.querySelector('.cart-total-price');

        if (!container) return;

        container.innerHTML = '';
        let total = 0;

        if (this.items.length === 0) {
            container.innerHTML = '<div class="cart-empty">Tu carrito está vacío</div>';
        } else {
            this.items.forEach(item => {
                total += item.price * item.quantity;
                const itemEl = document.createElement('div');
                itemEl.className = 'cart-item';
                itemEl.innerHTML = `
                    <div class="cart-item-img">
                        <img src="${item.image}" alt="${item.title}">
                    </div>
                    <div class="cart-item-info">
                        <h4>${item.title}</h4>
                        <p>${item.quantity} x $${item.price.toLocaleString()}</p>
                    </div>
                    <button class="remove-item" data-id="${item.id}">×</button>
                `;
                container.appendChild(itemEl);
            });
        }

        if (totalEl) {
            totalEl.textContent = `$${total.toLocaleString()}`;
        }
    }
};

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => {
    // Inject Cart HTML if not present
    if (!document.querySelector('.cart-drawer')) {
        const cartHTML = `
            <div class="cart-overlay"></div>
            <div class="cart-drawer">
                <div class="cart-header">
                    <h3>Tu Carrito</h3>
                    <button class="cart-close">×</button>
                </div>
                <div class="cart-items">
                    <!-- Items injected here -->
                </div>
                <div class="cart-footer">
                    <div class="cart-total">
                        <span>Total:</span>
                        <span class="cart-total-price">$0</span>
                    </div>
                    <button class="btn checkout-btn">Finalizar Compra</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', cartHTML);
    }

    Cart.init();
});

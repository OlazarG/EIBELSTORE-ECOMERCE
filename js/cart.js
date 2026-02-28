// Cart Logic
const Cart = {
    whatsappNumber: '595981000000', // Reemplazar con el número del negocio
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

        // Checkout Button (Dynamic)
        document.addEventListener('click', (e) => {
            if (e.target.matches('.checkout-btn')) {
                this.openCheckout();
            }
        });

        // Checkout Modal Events
        const checkoutForm = document.getElementById('checkout-form');
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', (e) => this.submitOrder(e));
        }

        const closeCheckout = document.getElementById('close-checkout');
        if (closeCheckout) {
            closeCheckout.addEventListener('click', () => this.closeCheckout());
        }

        const checkoutOverlay = document.getElementById('checkout-overlay');
        if (checkoutOverlay) {
            checkoutOverlay.addEventListener('click', () => this.closeCheckout());
        }
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

    openCheckout() {
        this.closeCart();
        const modal = document.getElementById('checkout-modal');
        const overlay = document.getElementById('checkout-overlay');
        if (modal && overlay) {
            modal.classList.add('active');
            overlay.classList.add('active');
        }
    },

    closeCheckout() {
        const modal = document.getElementById('checkout-modal');
        const overlay = document.getElementById('checkout-overlay');
        if (modal && overlay) {
            modal.classList.remove('active');
            overlay.classList.remove('active');
        }
    },

    submitOrder(e) {
        e.preventDefault();

        if (this.items.length === 0) {
            alert('Tu carrito está vacío 🛒');
            return;
        }

        const name = document.getElementById('customer-name').value;
        const address = document.getElementById('customer-address').value;
        const payment = document.getElementById('payment-method').value;

        if (!name || !address) {
            alert('Por favor completa los campos requeridos');
            return;
        }

        // WhatsApp Format
        let message = `*HOLA VIDALAB! NUEVO PEDIDO WEB* 🛒\n\n`;
        message += `👤 *Cliente:* ${name}\n`;
        message += `📍 *Dirección:* ${address}\n`;
        message += `💳 *Pago:* ${payment}\n`;
        message += `----------------------------\n`;
        message += `*DETALLE:*\n\n`;

        let total = 0;
        this.items.forEach(item => {
            const subtotal = item.price * item.quantity;
            total += subtotal;
            message += `▪️ ${item.title} (x${item.quantity})\n`;
            message += `   └─ ${subtotal.toLocaleString('es-PY')} Gs.\n`;
        });

        message += `\n----------------------------\n`;
        message += `💰 *TOTAL A PAGAR: ${total.toLocaleString('es-PY')} Gs.*\n`;
        message += `----------------------------\n`;
        message += `(El costo de envío y ubicación se coordinarán en el chat).`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${this.whatsappNumber}?text=${encodedMessage}`;

        window.open(whatsappUrl, '_blank');

        // Optional: Clear cart after successful order? 
        // Typically yes, but maybe user wants to keep it if they come back. 
        // I'll leave it for now or maybe clear it. 
        // Prompt didn't specify clearing cart. I will clear it to be nice.
        this.items = [];
        this.save();
        this.renderCartItems();
        this.renderCartCount();
        this.closeCheckout();
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
                overlay.classList.remove('opacity-0', 'pointer-events-none');
                overlay.classList.add('opacity-100', 'pointer-events-auto');
                drawer.classList.remove('translate-x-full');
                drawer.classList.add('translate-x-0');
            } else {
                overlay.classList.add('opacity-0', 'pointer-events-none');
                overlay.classList.remove('opacity-100', 'pointer-events-auto');
                drawer.classList.add('translate-x-full');
                drawer.classList.remove('translate-x-0');
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
            container.innerHTML = '<div class="text-center text-muted-foreground p-4">Tu carrito está vacío</div>';
        } else {
            this.items.forEach(item => {
                total += item.price * item.quantity;
                const itemEl = document.createElement('div');
                itemEl.className = 'cart-item flex items-center gap-4 p-3 border rounded-md relative bg-card';
                itemEl.innerHTML = `
                    <div class="w-16 h-16 bg-muted/50 rounded flex-shrink-0 p-1">
                        <img src="${item.image}" alt="${item.title}" class="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" onerror="this.src='https://placehold.co/100x100?text=No+Image'">
                    </div>
                    <div class="flex-1 min-w-0 pr-6">
                        <h4 class="font-medium text-sm line-clamp-2 leading-tight">${item.title}</h4>
                        <p class="text-xs text-muted-foreground mt-1">${item.quantity} x Gs. ${item.price.toLocaleString('es-PY')}</p>
                    </div>
                    <button class="remove-item absolute right-2 top-2 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs hover:bg-destructive hover:text-destructive-foreground transition-colors" data-id="${item.id}">&times;</button>
                `;
                container.appendChild(itemEl);
            });
        }

        if (totalEl) {
            totalEl.textContent = `Gs. ${total.toLocaleString('es-PY')}`;
        }
    }
};

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => {
    // Inject Cart HTML if not present
    if (!document.querySelector('.cart-drawer')) {
        const cartHTML = `
            <div class="cart-overlay fixed inset-0 bg-black/80 z-50 opacity-0 pointer-events-none transition-opacity duration-300 backdrop-blur-sm"></div>
            <div class="cart-drawer fixed inset-y-0 right-0 z-50 w-full max-w-sm border-l bg-background shadow-lg transition-transform duration-300 translate-x-full flex flex-col">
                <div class="flex items-center justify-between p-4 border-b">
                    <h3 class="font-semibold text-lg tracking-tight">Tu Carrito</h3>
                    <button class="cart-close btn btn-ghost btn-icon w-8 h-8 rounded-full">&times;</button>
                </div>
                <div class="cart-items flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                    <!-- Items injected here -->
                </div>
                <div class="border-t p-4 space-y-4 bg-muted/30">
                    <div class="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span class="cart-total-price text-primary">Gs. 0</span>
                    </div>
                    <button class="btn btn-default w-full checkout-btn bg-black text-white hover:bg-neutral-800 text-lg py-6 font-bold uppercase tracking-wider shadow-lg transition-all border-none">Finalizar Compra</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', cartHTML);
    }

    // Inject Checkout Modal if not present (Fix for product-detail)
    if (!document.getElementById('checkout-modal')) {
        const checkoutHTML = `
            <div id="checkout-overlay" class="checkout-overlay fixed inset-0 bg-black/80 z-50 opacity-0 pointer-events-none transition-opacity duration-200 backdrop-blur-sm"></div>
            <div id="checkout-modal" class="checkout-modal fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-xl sm:rounded-xl opacity-0 pointer-events-none scale-95 transition-all duration-200">
                <div class="flex items-center justify-between border-b pb-4">
                    <h2 class="text-xl font-bold tracking-tight">Finalizar Pedido</h2>
                    <button id="close-checkout" class="close-checkout btn btn-ghost btn-icon w-8 h-8 rounded-full">&times;</button>
                </div>
                <div class="pt-2">
                    <form id="checkout-form" class="space-y-5">
                        <div class="space-y-2">
                            <label for="customer-name" class="text-sm font-medium leading-none">Nombre Completo *</label>
                            <input type="text" id="customer-name" required class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" placeholder="Ej: Juan Pérez">
                        </div>
                        <div class="space-y-2">
                            <label for="customer-address" class="text-sm font-medium leading-none">Dirección de Entrega *</label>
                            <input type="text" id="customer-address" required class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" placeholder="Ej: Av. España 123">
                        </div>
                        <div class="space-y-2">
                            <label for="payment-method" class="text-sm font-medium leading-none">Método de Pago *</label>
                            <select id="payment-method" required class="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                <option value="Efectivo">Efectivo</option>
                                <option value="Transferencia">Transferencia Bancaria</option>
                                <option value="QR">Pago QR</option>
                            </select>
                        </div>
                        <div class="pt-4">
                            <button type="submit" class="w-full bg-[#25D366] text-white hover:bg-[#128C7E] inline-flex items-center justify-center rounded-md font-bold text-base shadow-lg ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 h-12 px-8 py-2">
                                Enviar Pedido a WhatsApp 📱
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', checkoutHTML);
    }

    Cart.init();
});

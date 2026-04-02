const API_URL = '/api/products';
const STATIC_URL = '';

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
        window.location.href = 'index.html';
        return;
    }

    let product = null;

    try {
        const res = await fetch(`${API_URL}/${id}`);
        if (res.ok) {
            const apiProduct = await res.json();
            let mainImg = apiProduct.image_url || apiProduct.image;
            if (mainImg && mainImg.startsWith('/uploads')) mainImg = mainImg;

            let images = [];
            if (apiProduct.gallery_urls) {
                try {
                    const parsed = typeof apiProduct.gallery_urls === 'string' ? JSON.parse(apiProduct.gallery_urls) : apiProduct.gallery_urls;
                    images = Array.isArray(parsed) ? parsed : [];
                } catch (e) { images = []; }
            }
            images = images.map(img => img.startsWith('/uploads') ? img : img);
            if (images.length === 0 && mainImg) images = [mainImg];
            else if (mainImg && !images.includes(mainImg)) images.unshift(mainImg);

            product = {
                ...apiProduct,
                price: Number(apiProduct.price),
                image: mainImg,
                images: images
            };
        }
    } catch (e) { console.warn("API Error", e); }

    if (!product && window.products) {
        product = window.products.find(p => p.id == id);
    }

    if (product) {
        const discount = parseInt(product.discount_percentage) || 0;
        const originalPrice = Number(product.price);
        const discountedPrice = discount > 0 ? originalPrice * (1 - discount / 100) : originalPrice;

        const titleEl = document.getElementById('titleDisplay');
        titleEl.textContent = product.title;

        const priceDisplay = document.getElementById('priceDisplay');
        if (discount > 0) {
            priceDisplay.innerHTML = `
                <div class="flex flex-col">
                    <span style="text-decoration: line-through; color: #9ca3af; font-size: 1rem; margin-bottom: 0.25rem;">Gs. ${originalPrice.toLocaleString('es-PY')}</span>
                    <span class="text-3xl font-bold text-primary">Gs. ${discountedPrice.toLocaleString('es-PY')}</span>
                </div>
            `;
            const badge = document.createElement('span');
            badge.className = 'ml-3 rounded bg-red-600 px-2 py-1 text-xs font-bold uppercase text-white shadow-sm';
            badge.textContent = `-${discount}%`;
            titleEl.parentElement.appendChild(badge);
        } else {
            priceDisplay.textContent = `Gs. ${originalPrice.toLocaleString('es-PY')}`;
        }

        document.getElementById('catDisplay').textContent = product.category || 'Sin Categoría';
        
        // Formateador inteligente para la descripción (soporta listas con - o *)
        const descText = product.description || 'Sin descripción';
        const descDisplay = document.getElementById('descDisplay');
        
        if (descText.includes('-') || descText.includes('*') || descText.includes('\n')) {
            const lines = descText.split('\n');
            let isList = false;
            let html = '';
            
            lines.forEach(line => {
                const trimmed = line.trim();
                // Si la línea empieza con un guión o asterisco, es un elemento de lista
                if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
                    if (!isList) {
                        html += '<ul style="list-style-type: disc; padding-left: 20px; line-height: 1.6; margin-bottom: 1rem; color: inherit; opacity: 0.9;">';
                        isList = true;
                    }
                    // Soporte simple para **negritas** estilo markdown "Diseño:**" 
                    let content = trimmed.substring(1).trim();
                    content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                    html += `<li style="margin-bottom: 0.3rem;">${content}</li>`;
                } else if (trimmed !== '') {
                    if (isList) {
                        html += '</ul>';
                        isList = false;
                    }
                    let content = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                    html += `<p style="margin-bottom: 0.5rem; line-height: 1.6; color: inherit; opacity: 0.9;">${content}</p>`;
                } else {
                    if (isList) {
                        html += '</ul>';
                        isList = false;
                    }
                    html += '<div style="height: 0.5rem;"></div>';
                }
            });
            if (isList) html += '</ul>';
            descDisplay.innerHTML = html;
        } else {
            descDisplay.innerHTML = `<p style="line-height: 1.6; opacity: 0.9;">${descText}</p>`;
        }

        const addBtn = document.querySelector('.btn-add');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                if (typeof Cart !== 'undefined') {
                    Cart.addItem(product);
                    const originalText = addBtn.textContent;
                    addBtn.textContent = "¡Añadido!";
                    setTimeout(() => addBtn.textContent = originalText, 2000);
                }
            });
        }

        const imgContainer = document.getElementById('imgContainer');
        const thumbContainer = document.getElementById('thumbContainer');
        imgContainer.innerHTML = '';
        thumbContainer.innerHTML = '';

        const images = product.images && product.images.length > 0 ? product.images : [product.image || 'https://placehold.co/500x500?text=No+Image'];

        const mainImgEl = document.createElement('img');
        mainImgEl.src = images[0];
        mainImgEl.className = "w-full h-auto object-cover rounded-xl transition-all duration-300";
        mainImgEl.onerror = () => { mainImgEl.src = 'https://placehold.co/500x500?text=No+Image'; };
        imgContainer.appendChild(mainImgEl);

        if (images.length > 1) {
            thumbContainer.style.display = 'flex';
            images.forEach((imgSrc, index) => {
                const thumb = document.createElement('div');
                const activeClasses = index === 0 ? 'active opacity-100 ring-2 ring-primary ring-offset-2 ring-offset-background' : 'opacity-60';
                thumb.className = `thumbnail w-20 h-20 border rounded-md cursor-pointer hover:opacity-100 transition-all bg-black flex-shrink-0 ${activeClasses}`;
                thumb.innerHTML = `<img src="${imgSrc}" class="w-full h-full object-cover rounded-md" onerror="this.src='https://placehold.co/100x100?text=Error'">`;
                
                thumb.addEventListener('click', () => {
                    mainImgEl.src = imgSrc;
                    document.querySelectorAll('.thumbnail').forEach(t => {
                        t.classList.remove('active', 'opacity-100', 'ring-2', 'ring-primary', 'ring-offset-2', 'ring-offset-background');
                        t.classList.add('opacity-60');
                    });
                    thumb.classList.remove('opacity-60');
                    thumb.classList.add('active', 'opacity-100', 'ring-2', 'ring-primary', 'ring-offset-2', 'ring-offset-background');
                });
                thumbContainer.appendChild(thumb);
            });
        } else {
            thumbContainer.style.display = 'none';
        }
    } else {
        document.body.innerHTML = "<h1 style='color:black;text-align:center;margin-top:200px'>Producto no encontrado</h1>";
        setTimeout(() => window.location.href = 'products.html', 2000);
    }
});

const API_URL = 'http://localhost:3000/api/products';
const token = localStorage.getItem('token');

if (!token) {
    window.location.href = 'login.html';
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', () => {
    loadProducts();

    document.getElementById('productForm').addEventListener('submit', handleFormSubmit);
});

async function loadProducts() {
    try {
        const response = await fetch(API_URL);
        const products = await response.json();
        renderTable(products);
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

function renderTable(products) {
    const tbody = document.getElementById('productsTableBody');
    tbody.innerHTML = '';

    products.forEach(product => {
        const tr = document.createElement('tr');
        const imgUrl = product.image ? (product.image.startsWith('http') ? product.image : `http://localhost:3000${product.image}`) : 'https://placehold.co/50';

        tr.innerHTML = `
            <td><img src="${imgUrl}" alt="${product.title}"></td>
            <td>${product.title}</td>
            <td>${product.category}</td>
            <td>Gs. ${product.price.toLocaleString('es-PY')}</td>
            <td class="actions">
                <button class="btn-edit" onclick="editProduct(${product.id})">Editar</button>
                <button class="btn-delete" onclick="deleteProduct(${product.id})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function openModal(product = null) {
    const modal = document.getElementById('productModal');
    const title = document.getElementById('modalTitle');
    const form = document.getElementById('productForm');

    if (product) {
        title.textContent = 'Editar Producto';
        document.getElementById('productId').value = product.id;
        document.getElementById('title').value = product.title;
        document.getElementById('category').value = product.category;
        document.getElementById('price').value = product.price;
        document.getElementById('description').value = product.description || '';
        document.getElementById('badge').value = product.badge || '';
    } else {
        title.textContent = 'Nuevo Producto';
        form.reset();
        document.getElementById('productId').value = '';
    }

    modal.style.display = 'flex';
}

function closeModal() {
    document.getElementById('productModal').style.display = 'none';
}

async function handleFormSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('productId').value;
    const formData = new FormData(e.target);

    // Remove empty ID from formData if creating
    if (!id) formData.delete('id');

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/${id}` : API_URL;

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (response.ok) {
            closeModal();
            loadProducts();
        } else {
            alert('Error al guardar el producto');
        }
    } catch (error) {
        console.error(error);
        alert('Error de conexión');
    }
}

async function editProduct(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        const product = await response.json();
        openModal(product);
    } catch (error) {
        console.error(error);
    }
}

async function deleteProduct(id) {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            loadProducts();
        } else {
            alert('Error al eliminar');
        }
    } catch (error) {
        console.error(error);
    }
}

// Close modal when clicking outside
window.onclick = function (event) {
    const modal = document.getElementById('productModal');
    if (event.target == modal) {
        closeModal();
    }
}

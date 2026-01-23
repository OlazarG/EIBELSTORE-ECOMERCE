const fs = require('fs');
const path = require('path');

const modalContent = `    <!-- Product Modal -->
    <div id="productModal" class="modal-overlay" style="display:none;">
        <div class="modal-content">
            <div class="modal-header">
                <h2 id="modalTitle">Nuevo Producto</h2>
                <button class="close-modal" onclick="closeModal()">×</button>
            </div>
            <form id="productForm" onsubmit="handleFormSubmit(event)">
                <input type="hidden" id="productId" name="id">
                <div class="form-group">
                    <label>Título</label>
                    <input type="text" id="title" name="title" required>
                </div>
                <div class="form-group">
                    <label>Categoría</label>
                    <select id="category" name="category" required>
                        <option value="Anillos">Anillos</option>
                        <option value="Collares">Collares</option>
                        <option value="Relojes">Relojes</option>
                        <option value="Colgantes">Colgantes</option>
                        <option value="Accesorios">Accesorios</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Subcategoría</label>
                    <input type="text" id="subcategory" name="subcategory" placeholder="Ej: Plata 925, Oro 18k">
                </div>
                <div class="form-group">
                    <label>Precio</label>
                    <input type="number" id="price" name="price" required>
                </div>
                <div class="form-group">
                    <label>Stock</label>
                    <input type="number" id="stock" name="stock" value="1" required>
                </div>
                <div class="form-group">
                    <label>Descripción</label>
                    <textarea id="description" name="description"></textarea>
                </div>
                <div class="form-group">
                    <label>Badge (Opcional)</label>
                    <input type="text" id="badge" name="badge" placeholder="Ej: SALE, NEW">
                </div>
                <div class="form-group">
                    <label>Imágenes</label>
                    <input type="file" name="images" multiple accept="image/*">
                    <div id="imagePreviews" style="margin-top: 10px; display: flex; flex-wrap: wrap;"></div>
                </div>
                <button type="submit" class="btn-save">Guardar</button>
            </form>
        </div>
    </div>`;

function updateFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Regex to match the old modal block roughly
    const modalRegex = /<!-- Product Modal -->[\s\S]*?<div id="productModal"[\s\S]*?<\/form>\s*<\/div>\s*<\/div>/;
    if (modalRegex.test(content)) {
        content = content.replace(modalRegex, modalContent);
        console.log(`Updated modal in ${filePath}`);
    } else {
        console.log(`Modal not found in ${filePath}, check regex`);
    }

    fs.writeFileSync(filePath, content, 'utf8');
}

updateFile('c:\\Users\\Computer\\Documents\\ECOMERCE\\index.html');
updateFile('c:\\Users\\Computer\\Documents\\ECOMERCE\\products.html');

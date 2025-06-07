let menuItems = JSON.parse(localStorage.getItem('menuItems')) || [
    { id: 1, categoryId: 1, name: "La Bufala", price: 20.00, image: "https://via.placeholder.com/100?text=La+Bufala", description: "Papas fritas con queso mozzarella, tocineta y salsa de la casa." },
    { id: 2, categoryId: 1, name: "Fusion", price: 75.00, image: "https://via.placeholder.com/100?text=Fusion", description: "Papas fritas con carne desmechada, queso cheddar y guacamole." },
    { id: 3, categoryId: 1, name: "Jcheps", price: 55.00, image: "https://via.placeholder.com/100?text=Jcheps", description: "Papas fritas con pollo desmechado, queso fundido y salsa BBQ." },
    { id: 4, categoryId: 2, name: "Arepas", price: 5.00, image: "https://via.placeholder.com/100?text=Arepas", description: "Arepa de maíz con queso rallado y mantequilla." }
];
let categories = JSON.parse(localStorage.getItem('categories')) || [
    { id: 1, name: "PAPA-CHEPS (SALCHIPAPAS)" },
    { id: 2, name: "ENTRADAS & AREPAS" }
];
let orders = JSON.parse(localStorage.getItem('orders')) || [];
let users = JSON.parse(localStorage.getItem('users')) || [
    { email: "admin@administracion.com", password: "admin123", name: "Admin", surname: "User", phone: "1234567890", type: "admin" }
];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let nextOrderId = JSON.parse(localStorage.getItem('nextOrderId')) || 1;
let nextProductId = JSON.parse(localStorage.getItem('nextProductId')) || 5;
let nextCategoryId = JSON.parse(localStorage.getItem('nextCategoryId')) || 3;
let lastCheckedOrderId = JSON.parse(localStorage.getItem('lastCheckedOrderId')) || 0;

function saveToLocalStorage() {
    localStorage.setItem('menuItems', JSON.stringify(menuItems));
    localStorage.setItem('categories', JSON.stringify(categories));
    localStorage.setItem('orders', JSON.stringify(orders));
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('nextOrderId', JSON.stringify(nextOrderId));
    localStorage.setItem('nextProductId', JSON.stringify(nextProductId));
    localStorage.setItem('nextCategoryId', JSON.stringify(nextCategoryId));
    localStorage.setItem('lastCheckedOrderId', JSON.stringify(lastCheckedOrderId));
}

function logout() {
    currentUser = null;
    saveToLocalStorage();
    window.location.href = 'index.html';
}

function showSection(sectionId) {
    document.querySelectorAll('.admin-section').forEach(section => section.style.display = 'none');
    document.getElementById(sectionId).style.display = 'block';
}

function updateCategorySelect() {
    const select = document.getElementById('category-select');
    if (!select) return;
    select.innerHTML = '';
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.name;
        select.appendChild(option);
    });
}

// Sección: Previsualizar Menú
function updatePreviewMenu() {
    const previewDiv = document.getElementById('admin-menu-preview');
    if (!previewDiv) return;
    previewDiv.innerHTML = '';
    categories.forEach(category => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'menu-category';
        categoryDiv.innerHTML = `<h3>${category.name} (${menuItems.filter(p => p.categoryId === category.id).length} productos)</h3>`;
        const products = menuItems.filter(p => p.categoryId === category.id);
        products.forEach(product => {
            const productDiv = document.createElement('div');
            productDiv.className = 'menu-item';
            productDiv.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <div>
                    <h4>${product.name}</h4>
                    <p>$${product.price.toFixed(2)}</p>
                    <p>${product.description || 'Sin descripción'}</p>
                </div>
            `;
            categoryDiv.appendChild(productDiv);
        });
        previewDiv.appendChild(categoryDiv);
    });
}

// Sección: Editar Menú
function updateAdminCategories() {
    if (!currentUser || currentUser.type !== 'admin') return;
    const categoriesDiv = document.getElementById('admin-categories');
    if (!categoriesDiv) return;
    categoriesDiv.innerHTML = '';
    categories.forEach(category => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'menu-category';
        categoryDiv.innerHTML = `<h3>${category.name}</h3>`;
        const products = menuItems.filter(p => p.categoryId === category.id);
        products.forEach(product => {
            const productDiv = document.createElement('div');
            productDiv.className = 'menu-item';
            productDiv.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <div>
                    <h4>${product.name}</h4>
                    <p>$${product.price.toFixed(2)}</p>
                    <p>${product.description || 'Sin descripción'}</p>
                    <button onclick="editProduct(${product.id})">Editar</button>
                    <button class="delete-btn" onclick="deleteProduct(${product.id})">Eliminar</button>
                </div>
            `;
            categoryDiv.appendChild(productDiv);
        });
        categoriesDiv.appendChild(categoryDiv);
    });
}

function addOrUpdateProduct() {
    if (!currentUser || currentUser.type !== 'admin') return;
    const categoryId = parseInt(document.getElementById('category-select').value);
    const name = document.getElementById('product-name').value;
    const price = parseFloat(document.getElementById('product-price').value);
    const image = document.getElementById('product-image').value;
    const description = document.getElementById('product-description').value;
    const productId = document.getElementById('product-id').value;

    if (categoryId && name && price >= 0 && image) {
        if (productId) {
            const product = menuItems.find(p => p.id === parseInt(productId));
            product.categoryId = categoryId;
            product.name = name;
            product.price = price;
            product.image = image;
            product.description = description;
        } else {
            menuItems.push({ id: nextProductId++, categoryId, name, price, image, description });
        }
        document.getElementById('product-name').value = '';
        document.getElementById('product-price').value = '';
        document.getElementById('product-image').value = '';
        document.getElementById('product-description').value = '';
        document.getElementById('product-id').value = '';
        saveToLocalStorage();
        updateAdminCategories();
        updatePreviewMenu();
    } else {
        alert('Por favor, completa todos los campos correctamente');
    }
}

function editProduct(id) {
    const product = menuItems.find(p => p.id === id);
    document.getElementById('category-select').value = product.categoryId;
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-image').value = product.image;
    document.getElementById('product-description').value = product.description || '';
    document.getElementById('product-id').value = product.id;
}

function deleteProduct(id) {
    if (!currentUser || currentUser.type !== 'admin') return;
    menuItems = menuItems.filter(p => p.id !== id);
    saveToLocalStorage();
    updateAdminCategories();
    updatePreviewMenu();
}

// Sección: Agregar Producto
function addCategory() {
    if (!currentUser || currentUser.type !== 'admin') return;
    const name = document.getElementById('new-category-name').value;
    if (name) {
        categories.push({ id: nextCategoryId++, name });
        document.getElementById('new-category-name').value = '';
        saveToLocalStorage();
        updateCategorySelect();
        updateAdminCategories();
        updatePreviewMenu();
    } else {
        alert('Por favor, ingresa un nombre de categoría');
    }
}

// Sección: Lista de Pedidos
function calculateTimeElapsed(orderDate) {
    const now = new Date().getTime();
    const diffMs = now - orderDate;
    const diffMins = Math.floor(diffMs / 60000); // Convertir a minutos
    return `${diffMins} minuto${diffMins !== 1 ? 's' : ''}`;
}

function updateAdminOrders() {
    if (!currentUser || currentUser.type !== 'admin') return;
    const ordersDiv = document.getElementById('admin-orders');
    if (!ordersDiv) return;
    ordersDiv.innerHTML = '';
    orders.forEach(order => {
        const div = document.createElement('div');
        div.className = 'order-item';
        const timeElapsed = calculateTimeElapsed(order.date);
        div.innerHTML = `
            <h3>Pedido #${order.id} - ${order.name}</h3>
            <p>Subtotal: $${order.subtotal.toFixed(2)}</p>
            <p>Tiempo transcurrido: ${timeElapsed}</p>
            <p>Estado: ${order.status}</p>
            <button onclick="updateOrderStatus(${order.id}, 'en proceso')">En Proceso</button>
            <button onclick="updateOrderStatus(${order.id}, '${order.type === 'domicilio' ? 'enviado' : 'finalizado'}')">${order.type === 'domicilio' ? 'Enviado' : 'Finalizado'}</button>
            <button onclick="showOrderPreview(${order.id})">Vista Previa</button>
        `;
        ordersDiv.appendChild(div);
    });
    checkNotifications();
}

function updateOrderStatus(orderId, status) {
    if (!currentUser || currentUser.type !== 'admin') return;
    const order = orders.find(o => o.id === orderId);
    order.status = status;
    saveToLocalStorage();
    updateAdminOrders();
}

// Sección: Vista Previa de Pedidos
function showOrderPreview(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-btn" onclick="document.body.removeChild(this.parentElement.parentElement)">×</span>
            <h2>Pedido #${order.id} - ${order.name}</h2>
            <p><strong>Cliente:</strong> ${order.name} (${order.client})</p>
            <p><strong>Teléfono:</strong> ${order.phone}</p>
            ${order.address ? `<p><strong>Dirección:</strong> ${order.address}</p>` : ''}
            ${order.arrivalTime ? `<p><strong>Hora de llegada:</strong> ${order.arrivalTime}</p>` : ''}
            <p><strong>Tipo:</strong> ${order.type}</p>
            <p><strong>Método de pago:</strong> ${order.paymentMethod}</p>
            <h3>Productos</h3>
            <ul>
                ${order.items.map(item => `<li>${item.name} x${item.quantity} ($${item.price * item.quantity})${item.comment ? ` - ${item.comment}` : ''}</li>`).join('')}
            </ul>
            <p><strong>Subtotal:</strong> $${order.subtotal.toFixed(2)}</p>
            <p><strong>Propina:</strong> $${order.tip.toFixed(2)}</p>
            <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
            <button onclick="printKitchenOrder(${order.id})">Imprimir Comanda a Cocina</button>
            <button onclick="printReceipt(${order.id})">Imprimir Recibo</button>
        </div>
    `;
    document.body.appendChild(modal);
}

// Sección: Notificaciones para Administrador
function checkNotifications() {
    const notificationBtn = document.getElementById('notification-btn');
    const newOrders = orders.filter(order => order.id > lastCheckedOrderId && order.status === 'pendiente');
    if (newOrders.length > 0) {
        notificationBtn.style.backgroundColor = '#28a745';
        notificationBtn.style.color = 'white';
    } else {
        notificationBtn.style.backgroundColor = '';
        notificationBtn.style.color = '';
    }
}

function toggleNotifications() {
    const panel = document.getElementById('notification-panel');
    const previewDiv = document.getElementById('notification-preview');
    if (panel.style.display === 'none') {
        panel.style.display = 'block';
        const recentOrder = orders.reduce((latest, order) => order.id > latest.id ? order : latest, orders[0] || { id: 0 });
        if (recentOrder && recentOrder.id > lastCheckedOrderId) {
            lastCheckedOrderId = recentOrder.id;
            saveToLocalStorage();
            previewDiv.innerHTML = `
                <div class="notification-item">
                    <h4>Nuevo Pedido #${recentOrder.id} - ${recentOrder.name}</h4>
                    <p>Subtotal: $${recentOrder.subtotal.toFixed(2)}</p>
                    <p>Tiempo transcurrido: ${calculateTimeElapsed(recentOrder.date)}</p>
                    <p>Estado: ${recentOrder.status}</p>
                    <button onclick="showSection('orders-list')">Ir a los Pedidos</button>
                </div>
            `;
        } else {
            previewDiv.innerHTML = '<p>No hay nuevos pedidos.</p>';
        }
    } else {
        panel.style.display = 'none';
    }
    checkNotifications();
}

// Otras funciones (generateKitchenOrderLatex, generateReceiptLatex, etc.) permanecen iguales

updateCategorySelect();
updateAdminCategories();
updatePreviewMenu();
updateAdminOrders();
showSection('preview-menu'); // Mostrar la sección de previsualización por defecto
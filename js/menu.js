let menuItems = JSON.parse(localStorage.getItem('menuItems')) || [];
let categories = JSON.parse(localStorage.getItem('categories')) || [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let orders = JSON.parse(localStorage.getItem('orders')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let users = JSON.parse(localStorage.getItem('users')) || [];

function saveToLocalStorage() {
    localStorage.setItem('menuItems', JSON.stringify(menuItems));
    localStorage.setItem('categories', JSON.stringify(categories));
    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('orders', JSON.stringify(orders));
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
}

function logout() {
    currentUser = null;
    cart = [];
    saveToLocalStorage();
    window.location.href = 'index.html';
}

function updateButtonVisibility() {
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const ordersBtn = document.getElementById('orders-btn');
    const menuBtn = document.getElementById('menu-btn');
    if (currentUser) {
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'inline-block';
        if (ordersBtn) ordersBtn.style.display = 'inline-block';
        if (menuBtn) menuBtn.style.display = 'inline-block';
    } else {
        loginBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'none';
        if (ordersBtn) ordersBtn.style.display = 'none';
        if (menuBtn) menuBtn.style.display = 'none';
    }
}

function updateMenu() {
    const categoriesDiv = document.getElementById('menu-categories');
    if (!categoriesDiv) return;
    categoriesDiv.innerHTML = '';
    categories.forEach(category => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'menu-category';
        categoryDiv.innerHTML = `<h2>${category.name}</h2>`;
        const products = menuItems.filter(p => p.categoryId === category.id);
        products.forEach(product => {
            const productDiv = document.createElement('div');
            productDiv.className = 'menu-item';
            productDiv.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <div>
                    <h3>${product.name}</h3>
                    <p>$${product.price.toFixed(2)}</p>
                    <button onclick="event.stopPropagation(); addToCart(${product.id}, '${product.name}', ${product.price})">Agregar al Carrito</button>
                </div>
            `;
            productDiv.onclick = () => previewProduct(product.id);
            categoryDiv.appendChild(productDiv);
        });
        categoriesDiv.appendChild(categoryDiv);
    });
}

function previewProduct(id) {
    const product = menuItems.find(p => p.id === id);
    const previewDiv = document.getElementById('product-preview');
    const modal = document.getElementById('product-modal');
    if (product) {
        previewDiv.innerHTML = `
            <h3>${product.name}</h3>
            <img src="${product.image}" alt="${product.name}">
            <p>${product.description || 'Sin descripción'}</p>
            <p>$${product.price.toFixed(2)}</p>
        `;
        modal.style.display = 'block';
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function updateCartPreview() {
    const cartPreviewDiv = document.getElementById('cart-preview');
    if (!cartPreviewDiv) return;
    cartPreviewDiv.innerHTML = '';
    if (cart.length === 0) {
        cartPreviewDiv.style.display = 'none';
        return;
    }

    cartPreviewDiv.style.display = 'flex';
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    cartPreviewDiv.innerHTML = `
        <div class="cart-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <span class="cart-count">${totalItems}</span>
        </div>
        <div class="cart-summary">
            <p>Subtotal: $${subtotal.toFixed(2)}</p>
        </div>
        <button onclick="window.location.href='cart.html'">Ir al Carrito</button>
    `;
}

function addToCart(id, name, price) {
    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ id, name, price, quantity: 1, comment: '' });
    }
    saveToLocalStorage();
    updateCartPreview();
}

function showOrders() {
    const ordersSection = document.getElementById('orders-section');
    const lastOrderPreviewDiv = document.getElementById('last-order-preview');
    const clientOrdersDiv = document.getElementById('client-orders');
    if (!ordersSection) return;

    ordersSection.style.display = 'block';
    lastOrderPreviewDiv.innerHTML = '';
    
    let userOrders = [];
    if (currentUser) {
        userOrders = orders.filter(order => order.client === currentUser.email);
    } else {
        const lastOrder = orders.length > 0 ? orders[orders.length - 1] : null;
        if (lastOrder) userOrders = [lastOrder];
    }

    if (userOrders.length > 0) {
        const lastOrder = userOrders.reduce((latest, order) => order.id > latest.id ? order : latest, userOrders[0]);
        const timeElapsed = calculateTimeElapsed(lastOrder.date);
        lastOrderPreviewDiv.innerHTML = `
            <h3>Último Pedido</h3>
            <div class="last-order-item">
                <h4>Pedido #${lastOrder.id}</h4>
                <p class="status status-${lastOrder.status.toLowerCase()}">Estado: ${lastOrder.status}</p>
                <p>Tiempo transcurrido: ${timeElapsed}</p>
                <button onclick="previewOrder(${lastOrder.id})">Ver Productos del Pedido</button>
            </div>
        `;
    } else {
        lastOrderPreviewDiv.innerHTML = '<p>No tienes pedidos aún.</p>';
    }

    clientOrdersDiv.innerHTML = '';
    if (userOrders.length > 0) {
        userOrders.forEach(order => {
            const div = document.createElement('div');
            div.className = 'order-item';
            const timeElapsed = calculateTimeElapsed(order.date);
            div.innerHTML = `
                <h3>Pedido #${order.id}</h3>
                <p>Subtotal: $${order.subtotal.toFixed(2)}</p>
                <p>Tiempo transcurrido: ${timeElapsed}</p>
                <p class="status status-${order.status.toLowerCase()}">Estado: ${order.status}</p>
                <button onclick="previewOrder(${order.id})">Ver Productos del Pedido</button>
            `;
            clientOrdersDiv.appendChild(div);
        });
    } else {
        clientOrdersDiv.innerHTML = '<p>No tienes pedidos aún.</p>';
    }
}

function previewOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    const previewDiv = document.getElementById('product-preview');
    const modal = document.getElementById('product-modal');
    if (order) {
        previewDiv.innerHTML = `
            <h3>Productos del Pedido #${order.id}</h3>
            <ul>
                ${order.items.map(item => `
                    <li>
                        <h4>${item.name}</h4>
                        <p>$${item.price.toFixed(2)} x ${item.quantity} = $${(item.price * item.quantity).toFixed(2)}</p>
                        ${item.comment ? `<p>Comentario: ${item.comment}</p>` : ''}
                    </li>
                `).join('')}
            </ul>
        `;
        modal.style.display = 'block';
    }
}

function calculateTimeElapsed(orderDate) {
    const now = new Date().getTime();
    const diffMs = now - orderDate;
    const diffMins = Math.floor(diffMs / 60000);
    return `${diffMins} minuto${diffMins !== 1 ? 's' : ''}`;
}

updateButtonVisibility();
updateMenu();
updateCartPreview();
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('showOrders') === 'true' && document.getElementById('orders-section')) {
    showOrders();
}
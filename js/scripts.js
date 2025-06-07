let menuItems = JSON.parse(localStorage.getItem('menuItems')) || [
    { id: 1, categoryId: 1, name: "La Bufala", price: 20.00, image: "https://via.placeholder.com/100?text=La+Bufala" },
    { id: 2, categoryId: 1, name: "Fusion", price: 75.00, image: "https://via.placeholder.com/100?text=Fusion" },
    { id: 3, categoryId: 1, name: "Jcheps", price: 55.00, image: "https://via.placeholder.com/100?text=Jcheps" },
    { id: 4, categoryId: 2, name: "Arepas", price: 5.00, image: "https://via.placeholder.com/100?text=Arepas" }
];
let categories = JSON.parse(localStorage.getItem('categories')) || [
    { id: 1, name: "PAPA-CHEPS (SALCHIPAPAS)" },
    { id: 2, name: "ENTRADAS & AREPAS" }
];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let orders = JSON.parse(localStorage.getItem('orders')) || [];
let users = JSON.parse(localStorage.getItem('users')) || [
    { email: "admin@administracion.com", password: "admin123", name: "Admin", surname: "User", phone: "1234567890", type: "admin" }
];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let nextOrderId = JSON.parse(localStorage.getItem('nextOrderId')) || 1;
let nextProductId = JSON.parse(localStorage.getItem('nextProductId')) || 5;
let nextCategoryId = JSON.parse(localStorage.getItem('nextCategoryId')) || 3;

function saveToLocalStorage() {
    localStorage.setItem('menuItems', JSON.stringify(menuItems));
    localStorage.setItem('categories', JSON.stringify(categories));
    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('orders', JSON.stringify(orders));
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    localStorage.setItem('nextOrderId', JSON.stringify(nextOrderId));
    localStorage.setItem('nextProductId', JSON.stringify(nextProductId));
    localStorage.setItem('nextCategoryId', JSON.stringify(nextCategoryId));
}

function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        currentUser = user;
        saveToLocalStorage();
        window.location.href = user.type === 'admin' ? 'admin.html' : 'menu.html';
    } else {
        alert('Correo o contraseña incorrectos');
    }
}

function register() {
    const name = document.getElementById('name').value;
    const surname = document.getElementById('surname').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (name && surname && phone && email && password) {
        if (users.find(u => u.email === email)) {
            alert('El correo ya está registrado');
            return;
        }
        const type = email === 'admin@administracion.com' ? 'admin' : 'client';
        if (type === 'admin' && users.some(u => u.type === 'admin' && u.email !== email)) {
            alert('Solo admin@administracion.com puede ser administrador');
            return;
        }
        users.push({ email, password, name, surname, phone, type });
        saveToLocalStorage();
        alert('Registro exitoso, por favor inicia sesión');
        window.location.href = 'index.html';
    } else {
        alert('Por favor, completa todos los campos');
    }
}

function logout() {
    currentUser = null;
    cart = [];
    saveToLocalStorage();
    window.location.href = 'index.html';
}

function renderMenu() {
    const menuDiv = document.getElementById('menu-categories');
    if (!menuDiv) return;
    menuDiv.innerHTML = '';
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
                    <button onclick="addToCart(${product.id})">Agregar al Carrito</button>
                </div>
            `;
            categoryDiv.appendChild(productDiv);
        });
        menuDiv.appendChild(categoryDiv);
    });
}

function addToCart(id) {
    if (!currentUser || currentUser.type !== 'client') return;
    const item = menuItems.find(i => i.id === id);
    const cartItem = cart.find(i => i.id === id);
    if (cartItem) {
        cartItem.quantity++;
    } else {
        cart.push({ ...item, quantity: 1 });
    }
    saveToLocalStorage();
    updateCart();
}

function updateCart() {
    const cartDiv = document.getElementById('cart-items');
    if (!cartDiv) return;
    cartDiv.innerHTML = '';
    let subtotal = 0;
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <h3>${item.name}</h3>
            <p>$${item.price.toFixed(2)} x ${item.quantity} = $${itemTotal.toFixed(2)}</p>
            <button onclick="removeFromCart(${item.id})">Eliminar</button>
        `;
        cartDiv.appendChild(div);
    });
    const tip = parseFloat(document.getElementById('tip-input')?.value) || 0;
    const total = subtotal + tip;
    if (document.getElementById('subtotal')) {
        document.getElementById('subtotal').textContent = subtotal.toFixed(2);
        document.getElementById('tip').textContent = tip.toFixed(2);
        document.getElementById('total').textContent = total.toFixed(2);
    }
}

function removeFromCart(id) {
    const cartItem = cart.find(i => i.id === id);
    if (cartItem.quantity > 1) {
        cartItem.quantity--;
    } else {
        cart = cart.filter(i => i.id !== id);
    }
    saveToLocalStorage();
    updateCart();
}

function placeOrder() {
    if (!currentUser || currentUser.type !== 'client') return;
    if (cart.length === 0) {
        alert('El carrito está vacío');
        return;
    }
    const orderType = document.getElementById('order-type').value;
    const subtotal = parseFloat(document.getElementById('subtotal').textContent);
    const tip = parseFloat(document.getElementById('tip').textContent);
    orders.push({
        id: nextOrderId++,
        client: currentUser.email,
        items: [...cart],
        type: orderType,
        subtotal,
        tip,
        total: subtotal + tip,
        status: 'pendiente',
        date: new Date().toLocaleString()
    });
    cart = [];
    saveToLocalStorage();
    updateCart();
    alert('Pedido realizado con éxito');
    window.location.href = 'menu.html';
}

function addCategory() {
    if (!currentUser || currentUser.type !== 'admin') return;
    const name = document.getElementById('new-category-name').value;
    if (name) {
        categories.push({ id: nextCategoryId++, name });
        document.getElementById('new-category-name').value = '';
        saveToLocalStorage();
        updateCategorySelect();
        updateAdminCategories();
        renderMenu();
    } else {
        alert('Por favor, ingresa un nombre de categoría');
    }
}

function addOrUpdateProduct() {
    if (!currentUser || currentUser.type !== 'admin') return;
    const categoryId = parseInt(document.getElementById('category-select').value);
    const name = document.getElementById('product-name').value;
    const price = parseFloat(document.getElementById('product-price').value);
    const image = document.getElementById('product-image').value;
    const productId = document.getElementById('product-id').value;

    if (categoryId && name && price >= 0 && image) {
        if (productId) {
            const product = menuItems.find(p => p.id === parseInt(productId));
            product.categoryId = categoryId;
            product.name = name;
            product.price = price;
            product.image = image;
        } else {
            menuItems.push({ id: nextProductId++, categoryId, name, price, image });
        }
        document.getElementById('product-name').value = '';
        document.getElementById('product-price').value = '';
        document.getElementById('product-image').value = '';
        document.getElementById('product-id').value = '';
        saveToLocalStorage();
        updateAdminCategories();
        renderMenu();
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
    document.getElementById('product-id').value = product.id;
}

function deleteProduct(id) {
    if (!currentUser || currentUser.type !== 'admin') return;
    menuItems = menuItems.filter(p => p.id !== id);
    saveToLocalStorage();
    updateAdminCategories();
    renderMenu();
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
                    <button onclick="editProduct(${product.id})">Editar</button>
                    <button class="delete-btn" onclick="deleteProduct(${product.id})">Eliminar</button>
                </div>
            `;
            categoryDiv.appendChild(productDiv);
        });
        categoriesDiv.appendChild(categoryDiv);
    });
}

function updateAdminOrders() {
    if (!currentUser || currentUser.type !== 'admin') return;
    const ordersDiv = document.getElementById('admin-orders');
    if (!ordersDiv) return;
    ordersDiv.innerHTML = '';
    orders.forEach(order => {
        const div = document.createElement('div');
        div.className = 'order-item';
        div.innerHTML = `
            <h3>Pedido #${order.id} - ${order.client}</h3>
            <p>Tipo: ${order.type}</p>
            <p>Estado: ${order.status}</p>
            <p>Fecha: ${order.date}</p>
            <p>Subtotal: $${order.subtotal.toFixed(2)}</p>
            <p>Propina: $${order.tip.toFixed(2)}</p>
            <p>Total: $${order.total.toFixed(2)}</p>
            <p>Items: ${order.items.map(i => `${i.name} x${i.quantity}`).join(', ')}</p>
            <button onclick="updateOrderStatus(${order.id}, 'en proceso')">En Proceso</button>
            <button onclick="updateOrderStatus(${order.id}, 'listo')">Listo</button>
            <button onclick="updateOrderStatus(${order.id}, 'entregado')">Entregado</button>
        `;
        ordersDiv.appendChild(div);
    });
}

function updateOrderStatus(orderId, status) {
    if (!currentUser || currentUser.type !== 'admin') return;
    const order = orders.find(o => o.id === orderId);
    order.status = status;
    saveToLocalStorage();
    updateAdminOrders();
}

function updateAdminClients() {
    if (!currentUser || currentUser.type !== 'admin') return;
    const clientsDiv = document.getElementById('admin-clients');
    if (!clientsDiv) return;
    clientsDiv.innerHTML = '';
    users.filter(u => u.type === 'client').forEach(client => {
        const div = document.createElement('div');
        div.className = 'client-item';
        div.innerHTML = `
            <p>${client.name} ${client.surname} (${client.email}, ${client.phone})</p>
        `;
        clientsDiv.appendChild(div);
    });
}

function addManualOrder() {
    if (!currentUser || currentUser.type !== 'admin') return;
    const client = document.getElementById('manual-order-client').value;
    const details = document.getElementById('manual-order-details').value;
    const orderType = document.getElementById('manual-order-type').value;

    if (client && details) {
        orders.push({
            id: nextOrderId++,
            client,
            items: [{ name: details, price: 0, quantity: 1 }],
            type: orderType,
            subtotal: 0,
            tip: 0,
            total: 0,
            status: 'pendiente',
            date: new Date().toLocaleString()
        });
        document.getElementById('manual-order-client').value = '';
        document.getElementById('manual-order-details').value = '';
        saveToLocalStorage();
        updateAdminOrders();
        if (!users.some(u => u.email === client)) {
            users.push({ email: client, password: '', name: 'Desconocido', surname: '', phone: '', type: 'client' });
            saveToLocalStorage();
            updateAdminClients();
        }
    } else {
        alert('Por favor, completa todos los campos');
    }
}

// Initialize page-specific content
if (document.getElementById('menu-categories')) renderMenu();
if (document.getElementById('cart-items')) updateCart();
if (document.getElementById('admin-categories')) {
    updateCategorySelect();
    updateAdminCategories();
}
if (document.getElementById('admin-orders')) updateAdminOrders();
if (document.getElementById('admin-clients')) updateAdminClients();
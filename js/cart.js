let cart = JSON.parse(localStorage.getItem('cart')) || [];
let orders = JSON.parse(localStorage.getItem('orders')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let users = JSON.parse(localStorage.getItem('users')) || [];
let nextOrderId = JSON.parse(localStorage.getItem('nextOrderId')) || 1;

function saveToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('orders', JSON.stringify(orders));
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    localStorage.setItem('nextOrderId', JSON.stringify(nextOrderId));
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
    if (currentUser) {
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'inline-block';
    } else {
        loginBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'none';
    }
}

function updateOrderFields() {
    const orderType = document.getElementById('order-type').value;
    const arrivalTimeField = document.getElementById('arrival-time-field');
    const addressField = document.getElementById('address-field');

    arrivalTimeField.style.display = orderType === 'restaurante' ? 'block' : 'none';
    addressField.style.display = orderType === 'domicilio' ? 'block' : 'none';
}

function loadUserData() {
    if (currentUser) {
        document.getElementById('order-name').value = `${currentUser.name} ${currentUser.surname}`;
        document.getElementById('order-phone').value = currentUser.phone || '';
        document.getElementById('order-address').value = currentUser.address || '';
    }
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
            ${item.comment ? `<p>Comentario: ${item.comment}</p>` : ''}
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
    if (cart.length === 0) {
        alert('El carrito está vacío');
        return;
    }

    const orderType = document.getElementById('order-type').value;
    const orderName = document.getElementById('order-name').value;
    const orderPhone = document.getElementById('order-phone').value;
    const arrivalTime = document.getElementById('arrival-time').value;
    const orderAddress = document.getElementById('order-address').value;
    const paymentMethod = document.getElementById('payment-method').value;
    const subtotal = parseFloat(document.getElementById('subtotal').textContent);
    const tip = parseFloat(document.getElementById('tip').textContent);

    if (!orderName || !orderPhone) {
        alert('Por favor, completa los campos de nombre y número de teléfono.');
        return;
    }
    if (orderType === 'restaurante' && !arrivalTime) {
        alert('Por favor, ingresa la hora de llegada.');
        return;
    }
    if (orderType === 'domicilio' && !orderAddress) {
        alert('Por favor, ingresa la dirección.');
        return;
    }

    const clientEmail = currentUser ? currentUser.email : 'invitado@restaurante.com';

    if (orderType === 'domicilio' && currentUser) {
        const user = users.find(u => u.email === currentUser.email);
        if (user) {
            user.address = orderAddress;
            saveToLocalStorage();
        }
    }

    const order = {
        id: nextOrderId++,
        client: clientEmail,
        items: [...cart],
        type: orderType,
        name: orderName,
        phone: orderPhone,
        arrivalTime: orderType === 'restaurante' ? arrivalTime : null,
        address: orderType === 'domicilio' ? orderAddress : null,
        paymentMethod: paymentMethod,
        subtotal: subtotal,
        tip: tip,
        total: subtotal + tip,
        status: 'pendiente',
        date: new Date().getTime()
    };

    orders.push(order);
    cart = [];
    saveToLocalStorage();
    alert('Pedido realizado con éxito. Consulta tus pedidos en el menú.');
    window.location.href = 'menu.html?showOrders=true'; // Redirigir con parámetro para mostrar pedidos
}

updateButtonVisibility();
updateOrderFields();
loadUserData();
updateCart();
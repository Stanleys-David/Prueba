let users = JSON.parse(localStorage.getItem('users')) || [
    { email: "admin@administracion.com", password: "admin123", name: "Admin", surname: "User", phone: "1234567890", type: "admin" }
];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

function saveToLocalStorage() {
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
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
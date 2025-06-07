let users = JSON.parse(localStorage.getItem('users')) || [
    { email: "admin@administracion.com", password: "admin123", name: "Admin", surname: "User", phone: "1234567890", type: "admin" }
];

function saveToLocalStorage() {
    localStorage.setItem('users', JSON.stringify(users));
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
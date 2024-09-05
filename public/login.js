// public/login.js
document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Evitar el comportamiento por defecto del formulario

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            alert('Login successful!');
            // Redirigir a la página de inicio o dashboard
            window.location.href = '/dashboard'; // Suponiendo que hay una ruta para el dashboard
        } else {
            errorMessage.textContent = data.error || 'Login failed. Please try again.';
        }
    } catch (error) {
        errorMessage.textContent = 'An error occurred. Please try again.';
    }
});
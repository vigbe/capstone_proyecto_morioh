// public/register.js
document.getElementById('registerForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Evitar el comportamiento por defecto del formulario

    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const errorMessage = document.getElementById('registerErrorMessage');

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            alert('Cuenta creada exitosamente!');
            // Redirigir al login después de crear la cuenta
            window.location.href = '/';
        } else {
            errorMessage.textContent = data.error || 'Registro fallido. Intenta nuevamente.';
        }
    } catch (error) {
        errorMessage.textContent = 'Ocurrió un error. Intenta nuevamente.';
    }
});

// public/register.js
document.getElementById('registerForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Evitar el comportamiento por defecto del formulario

    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const errorMessage = document.getElementById('registerErrorMessage');
    const registerButton = event.target.querySelector('button');

    // Deshabilitar el botón mientras se procesa la solicitud
    registerButton.disabled = true;
    errorMessage.textContent = ''; // Limpiar mensaje de error previo

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
            window.location.href = '/';
        } else {
            // Mostrar un mensaje de error más amigable para el usuario
            if (data.error.includes('Email rate limit exceeded')) {
                errorMessage.textContent = 'Demasiados intentos con este correo. Por favor, espera unos minutos antes de intentarlo nuevamente.';
            } else {
                errorMessage.textContent = data.error || 'Registro fallido. Intenta nuevamente.';
            }
        }
    } catch (error) {
        errorMessage.textContent = 'Ocurrió un error. Intenta nuevamente.';
    } finally {
        // Rehabilitar el botón después de procesar
        registerButton.disabled = false;
    }
});

const express = require('express');
const path = require('path');

const app = express();

// Sirviendo los archivos estáticos generados por Vue
app.use(express.static(path.join(__dirname, 'dist')));

// Redirigir todas las solicitudes al index.html para que Vue Router se encargue de la navegación
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'Login.vue'));
});

// Puerto asignado por Heroku
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

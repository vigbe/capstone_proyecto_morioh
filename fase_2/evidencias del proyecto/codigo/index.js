const dotenv = require('dotenv');
const express = require('express');
const path = require('path');

// Cargar variables de entorno desde .env
dotenv.config();

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
  // Sirviendo los archivos estáticos generados por Vue
  app.use(express.static(path.join(__dirname, 'dist')));

  // Redirigir todas las solicitudes al index.html para que Vue Router se encargue de la navegación
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
} else {
  // Modo desarrollo
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'components/Login/Login.vue'));
    res.send('Estás en modo desarrollo. Usa `npm run dev` para ver los cambios en tiempo real.');
  });
}

// Puerto asignado por el archivo .env o por defecto
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${isProduction ? 'production' : 'development'} mode`);
});
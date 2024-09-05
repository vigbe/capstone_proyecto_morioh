const express = require('express');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(express.json());

// Configurar para servir archivos estáticos
app.use(express.static('public'));

// Supabase URL y anon key obtenidos del archivo .env
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Crear el cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Ruta para manejar el login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({ data });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Nueva ruta para manejar el registro de usuarios
app.post('/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({ data });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});

// Ruta para la página de registro
app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/public/register.html');
});

// Iniciar el servidor en el puerto 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
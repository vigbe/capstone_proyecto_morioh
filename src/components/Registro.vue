<template>
    <div class="register">
      <h1 class="title">Registro de Usuario</h1>
      <form @submit.prevent="register" class="form">
        <div class="form-group">
          <label class="form-label" for="email">Correo Electrónico</label>
          <input
            class="form-input"
            type="email"
            id="email"
            v-model="email"
            required
            placeholder="Correo Electrónico"
          />
        </div>
  
        <div class="form-group">
          <label class="form-label" for="password">Contraseña</label>
          <input
            class="form-input"
            type="password"
            id="password"
            v-model="password"
            required
            placeholder="Contraseña"
          />
        </div>
  
        <div class="form-group">
          <label class="form-label" for="confirmPassword">Confirmar Contraseña</label>
          <input
            class="form-input"
            type="password"
            id="confirmPassword"
            v-model="confirmPassword"
            required
            placeholder="Confirmar Contraseña"
          />
        </div>
  
        <div class="form-submit-container">
          <input class="form-submit" type="submit" value="Registrar" />
          <div v-if="loading" class="loader"></div>
          <div v-if="registerSuccess" class="success-message">
            <i class="fas fa-check-circle"></i> Registro exitoso
          </div>
        </div>
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
      </form>
    </div>
  </template>
  
  <script>
import supabase from '../supabase';

export default {
  data() {
    return {
      email: '',
      password: '',
      confirmPassword: '',
      errorMessage: '',
      loading: false,
      registerSuccess: false
    };
  },
  methods: {
    async register() {
      this.loading = true;
      this.errorMessage = '';
      this.registerSuccess = false;

      if (this.password !== this.confirmPassword) {
        this.errorMessage = 'Las contraseñas no coinciden.';
        this.loading = false;
        return;
      }

      try {
        // Registro con Supabase Auth
        const { data, error } = await supabase.auth.signUp({
          email: this.email,
          password: this.password
        });

        if (error) {
          throw error;
        }

        // Guarda los datos del usuario en localStorage
        const userId = data.user?.id; // Obtén el userId si existe
        if (userId) {
          localStorage.setItem('user', JSON.stringify({ id: userId, email: this.email , password: this.password}));
        }

        // Muestra mensaje de éxito
        this.registerSuccess = true;
        this.loading = false;

        // Redirige a la página de login
        setTimeout(() => {
          if (this.$router) {
            this.$router.push({ name: 'Login' });
          }
        }, 1500);
      } catch (error) {
        this.errorMessage = `Error en el registro: ${error.message}`;
        this.loading = false;
        console.error(error);
      }
    }
  }
};
</script>
  
  <style lang="scss" scoped>
  @import "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css";
  @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap');
  
  * {
    font-family: 'Roboto', sans-serif;
  }
  
  .register {
    padding: 2rem;
  }
  .title {
    text-align: center;
  }
  .form {
    margin: 3rem auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 20%;
    min-width: 350px;
    max-width: 100%;
    background-color: rgba(19, 35, 47, 0.9);
    border-radius: 5px;
    padding: 40px;
    box-shadow: 0 4px 10px 4px rgba(0, 0, 0, 0.3);
  }
  .form-group {
    margin-bottom: 2rem;
  }
  .form-label {
    color: white;
    margin-bottom: 1rem;
    display: block;
  }
  .form-input {
    padding: 10px 15px;
    background-color: #f2f2f2;
    background-image: none;
    border: 1px solid #dcdcdc;
    color: #333;
    &:focus {
      outline: 0;
      border-color: #1ab188;
    }
  }
  .form-submit-container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 3rem;
    width: 100%;
  }
  .form-submit {
    background-color: #1ab188;
    border: none;
    color: white;
    padding: 1rem 0;
    width: 100%;
    cursor: pointer;
    transition: background 0.2s ease-in-out;
    &:hover {
      background-color: #0b9185;
    }
  }
  .loader {
    border: 4px solid #f3f3f3;
    border-top: 4px solid #1ab188;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    animation: spin 1s linear infinite;
    margin-left: 10px;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .success-message {
    display: flex;
    align-items: center;
    color: #1ab188;
    margin-left: 10px;
    font-weight: bold;
    width: 100%;
    justify-content: center;
  }
  
  .error-message {
    color: #ff6b6b;
    margin-top: 1rem;
    text-align: center;
  }
  .form-link {
    text-align: center;
    margin-top: 2rem;
    color: white;
  }
  .form-link a {
    color: #1ab188;
    text-decoration: underline;
    cursor: pointer;
    &:hover {
      color: #0b9185;
    }
  }
  </style>
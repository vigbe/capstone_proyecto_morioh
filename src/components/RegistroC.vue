<template>
    <div class="register-complete">
      <h1 class="title">Registro Completo de Usuario</h1>
      <form @submit.prevent="completeRegistration" class="form">
        <div class="form-group">
          <label class="form-label" for="tipoUsuario">Tipo de Usuario</label>
          <select class="form-input" id="tipoUsuario" v-model="tipoUsuario" required>
            <option value="">Seleccione una opción</option>
            <option value="broker">Broker</option>
            <option value="inmobiliaria">Inmobiliaria</option>
          </select>
        </div>
  
        <div v-if="tipoUsuario === 'broker'">
          <div class="form-group">
            <label class="form-label" for="nombre">Nombre</label>
            <input
              class="form-input"
              type="text"
              id="nombre"
              v-model="nombre"
              required
              placeholder="Nombre"
            />
          </div>
          <div class="form-group">
            <label class="form-label" for="empresa">Empresa</label>
            <input
              class="form-input"
              type="text"
              id="empresa"
              v-model="empresa"
              required
              placeholder="Empresa"
            />
          </div>
          <div class="form-group">
            <label class="form-label" for="telefono">Teléfono</label>
            <input
              class="form-input"
              type="text"
              id="telefono"
              v-model="telefono"
              required
              placeholder="Teléfono"
            />
          </div>
        </div>
  
        <div v-if="tipoUsuario === 'inmobiliaria'">
          <div class="form-group">
            <label class="form-label" for="nombreInmobiliaria">Nombre de la Inmobiliaria</label>
            <input
              class="form-input"
              type="text"
              id="nombreInmobiliaria"
              v-model="nombreInmobiliaria"
              required
              placeholder="Nombre de la Inmobiliaria"
            />
          </div>
          <div class="form-group">
            <label class="form-label" for="direccion">Dirección</label>
            <input
              class="form-input"
              type="text"
              id="direccion"
              v-model="direccion"
              required
              placeholder="Dirección"
            />
          </div>
          <div class="form-group">
            <label class="form-label" for="telefonoInmobiliaria">Teléfono</label>
            <input
              class="form-input"
              type="text"
              id="telefonoInmobiliaria"
              v-model="telefonoInmobiliaria"
              required
              placeholder="Teléfono"
            />
          </div>
        </div>
  
        <div class="form-submit-container">
          <input class="form-submit" type="submit" value="Completar Registro" />
          <div v-if="loading" class="loader"></div>
          <div v-if="registerSuccess" class="success-message">
            <i class="fas fa-check-circle"></i> Registro completado con éxito
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
      tipoUsuario: '',
      nombre: '',
      empresa: '',
      telefono: '',
      nombreInmobiliaria: '',
      direccion: '',
      telefonoInmobiliaria: '',
      errorMessage: '',
      loading: false,
      registerSuccess: false
    };
  },
  methods: {
    async completeRegistration() {
      this.loading = true;
      this.errorMessage = '';
      this.registerSuccess = false;
  
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.id) {
          throw new Error('Usuario no encontrado. Inicie sesión nuevamente.');
        }
  
        let error;
        if (this.tipoUsuario === 'broker') {
          const { error: brokerError } = await supabase.from('broker').insert({
            user_id: user.id,
            email: user.email,
            nombre: this.nombre,
            empresa: this.empresa,
            telefono: this.telefono,
            fecha_registro: new Date()
          });
          error = brokerError;
        } else if (this.tipoUsuario === 'inmobiliaria') {
          const { error: inmobiliariaError } = await supabase.from('inmobiliaria').insert({
            user_id: user.id,
            email: user.email,
            nombre: this.nombreInmobiliaria,
            direccion: this.direccion,
            telefono: this.telefonoInmobiliaria,
            fecha_registro: new Date()
          });
          error = inmobiliariaError;
        }
  
        if (error) {
          throw error;
        }
  
        // Muestra mensaje de éxito
        this.registerSuccess = true;
        this.loading = false;
  
        // Redirige a la página de login
        setTimeout(() => {
          if (this.$router) {
            this.$router.push({ name: 'Home' });
          }
        }, 1500);
      } catch (error) {
        this.errorMessage = `Error en el registro completo: ${error.message}`;
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
  
  .register-complete {
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
  </style>
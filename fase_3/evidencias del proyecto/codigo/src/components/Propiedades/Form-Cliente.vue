<template>
    <div v-if="visible" class="overlay">
      <div class="overlay-content">
        <h3>{{ isEditing ? 'Editar Cliente' : 'Agregar Cliente' }}</h3>
        <form @submit.prevent="handleSubmit" class="form-container">
          
          <!-- Campo de Nombre -->
          <div class="form-row">
            <label>Nombre:</label>
            <input type="text" v-model="client.nombre" required />
          </div>
  
          <!-- Campo de Apellido -->
          <div class="form-row">
            <label>Apellido:</label>
            <input type="text" v-model="client.apellido" required />
          </div>
  
          <!-- Campo de Email -->
          <div class="form-row">
            <label>Email:</label>
            <input type="email" v-model="client.email" required />
          </div>
  
          <!-- Campo de Teléfono -->
          <div class="form-row">
            <label>Teléfono:</label>
            <input type="tel" v-model="client.telefono" required />
          </div>
  
          <!-- Campo de Dirección -->
          <div class="form-row">
            <label>Dirección:</label>
            <input type="text" v-model="client.direccion" required />
          </div>
  
          <!-- Campo de Distrito -->
          <div class="form-row">
            <label>Distrito:</label>
            <select v-model="client.id_distrito" required>
              <option v-for="distrito in distritos" :key="distrito.id_distrito" :value="distrito.id_distrito">
                {{ distrito.nombre_distrito }}
              </option>
            </select>
          </div>
  
          <!-- Campo de País -->
          <div class="form-row">
            <label>País:</label>
            <select v-model="client.id_pais" required>
              <option v-for="pais in paises" :key="pais.id_pais" :value="pais.id_pais">
                {{ pais.nombre_pais }}
              </option>
            </select>
          </div>
  
          <!-- Botones de acción -->
          <div class="form-row form-actions">
            <button type="submit">{{ isEditing ? 'Actualizar' : 'Agregar' }}</button>
            <button type="button" @click="closeOverlay">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      visible: Boolean,
      isEditing: Boolean,
      clientData: Object,
      distritos: Array,
      paises: Array
    },
    data() {
      return {
        client: {
          nombre: '',
          apellido: '',
          email: '',
          telefono: '',
          direccion: '',
          id_distrito: null,
          id_pais: null
        }
      };
    },
    watch: {
    clientData: {
        immediate: true,
        handler(newData) {
        if (newData && this.isEditing) {
            this.client = { ...newData };
        } else if (!this.isEditing) {
            this.client = {
            nombre: '',
            apellido: '',
            email: '',
            telefono: '',
            direccion: '',
            id_distrito: null,
            id_pais: null
            };
        }
        }
    }
    }
,
    methods: {
      handleSubmit() {
        this.$emit(this.isEditing ? 'update-client' : 'add-client', this.client);
      },
      closeOverlay() {
        this.$emit('close');
      }
    }
  };
  </script>
  
  <style scoped>
  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .overlay-content {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    width: 400px;
    max-width: 90%;
  }
  
  .form-container {
    display: flex;
    flex-direction: column;
  }
  
  .form-row {
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
  }
  
  .form-row label {
    margin-bottom: 0.5rem;
    font-weight: bold;
  }
  
  .form-row input,
  .form-row select {
    padding: 0.5rem;
    font-size: 1rem;
  }
  
  .form-actions {
    display: flex;
    justify-content: space-between;
  }
  
  .form-actions button {
    background-color: #1ab188;
    border: none;
    color: white;
    padding: 0.5rem 1rem;
    cursor: pointer;
    transition: background 0.2s ease-in-out;
  }
  .form-actions button:hover {
    background-color: #0b9185;
  }
  </style>
  
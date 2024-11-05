<template>
    <div class="solicitudes">
      <nav class="nav-bar">
        <div class="user-info-container">
          <div class="user-info">
            <span>{{ userName }} ({{ userType }})</span>
          </div>
          <div class="company-name">
            <span>LUVI Brokers</span>
          </div>
        </div>
        <div class="menu-container">
          <div class="menu-items">
            <router-link to="/solicitudes" class="menu-item">Solicitudes</router-link>
            <router-link to="/marketplace" class="menu-item">Marketplace</router-link>
            <router-link to="/clientes" class="menu-item">Clientes</router-link>
            <router-link v-if="userType === 'Inmobiliaria'" to="/cargar-propiedades" class="menu-item">Cargar Propiedades</router-link>
          </div>
          <button @click="logout" class="logout-button">Cerrar Sesión</button>
        </div>
      </nav>
  
      <!-- Kanban Container -->
      <div class="kanban-container">
        <h2>Solicitudes</h2>
        <vue-kanban :stages="stages" :tasks="tasks"></vue-kanban>
      </div>
  
      <!-- Botón para agregar solicitud -->
      <div class="add-solicitud-container">
        <button class="add-solicitud-button" @click="showOverlay = true">Agregar Solicitud</button>
      </div>
  
      <!-- Overlay de formulario de solicitud -->
      <div v-if="showOverlay" class="overlay">
        <div class="overlay-content">
          <h3>Agregar Solicitud</h3>
          <form @submit.prevent="addSolicitud">
            <label>Fecha de Solicitud:</label>
            <input type="date" v-model="newSolicitud.fecha_solicitud" required />
  
            <label>Estado:</label>
            <select v-model="newSolicitud.estado" required>
              <option value="pendiente">Pendiente</option>
              <option value="en_proceso">En Proceso</option>
              <option value="completado">Completado</option>
            </select>
  
            <label>ID Broker:</label>
            <input type="number" v-model="newSolicitud.id_broker" required />
  
            <label>ID Inmobiliaria:</label>
            <input type="number" v-model="newSolicitud.id_inmobiliaria" required />
  
            <label>ID Propiedad:</label>
            <input type="number" v-model="newSolicitud.id_propiedad" required />
  
            <button type="submit">Agregar</button>
            <button type="button" @click="showOverlay = false">Cancelar</button>
          </form>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import supabase from '../../supabase';
  import VueKanban from 'vue-kanban';
  
  export default {
    components: {
      VueKanban,
    },
    data() {
      return {
        userName: '',
        userType: '',
        stages: ['Pendiente', 'En Proceso', 'Completado'],
        tasks: [],
        showOverlay: false,
        newSolicitud: {
          fecha_solicitud: '',
          estado: 'pendiente',
          id_broker: '',
          id_inmobiliaria: '',
          id_propiedad: '',
        },
      };
    },
    async created() {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.id) {
        this.$router.push({ name: 'Login' });
      } else {
        await this.fetchUserData(user.id);
        await this.fetchSolicitudes();
      }
    },
    methods: {
        async fetchUserData(userId) {
      try {
        let { data: brokerData, error: brokerError } = await supabase
          .from('broker')
          .select('*')
          .eq('user_id', userId)
          .single();
        if (brokerError) {
          throw brokerError;
        }
        if (brokerData) {
          this.userName = brokerData.nombre;
          this.userType = 'Broker';
          return;
        }
      } catch (error) {
        console.error('Error fetching user data:', error.message);
      }
      try {
        let { data: inmobiliariaData, error: inmobiliariaError } = await supabase
          .from('inmobiliaria')
          .select('*')
          .eq('user_id', userId)
          .single();
        if (inmobiliariaError) {
          throw inmobiliariaError;
        }
        if (inmobiliariaData) {
          this.userName = inmobiliariaData.nombre;
          this.userType = 'Inmobiliaria';
        }
      } catch (error) {
        console.error('Error fetching user data:', error.message);
      }
    },
      async fetchSolicitudes() {
        try {
          const { data, error } = await supabase.from('solicitud').select('*');
          if (error) {
            throw error;
          }
          this.tasks = data.map((solicitud) => ({
            id: solicitud.id_solicitud,
            title: `Solicitud ${solicitud.id_solicitud}`,
            stage: solicitud.estado,
            description: `Broker: ${solicitud.id_broker}, Inmobiliaria: ${solicitud.id_inmobiliaria}, Propiedad: ${solicitud.id_propiedad}`,
            date: solicitud.fecha_solicitud,
          }));
        } catch (error) {
          console.error('Error fetching solicitudes:', error.message);
        }
      },
      async addSolicitud() {
        try {
          const { data, error } = await supabase.from('solicitud').insert([this.newSolicitud]);
          if (error) {
            throw error;
          }
          this.tasks.push({
            id: data[0].id_solicitud,
            title: `Solicitud ${data[0].id_solicitud}`,
            stage: this.newSolicitud.estado,
            description: `Broker: ${this.newSolicitud.id_broker}, Inmobiliaria: ${this.newSolicitud.id_inmobiliaria}, Propiedad: ${this.newSolicitud.id_propiedad}`,
            date: this.newSolicitud.fecha_solicitud,
          });
          this.showOverlay = false;
          this.newSolicitud = {
            fecha_solicitud: '',
            estado: 'pendiente',
            id_broker: '',
            id_inmobiliaria: '',
            id_propiedad: '',
          };
        } catch (error) {
          console.error('Error adding solicitud:', error.message);
        }
      },
      async logout() {
        const { error } = await supabase.auth.signOut();
        if (!error) {
          localStorage.removeItem('user');
          this.$router.push({ name: 'Login' });
        } else {
          console.error('Error al cerrar sesión:', error.message);
        }
      },
    },
  };
  </script>
  
  <style scoped>
  .solicitudes {
    padding: 2rem;
  }
  .nav-bar {
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: rgba(19, 35, 47, 0.9);
    padding: 1rem;
    color: white;
  }
  .user-info-container {
    display: flex;
    justify-content: space-between;
    width: 100%;
    align-items: center;
    margin-bottom: 1rem;
  }
  .user-info {
    font-weight: bold;
  }
  .company-name {
    font-size: 1.2rem;
    font-weight: bold;
    color: #1ab188;
  }
  .menu-container {
    display: flex;
    justify-content: space-between;
    width: 100%;
    align-items: center;
  }
  .menu-items {
    display: flex;
    gap: 1rem;
  }
  .menu-item {
    color: white;
    text-decoration: none;
    transition: color 0.2s ease-in-out;
  }
  .menu-item:hover {
    color: #1ab188;
  }
  .logout-button {
    background-color: #1ab188;
    border: none;
    color: white;
    padding: 0.5rem 1rem;
    cursor: pointer;
    transition: background 0.2s ease-in-out;
  }
  .logout-button:hover {
    background-color: #0b9185;
  }
  .kanban-container {
    margin-top: 2rem;
  }
  .add-solicitud-container {
    margin-top: 1rem;
    text-align: center;
  }
  .add-solicitud-button {
    background-color: #1ab188;
    border: none;
    color: white;
    padding: 0.5rem  
  }
  </style>
  
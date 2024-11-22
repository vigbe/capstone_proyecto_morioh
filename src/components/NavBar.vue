<template>
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
          <router-link v-if="userType === 'Broker'" to="/marketplace" class="menu-item">Marketplace</router-link>
          <router-link v-if="userType === 'Broker'" to="/clientes" class="menu-item">Clientes</router-link>
          <router-link v-if="userType === 'Inmobiliaria'" to="/cargar-propiedades" class="menu-item">Cargar Propiedades</router-link>
        </div>
        <button @click="logout" class="logout-button">Cerrar Sesión</button>
      </div>
    </nav>
  </template>
  
  <script>
  import supabase from '../supabase';
  
  export default {
    data() {
      return {
        userName: '',
        userType: '',
        id_broker: null,
        id_inmobiliaria: null,
      };
    },
    async created() {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.id) {
        await this.fetchUserData(user.id);
      } else {
        this.$router.push({ name: 'Login' });
      }
    },
    methods: {
      async fetchUserData(userId) {
        try {
          const { data: brokerData, error: brokerError } = await supabase
            .from('broker')
            .select('*')
            .eq('user_id', userId)
            .single();
          if (brokerError) throw brokerError;
          if (brokerData) {
            this.userName = brokerData.nombre;
            this.userType = 'Broker';
            this.id_broker = brokerData.id_broker;
            return;
          }
        } catch (error) {
          console.error('Error fetching broker data:', error.message);
        }
  
        try {
          const { data: inmobiliariaData, error: inmobiliariaError } = await supabase
            .from('inmobiliaria')
            .select('*')
            .eq('user_id', userId)
            .single();
          if (inmobiliariaError) throw inmobiliariaError;
          if (inmobiliariaData) {
            this.userName = inmobiliariaData.nombre;
            this.userType = 'Inmobiliaria';
            this.id_inmobiliaria = inmobiliariaData.id_inmobiliaria;
          }
        } catch (error) {
          console.error('Error fetching inmobiliaria data:', error.message);
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
  .nav-bar {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: linear-gradient(135deg, #1ab188, #0b9185);
    padding: 1rem 2rem;
    color: white;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  
  .user-info-container {
    display: flex;
    justify-content: space-between;
    width: 100%;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  .user-info span,
  .company-name span {
    font-weight: bold;
  }
  
  .company-name {
    font-size: 1.2rem;
    color: #b2ebf2;
  }
  
  .menu-container {
    display: flex;
    justify-content: space-between;
    width: 100%;
    align-items: center;
  }
  
  .menu-items {
    display: flex;
    gap: 1.5rem;
  }
  
  .menu-item {
    color: white;
    text-decoration: none;
    font-weight: 500;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    transition: background 0.3s ease, transform 0.3s ease;
  }
  
  .menu-item:hover {
    background-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-3px);
  }
  
  .logout-button {
    background-color: #ff6666;
    border: none;
    color: white;
    padding: 0.5rem 1.2rem;
    font-weight: bold;
    cursor: pointer;
    border-radius: 8px;
    transition: background 0.3s ease, transform 0.3s ease;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .logout-button:hover {
    background-color: #ff4d4d;
    transform: scale(1.05);
  }
  
  .logout-button:active {
    transform: scale(0.95);
  }
  </style>
  
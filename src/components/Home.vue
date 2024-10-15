<template>
    <div class="home">
      <nav class="nav-bar">
        <div class="user-info">
          <span>{{ userName }} ({{ userType }})</span>
        </div>
        <button @click="logout" class="logout-button">Cerrar Sesión</button>
      </nav>
      <div class="welcome-message">
        <h1>Bienvenido, {{ userName }}</h1>
      </div>
    </div>
  </template>
  
  <script>
  import supabase from '../supabase';
  
  export default {
    data() {
      return {
        userName: '',
        userType: ''
      };
    },
    async created() {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.id) {
        this.$router.push({ name: 'Login' });
      } else {
        await this.fetchUserData(user.id);
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
      async logout() {
        const { error } = await supabase.auth.signOut();
        if (!error) {
          localStorage.removeItem('user');
          this.$router.push({ name: 'Login' });
        } else {
          console.error('Error al cerrar sesión:', error.message);
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .home {
    padding: 2rem;
  }
  .nav-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: rgba(19, 35, 47, 0.9);
    padding: 1rem;
    color: white;
  }
  .user-info {
    font-weight: bold;
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
  .welcome-message {
    text-align: center;
    margin-top: 2rem;
  }
  </style>
  
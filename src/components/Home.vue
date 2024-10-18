<template>
  <div class="home">
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
        </div>
        <button @click="logout" class="logout-button">Cerrar Sesión</button>
      </div>
    </nav>
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
</style>

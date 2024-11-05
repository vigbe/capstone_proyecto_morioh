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
          <router-link v-if="userType === 'Inmobiliaria'" to="/cargar-propiedades" class="menu-item">Cargar Propiedades</router-link>
        </div>
        <button @click="logout" class="logout-button">Cerrar Sesión</button>
      </div>
    </nav>

    <!-- Contenedor Canvas para la tabla de solicitudes -->
    <div class="solicitudes-container">
      <h2>Solicitudes</h2>
      <div class="canvas-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre del Cliente</th>
              <th>Fecha de Solicitud</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <!-- Aquí se añadirán las solicitudes dinámicamente en un futuro -->
            <tr>
              <td>1</td>
              <td>Juan Pérez</td>
              <td>2024-10-15</td>
              <td>Pendiente</td>
            </tr>
            <tr>
              <td>2</td>
              <td>Ana Gómez</td>
              <td>2024-10-16</td>
              <td>En Proceso</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import supabase from '../../supabase';

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
.solicitudes-container {
  margin-top: 2rem;
  background: #f9f9f9;
  padding: 1rem;
  border-radius: 5px;
}
.canvas-table table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}
.canvas-table th,
.canvas-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}
.canvas-table th {
  background-color: #1ab188;
  color: white;
}
</style>

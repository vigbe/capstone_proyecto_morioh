<template>
   <NavBar/>
  <div class="home">
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
import NavBar from '../NavBar.vue';

export default {
  components:{NavBar},
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

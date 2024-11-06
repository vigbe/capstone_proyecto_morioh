<template>
  <div class="solicitudes">
    <!-- Barra de navegación -->
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

    <!-- Tabla de solicitudes -->
    <div class="table-container">
      <h2>Solicitudes</h2>
      <table class="solicitudes-table">
        <thead>
          <tr>
            <th>ID Solicitud</th>
            <th>Fecha de Solicitud</th>
            <th>Estado</th>
            <th>Tipo</th>
            <th>Broker</th>
            <th>Inmobiliaria</th>
            <th>Propiedad</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="solicitud in tasks" :key="solicitud.id">
            <td>{{ solicitud.id }}</td>
            <td>{{ formatFecha(solicitud.date) }}</td>
            <td>{{ solicitud.stage }}</td>
            <td>{{ solicitud.tipo }}</td>
            <td>{{ solicitud.broker_nombre }}</td>
            <td>{{ solicitud.inmobiliaria_nombre }}</td>
            <td>{{ solicitud.propiedad_titulo }}</td>
            <td>
              <img src="@/assets/edit-icon.png" alt="Editar" title="Editar" class="action-icon" @click="editSolicitud(solicitud)" />
              <img src="@/assets/delete-icon.png" alt="Eliminar" title="Eliminar" class="action-icon" @click="deleteSolicitud(solicitud.id)" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Botón para agregar solicitud -->
    <div class="add-solicitud-container">
      <button class="add-solicitud-button" @click="openAddSolicitudForm">Agregar Solicitud</button>
    </div>

    <!-- Overlay de formulario de solicitud -->
    <div v-if="showOverlay" class="overlay">
      <div class="overlay-content">
        <h3>{{ isEditing ? 'Editar Solicitud' : 'Agregar Solicitud' }}</h3>
        <form @submit.prevent="isEditing ? updateSolicitud() : addSolicitud()">
          <!-- Campo de Tipo (estático) -->
          <label>Tipo:</label>
          <select v-model="newSolicitud.tipo" required>
            <option value="Nuevo Cliente">Nuevo Cliente</option>
            <option value="Venta">Venta</option>
          </select>

          <!-- Dropdown para broker (autoseleccionado y bloqueado si es broker) -->
          <label>Broker:</label>
          <select v-model="newSolicitud.id_broker" :disabled="userType === 'Broker'" required>
            <option v-if="userType === 'Broker'" :value="id_broker">{{ userName }}</option>
            <option v-else v-for="broker in brokers" :key="broker.id_broker" :value="broker.id_broker">
              {{ broker.nombre }}
            </option>
          </select>

          <!-- Dropdown para inmobiliaria (autoseleccionado y bloqueado si es inmobiliaria) -->
          <label>Inmobiliaria:</label>
          <select v-model="newSolicitud.id_inmobiliaria" :disabled="userType === 'Inmobiliaria'" @change="filterProperties" required>
            <option v-for="inmobiliaria in inmobiliarias" :key="inmobiliaria.id_inmobiliaria" :value="inmobiliaria.id_inmobiliaria">
              {{ inmobiliaria.nombre }}
            </option>
          </select>

          <!-- Dropdown de propiedades filtrado por inmobiliaria seleccionada -->
          <label>Propiedad:</label>
          <select v-model="newSolicitud.id_propiedad" required>
            <option v-for="propiedad in filteredProperties" :key="propiedad.id_propiedad" :value="propiedad.id_propiedad">
              {{ propiedad.titulo }}
            </option>
          </select>

          <button type="submit">{{ isEditing ? 'Actualizar' : 'Agregar' }}</button>
          <button type="button" @click="showOverlay = false">Cancelar</button>
        </form>
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
      userType: '',
      id_broker: null,
      id_inmobiliaria: null,
      tasks: [],
      showOverlay: false,
      isEditing: false, // Indica si estamos editando una solicitud existente
      brokers: [],
      inmobiliarias: [],
      propiedades: [],
      filteredProperties: [],  // Propiedades filtradas según la inmobiliaria seleccionada
      editSolicitudId: null,   // ID de la solicitud que se está editando
      newSolicitud: {
        id_broker: '',
        id_inmobiliaria: '',
        id_propiedad: '',
        tipo: '', // Añadido campo "Tipo"
      },
    };
  },
  async created() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.id) {
      this.$router.push({ name: 'Login' });
    } else {
      await this.fetchUserData(user.id);
      await this.fetchDropdownData();
      await this.fetchSolicitudes();
      this.setDefaultSolicitudValues(); // Establece valores por defecto para el formulario
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
          this.id_broker = brokerData.id_broker;
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
          this.id_inmobiliaria = inmobiliariaData.id_inmobiliaria;
          this.newSolicitud.id_inmobiliaria = inmobiliariaData.id_inmobiliaria; // Precarga el id_inmobiliaria
        }
      } catch (error) {
        console.error('Error fetching user data:', error.message);
      }
    },
    async fetchDropdownData() {
      try {
        const { data: brokersData, error: brokersError } = await supabase.from('broker').select('id_broker, nombre');
        if (brokersError) throw brokersError;
        this.brokers = brokersData;

        const { data: inmobiliariasData, error: inmobiliariasError } = await supabase.from('inmobiliaria').select('id_inmobiliaria, nombre');
        if (inmobiliariasError) throw inmobiliariasError;
        this.inmobiliarias = inmobiliariasData;

        const { data: propiedadesData, error: propiedadesError } = await supabase.from('propiedad').select('id_propiedad, titulo, id_inmobiliaria');
        if (propiedadesError) throw propiedadesError;
        this.propiedades = propiedadesData;
      } catch (error) {
        console.error('Error fetching dropdown data:', error.message);
      }
    },
    async fetchSolicitudes() {
      try {
        const { data, error } = await supabase
          .from('solicitud')
          .select('*')
          .eq('id_broker', this.id_broker);
        if (error) throw error;

        this.tasks = data.map((solicitud) => {
          const broker = this.brokers.find(b => b.id_broker === solicitud.id_broker);
          const inmobiliaria = this.inmobiliarias.find(i => i.id_inmobiliaria === solicitud.id_inmobiliaria);
          const propiedad = this.propiedades.find(p => p.id_propiedad === solicitud.id_propiedad);

          return {
            id: solicitud.id_solicitud,
            date: solicitud.fecha_solicitud,
            stage: solicitud.estado,
            tipo: solicitud.tipo,
            broker_nombre: broker ? broker.nombre : '',
            inmobiliaria_nombre: inmobiliaria ? inmobiliaria.nombre : '',
            propiedad_titulo: propiedad ? propiedad.titulo : '',
          };
        });
      } catch (error) {
        console.error('Error fetching solicitudes:', error.message);
      }
    },
    setDefaultSolicitudValues() {
      if (this.userType === 'Broker') {
        this.newSolicitud.id_broker = this.id_broker;
      } else if (this.userType === 'Inmobiliaria') {
        this.newSolicitud.id_inmobiliaria = this.id_inmobiliaria;
        this.filterProperties();
      }
    },
    filterProperties() {
      this.filteredProperties = this.propiedades.filter(
        propiedad => propiedad.id_inmobiliaria === this.newSolicitud.id_inmobiliaria
      );
    },
    openAddSolicitudForm() {
      this.newSolicitud = { 
        id_broker: this.userType === 'Broker' ? this.id_broker : '', 
        id_inmobiliaria: this.userType === 'Inmobiliaria' ? this.id_inmobiliaria : '', 
        id_propiedad: '', 
        tipo: '', // Nuevo campo tipo
      };
      this.isEditing = false;
      this.showOverlay = true;
      if (this.userType === 'Inmobiliaria') {
        this.filterProperties();
      }
    },
    async addSolicitud() {
      try {
        const solicitudData = {
          fecha_solicitud: new Date().toISOString(),
          estado: 'Pendiente',
          tipo: this.newSolicitud.tipo,
          id_broker: this.newSolicitud.id_broker,
          id_inmobiliaria: this.newSolicitud.id_inmobiliaria,
          id_propiedad: this.newSolicitud.id_propiedad,
        };

        const { error } = await supabase.from('solicitud').insert([solicitudData]);
        if (error) throw error;

        this.showOverlay = false;
        await this.fetchSolicitudes();
      } catch (error) {
        console.error('Error adding solicitud:', error.message);
      }
    },
    async deleteSolicitud(id) {
      try {
        const { error } = await supabase.from('solicitud').delete().eq('id_solicitud', id);
        if (error) throw error;

        await this.fetchSolicitudes();
      } catch (error) {
        console.error('Error deleting solicitud:', error.message);
      }
    },
    editSolicitud(solicitud) {
      this.newSolicitud = { 
        id_broker: solicitud.id_broker, 
        id_inmobiliaria: solicitud.id_inmobiliaria, 
        id_propiedad: solicitud.id_propiedad,
        tipo: solicitud.tipo, // Editar tipo
      };
      this.editSolicitudId = solicitud.id;
      this.isEditing = true;
      this.showOverlay = true;
      this.filterProperties();
    },
    async updateSolicitud() {
      try {
        const { error } = await supabase.from('solicitud')
          .update({
            id_broker: this.newSolicitud.id_broker,
            id_inmobiliaria: this.newSolicitud.id_inmobiliaria,
            id_propiedad: this.newSolicitud.id_propiedad,
            tipo: this.newSolicitud.tipo,
          })
          .eq('id_solicitud', this.editSolicitudId);
        if (error) throw error;

        this.showOverlay = false;
        this.isEditing = false;
        await this.fetchSolicitudes();
      } catch (error) {
        console.error('Error updating solicitud:', error.message);
      }
    },
    formatFecha(fecha) {
      const date = new Date(fecha);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
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

.solicitudes-table img.action-icon {
  width: 24px;
  height: 24px;
  cursor: pointer;
  margin: 0 5px;
}
.solicitudes-table img.action-icon:hover {
  opacity: 0.7;
}

.solicitudes {
  padding: 2rem;
}
.table-container {
  margin-top: 2rem;
}
.solicitudes-table {
  width: 100%;
  border-collapse: collapse;
}
.solicitudes-table th,
.solicitudes-table td {
  padding: 0.75rem;
  text-align: left;
  border: 1px solid #ddd;
}

.solicitudes-table th {
  background-color: #1ab188;
  color: white;
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
.add-solicitud-container {
  margin-top: 1rem;
  text-align: center;
}
.add-solicitud-button {
  background-color: #1ab188;
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: background 0.2s ease-in-out;
}
.add-solicitud-button:hover {
  background-color: #0b9185;
}
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
</style>

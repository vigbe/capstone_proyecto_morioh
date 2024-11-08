<template>
  <NavBar />
  <div class="solicitudes">
    <!-- Barra de navegación -->

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
            <th>Cliente</th>
            <th>Inmobiliaria</th>
            <th>Propiedad</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="solicitud in tasks" :key="solicitud.id">
            <td>{{ solicitud.id_solicitud }}</td>
            <td>{{ solicitud.fecha_solicitud }}</td>
            <td>{{ solicitud.estado }}</td>
            <td>{{ solicitud.tipo }}</td>
            <td>{{ solicitud.broker_nombre }}</td>
            <td>{{solicitud.cliente_nombre}}</td>
            <td>{{ solicitud.inmobiliaria_nombre }}</td>
            <td>{{ solicitud.propiedad_titulo }}</td>
            <td>
              <img src="@/assets/edit-icon.png" alt="Editar" title="Editar" class="action-icon" @click="editSolicitud(solicitud)" />
              <img src="@/assets/ver-icon.png" alt="Ver" title="Ver" class="action-icon" @click="viewSolicitud(solicitud.id_solicitud)" />
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
    <EditFormSolicitud
      :visible="showOverlay"
      :isEditing="isEditing"
      :solicitudData="newSolicitud"
      :clientes="clientes"
      :brokers="brokers"
      :inmobiliarias="inmobiliarias"
      :propiedades="propiedades"
      :userType="userType"
      @close="showOverlay = false"
      @add-solicitud="addSolicitud"
      @update-solicitud="updateSolicitud"
     />
  </div>
</template>

<script>
import supabase from '../../supabase';
import NavBar from '../NavBar.vue';
import EditFormSolicitud from './EditFormSolicitud.vue';

export default {
  components: { EditFormSolicitud,NavBar },
  data() {
    return {
      userName: '',
      userType: '',
      id_broker: null,
      id_inmobiliaria: null,
      tasks: [],
      showOverlay: false,
      isEditing: false,
      brokers: [],
      inmobiliarias: [],
      propiedades: [],
      clientes: [],
      editSolicitudId: null,
      newSolicitud: {
        tipo: '',
        id_cliente: null,
        id_broker: null,
        id_inmobiliaria: null,
        id_propiedad: null,
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
    }
  },
  methods: {
    viewSolicitud(id_solicitud) {
    this.$router.push({ name: 'DetalleSolicitud', params: { id_solicitud } });
  },
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
        console.error('Error fetching user data:', error.message);
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
          this.newSolicitud.id_inmobiliaria = inmobiliariaData.id_inmobiliaria;
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

        const { data: clientesData } = await supabase.from('cliente').select('id_cliente, nombre, apellido');
        this.clientes = clientesData || [];
      } catch (error) {
        console.error('Error fetching dropdown data:', error.message);
      }
    },
    async fetchSolicitudes() {
  try {
    let query = supabase.from('solicitud').select('*');

    // Filtra según el tipo de usuario
    if (this.userType === 'Broker') {
      query = query.eq('id_broker', this.id_broker);
    } else if (this.userType === 'Inmobiliaria') {
      query = query.eq('id_inmobiliaria', this.id_inmobiliaria);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Procesa los datos para mostrar en la tabla
    this.tasks = data.map((solicitud) => {
      const cliente = this.clientes.find(c => c.id_cliente === solicitud.id_cliente);
      const broker = this.brokers.find(b => b.id_broker === solicitud.id_broker);
      const inmobiliaria = this.inmobiliarias.find(i => i.id_inmobiliaria === solicitud.id_inmobiliaria);
      const propiedad = this.propiedades.find(p => p.id_propiedad === solicitud.id_propiedad);

      return {
        id_solicitud: solicitud.id_solicitud,
        fecha_solicitud: this.formatFecha(solicitud.fecha_solicitud),
        estado: solicitud.estado,
        tipo: solicitud.tipo,
        broker_nombre: broker ? broker.nombre : '',
        inmobiliaria_nombre: inmobiliaria ? inmobiliaria.nombre : '',
        propiedad_titulo: propiedad ? propiedad.titulo : '',
        cliente_nombre: cliente ? `${cliente.nombre} ${cliente.apellido}` : '',
      };
    });
  } catch (error) {
    console.error('Error fetching solicitudes:', error.message);
  }
}
,
    openAddSolicitudForm() {
      this.newSolicitud = { 
        tipo: '',
        id_cliente: null,
        id_broker: this.userType === 'Broker' ? this.id_broker : null, 
        id_inmobiliaria: this.userType === 'Inmobiliaria' ? this.id_inmobiliaria : null, 
        id_propiedad: null,
      };
      this.isEditing = false;
      this.showOverlay = true;
    },
    editSolicitud(solicitud) {
      this.newSolicitud = {
        tipo: solicitud.tipo,
        id_cliente: solicitud.cliente_id,
        id_broker: solicitud.id_broker,
        id_inmobiliaria: solicitud.id_inmobiliaria,
        id_propiedad: solicitud.id_propiedad,
      };
      this.editSolicitudId = solicitud.id_solicitud;
      this.isEditing = true;
      this.showOverlay = true;
    },
    async addSolicitud(solicitud) {
      try {
        const solicitudData = {
          fecha_solicitud: new Date(),
          estado: 'Pendiente',
          tipo: solicitud.tipo,
          id_cliente: solicitud.cliente_id,
          id_broker: solicitud.tipo==="Nuevo Cliente"?this.id_broker:solicitud.id_broker,
          id_inmobiliaria: solicitud.id_inmobiliaria,
          id_propiedad: solicitud.id_propiedad,
        };

        const { data, error } = await supabase.from('solicitud').insert([solicitudData]);
        if (error) throw error;

        this.showOverlay = false;
        await this.fetchSolicitudes();
      } catch (error) {
        console.error('Error adding solicitud:', error.message);
      }
    },
    async updateSolicitud(solicitud) {
      try {
        const { error } = await supabase.from('solicitud')
          .update({
            tipo: solicitud.tipo,
            id_cliente: solicitud.cliente_id,
            id_broker: solicitud.id_broker,
            id_inmobiliaria: solicitud.tipo === "Nuevo Cliente" ? null : solicitud.id_inmobiliaria,
            id_propiedad: solicitud.tipo === "Nuevo Cliente" ? null : solicitud.id_propiedad,
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
    async deleteSolicitud(id) {
      try {
        const { error } = await supabase.from('solicitud').delete().eq('id_solicitud', id);
        if (error) throw error;

        await this.fetchSolicitudes();
      } catch (error) {
        console.error('Error deleting solicitud:', error.message);
      }
    },
    formatFecha(fecha) {
      return new Intl.DateTimeFormat('es-CL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(new Date(fecha));
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

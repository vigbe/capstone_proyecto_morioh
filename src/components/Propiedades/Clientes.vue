<template>
    <div class="clientes">
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
  
      <!-- Tabla de clientes -->
      <div class="table-container">
        <h2>Clientes</h2>
        <table class="clientes-table">
          <thead>
            <tr>
              <th>ID Cliente</th>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Dirección</th>
              <th>Distrito</th>
              <th>País</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cliente in clients" :key="cliente.id_cliente">
              <td>{{ cliente.id_cliente }}</td>
              <td>{{ cliente.nombre }}</td>
              <td>{{ cliente.apellido }}</td>
              <td>{{ cliente.email }}</td>
              <td>{{ cliente.telefono }}</td>
              <td>{{ cliente.direccion }}</td>
              <td>{{ cliente.distrito_nombre }}</td>
              <td>{{ cliente.pais_nombre }}</td>
              <td>
                <img src="@/assets/edit-icon.png" alt="Editar" title="Editar" class="action-icon" @click="editClient(cliente)" />
                <img src="@/assets/delete-icon.png" alt="Eliminar" title="Eliminar" class="action-icon" @click="deleteClient(cliente.id_cliente)" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <!-- Botón para agregar cliente -->
      <div class="add-client-container">
        <button class="add-client-button" @click="openAddClientForm">Agregar Cliente</button>
      </div>
  
      <!-- Overlay de formulario para agregar/editar cliente -->
      <FormClienteOverlay
        :visible="showOverlay"
        :isEditing="isEditing"
        :clientData="selectedClient"
        :distritos="distritos"
        :paises="paises"
        @close="showOverlay = false"
        @add-client="addClient"
        @update-client="updateClient"
      />
    </div>
  </template>
  
  <script>
  import FormClienteOverlay from '@/components/Propiedades/Form-Cliente.vue';
  import supabase from '../../supabase';
  
  export default {
    components: { FormClienteOverlay },
    data() {
      return {
        userName: '',
        userType: '',
        id_broker: null,
        clients: [],
        showOverlay: false,
        isEditing: false,
        selectedClient: null,
        brokers: [],
        distritos: [],
        paises: []
      };
    },
    async created() {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.id) {
        this.$router.push({ name: 'Login' });
      } else {
        await this.fetchUserData(user.id);
        await this.fetchDropdownData();
        await this.fetchClients();
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
          }
        } catch (error) {
          console.error('Error fetching user data:', error.message);
        }
      },
      async fetchDropdownData() {
        try {
          const { data: distritosData } = await supabase.from('distrito').select('id_distrito, nombre_distrito');
          const { data: paisesData } = await supabase.from('pais').select('id_pais, nombre_pais');
  
          this.distritos = distritosData || [];
          this.paises = paisesData || [];
        } catch (error) {
          console.error('Error fetching dropdown data:', error.message);
        }
      },
      async fetchClients() {
        try {
          const { data, error } = await supabase
            .from('cliente')
            .select(`
              id_cliente, nombre, apellido, email, telefono, direccion,
              id_distrito (nombre_distrito),
              id_pais (nombre_pais)
            `)
            .eq('broker_asociado', this.id_broker);
          if (error) throw error;
  
          this.clients = data.map(cliente => ({
            id_cliente: cliente.id_cliente,
            nombre: cliente.nombre,
            apellido: cliente.apellido,
            email: cliente.email,
            telefono: cliente.telefono,
            direccion: cliente.direccion,
            id_distrito: cliente.id_distrito ? cliente.id_distrito : null,
            id_pais: cliente.id_pais ? cliente.id_pais : null,
            distrito_nombre: cliente.id_distrito ? cliente.id_distrito.nombre_distrito : '',
            pais_nombre: cliente.id_pais ? cliente.id_pais.nombre_pais : '',
          }));
        } catch (error) {
          console.error('Error fetching clients:', error.message);
        }
      },
      openAddClientForm() {
        this.selectedClient = {
          nombre: '',
          apellido: '',
          email: '',
          telefono: '',
          direccion: '',
          id_distrito: null,
          id_pais: null
        };
        this.isEditing = false;
        this.showOverlay = true;
      },
      editClient(cliente) {
        this.selectedClient = { ...cliente };
        this.isEditing = true;
        this.showOverlay = true;
      },
      async addClient(clientData) {
        try {
          const clientRecord = {
            nombre: clientData.nombre,
            apellido: clientData.apellido,
            email: clientData.email,
            telefono: clientData.telefono,
            direccion: clientData.direccion,
            id_distrito: clientData.id_distrito,
            id_pais: clientData.id_pais,
            broker_asociado: this.id_broker
          };
  
          const { data, error } = await supabase.from('cliente').insert([clientRecord]);
          if (error) throw error;
  
          this.showOverlay = false;
          await this.fetchClients();
        } catch (error) {
          console.error('Error adding client:', error.message);
        }
      },
      async updateClient(clientData) {
        try {
          const { error } = await supabase.from('cliente')
            .update({
              nombre: clientData.nombre,
              apellido: clientData.apellido,
              email: clientData.email,
              telefono: clientData.telefono,
              direccion: clientData.direccion,
              id_distrito: clientData.id_distrito,
              id_pais: clientData.id_pais,
            })
            .eq('id_cliente', clientData.id_cliente);
          if (error) throw error;
  
          this.showOverlay = false;
          this.isEditing = false;
          await this.fetchClients();
        } catch (error) {
          console.error('Error updating client:', error.message);
        }
      },
      async deleteClient(id_cliente) {
        try {
          const { error } = await supabase.from('cliente').delete().eq('id_cliente', id_cliente);
          if (error) throw error;
  
          await this.fetchClients();
        } catch (error) {
          console.error('Error deleting client:', error.message);
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
  /* Estilos para mantener la consistencia con el componente de Solicitudes */
  .clientes-table img.action-icon {
    width: 24px;
    height: 24px;
    cursor: pointer;
    margin: 0 5px;
  }
  .clientes-table img.action-icon:hover {
    opacity: 0.7;
  }
  
  .clientes {
    padding: 2rem;
  }
  .table-container {
    margin-top: 2rem;
  }
  .clientes-table {
    width: 100%;
    border-collapse: collapse;
  }
  .clientes-table th,
  .clientes-table td {
    padding: 0.75rem;
    text-align: left;
    border: 1px solid #ddd;
  }
  
  .clientes-table th {
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
  .add-client-container {
    margin-top: 1rem;
    text-align: center;
  }
  .add-client-button {
    background-color: #1ab188;
    border: none;
    color: white;
    padding: 0.5rem 1rem;
    cursor: pointer;
    transition: background 0.2s ease-in-out;
  }
  .add-client-button:hover {
    background-color: #0b9185;
  }
  </style>
  
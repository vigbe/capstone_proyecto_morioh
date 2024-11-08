<template>
    <NavBar />
    <div class="detalle-solicitud">
      <h2 class="detalle-solicitud-title">Detalles de la Solicitud</h2>
      <div class="card" v-if="solicitud">
        <div class="card-section">
          <h3>Información de la Solicitud</h3>
          <p><strong>ID Solicitud:</strong> {{ solicitud.id_solicitud }}</p>
          <p><strong>Fecha:</strong> {{ solicitud.fecha_solicitud }}</p>
          <p><strong>Estado:</strong> {{ solicitud.estado }}</p>
          <p><strong>Tipo:</strong> {{ solicitud.tipo }}</p>
        </div>
  
        <div class="card-section">
          <h3>Cliente</h3>
          <p><strong>Nombre:</strong> {{ solicitud.cliente_nombre }}</p>
          <p><strong>Email:</strong> {{ solicitud.cliente_email }}</p>
          <p><strong>Teléfono:</strong> {{ solicitud.cliente_telefono }}</p>
          <p><strong>Dirección:</strong> {{ solicitud.cliente_direccion }}</p>
          <p><strong>Distrito:</strong> {{ solicitud.cliente_distrito }}</p>
          <p><strong>País:</strong> {{ solicitud.cliente_pais }}</p>
        </div>
  
        <div class="card-section">
          <h3>Información Adicional</h3>
          <p><strong>Broker:</strong> {{ solicitud.broker_nombre }}</p>
          <p><strong>Inmobiliaria:</strong> {{ solicitud.inmobiliaria_nombre }}</p>
          <p><strong>Propiedad:</strong> {{ solicitud.propiedad_titulo }}</p>
        </div>
      </div>
  
      <!-- Botones de acciones para la solicitud -->
      <div class="action-buttons">
        <button @click="takeRequest" class="action-button">Tomar Solicitud</button>
        <button @click="approveRequest" class="action-button">Aprobar Solicitud</button>
        <button @click="showRechazoOverlay = true" class="action-button">Rechazar Solicitud</button>
        <button @click="showOverlay = true" class="action-button">Agregar Archivo</button>
      </div>
  
      <!-- Overlay de subida de archivos -->
      <UploadFileOverlay
        v-if="showOverlay"
        :idSolicitud="solicitud.id_solicitud"
        @close="showOverlay = false"
        @fileUploaded="fetchArchivos"
      />
  
      <!-- Tabla de Archivos de la Solicitud -->
      <div class="archivos-section">
        <h3>Archivos Asociados a la Solicitud</h3>
        <table class="archivos-table">
          <thead>
            <tr>
              <th>Archivo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="archivo in archivos" :key="archivo.id">
              <td>{{ archivo.nombre }}</td>
              <td><a :href="archivo.url" target="_blank" class="download-link">Descargar</a></td>
            </tr>
          </tbody>
        </table>
      </div>
    <!-- Overlay de rechazo -->
    <RechazoOverlay
      v-if="showRechazoOverlay"
      @close="showRechazoOverlay = false"
      @rechazoSubmitted="handleRechazo"
    />
  </div>
</template>

<script>
import supabase from '../../supabase';
import NavBar from '../NavBar.vue';
import RechazoOverlay from './RechazoOverlay.vue';

export default {
  components: { NavBar, RechazoOverlay },
    props: ['id_solicitud'],
    data() {
      return {
        solicitud: null,
        archivos: [], // Datos de archivos
        userType: JSON.parse(localStorage.getItem('user')).type,
        userId: JSON.parse(localStorage.getItem('user')).id,
        showOverlay: false,
        showRechazoOverlay: false,
      };
    },
    async created() {
      await this.fetchSolicitudDetails();
      await this.fetchArchivos();
    },
    methods: {
      async fetchSolicitudDetails() {
        try {
          const { data, error } = await supabase
            .from('solicitud')
            .select(`
              id_solicitud, fecha_solicitud, estado, tipo,
              id_inmobiliaria, id_cliente,
              cliente:id_cliente (
                nombre, apellido, email, telefono, direccion,
                distrito:id_distrito(nombre_distrito),
                pais:id_pais(nombre_pais)
              ),
              broker:id_broker (nombre),
              inmobiliaria:id_inmobiliaria (nombre),
              propiedad:id_propiedad (titulo)
            `)
            .eq('id_solicitud', this.id_solicitud)
            .single();
          if (error) throw error;
  
          this.solicitud = {
            id_solicitud: data.id_solicitud,
            fecha_solicitud: data.fecha_solicitud,
            estado: data.estado,
            tipo: data.tipo,
            id_inmobiliaria: data.id_inmobiliaria,
            id_cliente: data.id_cliente,
            cliente_nombre: data.cliente ? `${data.cliente.nombre} ${data.cliente.apellido}` : '',
            cliente_email: data.cliente ? data.cliente.email : '',
            cliente_telefono: data.cliente ? data.cliente.telefono : '',
            cliente_direccion: data.cliente ? data.cliente.direccion : '',
            cliente_distrito: data.cliente ? data.cliente.distrito.nombre_distrito : '',
            cliente_pais: data.cliente ? data.cliente.pais.nombre_pais : '',
            broker_nombre: data.broker ? data.broker.nombre : '',
            inmobiliaria_nombre: data.inmobiliaria ? data.inmobiliaria.nombre : '',
            propiedad_titulo: data.propiedad ? data.propiedad.titulo : '',
          };
        } catch (error) {
          console.error('Error fetching solicitud details:', error.message);
        }
      },
  
      async fetchArchivos() {
        try {
          const { data, error } = await supabase
            .from('Archivos')
            .select('id, url')
            .eq('id_solicitud', this.id_solicitud);
  
          if (error) throw error;
  
          this.archivos = data.map(archivo => ({
            id: archivo.id,
            url: archivo.url,
            nombre: archivo.url.split('/').pop(), // Obtiene el nombre del archivo de la URL
          }));
        } catch (error) {
          console.error('Error fetching archivos:', error.message);
        }
      },
  
      async takeRequest() {
        await this.updateSolicitudEstado('En Proceso');
      },
  
      async approveRequest() {
        if (this.solicitud.tipo === "Nuevo Cliente") {
          await this.updateClientApprovalStatus(true);
        }
        await this.updateSolicitudEstado('Aprobada');
      },
  
      async rejectRequest() {
        if (this.solicitud.tipo === "Nuevo Cliente") {
          await this.updateClientApprovalStatus(false);
        }
        await this.updateSolicitudEstado('Rechazado');
      },
  
      async updateClientApprovalStatus(approvedStatus) {
        try {
          const { error } = await supabase
            .from('cliente')
            .update({ Aprobado_Inmobiliaria: approvedStatus })
            .eq('id_cliente', this.solicitud.id_cliente);
  
          if (error) throw error;
  
          alert(`El cliente ha sido ${approvedStatus ? "aprobado" : "desaprobado"} exitosamente.`);
        } catch (error) {
          console.error('Error al actualizar el estado de aprobación del cliente:', error.message);
        }
      },
  
      async updateSolicitudEstado(nuevoEstado) {
        try {
          const { error } = await supabase
            .from('solicitud')
            .update({ estado: nuevoEstado })
            .eq('id_solicitud', this.solicitud.id_solicitud);
  
          if (error) throw error;
  
          this.solicitud.estado = nuevoEstado;
          alert(`La solicitud ha sido actualizada a: ${nuevoEstado}`);
        } catch (error) {
          console.error('Error al actualizar el estado de la solicitud:', error.message);
        }
      },
  
      handleFileUploaded() {
        this.showOverlay = false;
        this.fetchArchivos(); // Actualiza la lista de archivos después de la subida
        alert('Archivo subido y guardado correctamente.');
      },
      async rejectRequest(comentario) {
      try {
        const { error } = await supabase
          .from('solicitud')
          .update({ estado: 'Rechazado', comentario_rechazo: comentario })
          .eq('id_solicitud', this.solicitud.id_solicitud);

        if (error) throw error;

        this.solicitud.estado = 'Rechazado';
        alert('La solicitud ha sido rechazada.');
      } catch (error) {
        console.error('Error al rechazar la solicitud:', error.message);
      }
    },
    handleRechazo(comentario) {
      this.rejectRequest(comentario);
      this.showRechazoOverlay = false;
    },
  },
  };
  </script>
  
  <style scoped>
  /* Estilos del componente */
  .detalle-solicitud {
    padding: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: linear-gradient(135deg, #e0f7fa, #b2ebf2, #80deea);
    min-height: 100vh;
  }
  
  .detalle-solicitud-title {
    color: white;
    background: linear-gradient(90deg, #1ab188, #0b9185);
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    text-transform: uppercase;
    font-weight: bold;
    font-size: 1.8rem;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.3);
    margin-bottom: 1.5rem;
    transition: transform 0.3s ease;
  }
  
  .card {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    width: 100%;
    max-width: 600px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    height: 80%;
    overflow-y: auto;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  
  .card:hover {
    transform: translateY(-10px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  }
  
  .card-section {
    padding: 1rem;
    border-left: 4px solid #1ab188;
    border-radius: 4px;
    background-color: #f7f7f7;
  }
  
  .card-section h3 {
    color: #0b9185;
    margin-bottom: 0.5rem;
  }
  
  p strong {
    color: #1ab188;
  }
  
  .action-buttons {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
  }
  
  .action-button {
    background-color: #1ab188;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.3s ease;
  }
  
  .action-button:hover {
    background-color: #0b9185;
  }
  
  .archivos-section {
    margin-top: 2rem;
    width: 100%;
    max-width: 600px;
  }
  
  .archivos-table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .archivos-table th,
  .archivos-table td {
    padding: 0.75rem;
    border: 1px solid #ddd;
  }
  
  .archivos-table th {
    background-color: #1ab188;
    color: white;
  }
  
  .download-link {
    color: #1ab188;
    text-decoration: none;
    font-weight: bold;
  }
  
  .download-link:hover {
    text-decoration: underline;
  }
  </style>
  
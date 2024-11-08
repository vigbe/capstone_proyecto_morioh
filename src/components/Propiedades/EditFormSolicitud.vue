<template>
    <div class="overlay" v-if="visible">
      <div class="overlay-content">
        <h3>{{ isEditing ? 'Editar Solicitud' : 'Nueva Solicitud' }}</h3>
        <form @submit.prevent="submitForm">
          
          <!-- Campo Tipo de Solicitud -->
          <div class="form-group">
            <label for="tipo">Tipo de Solicitud</label>
            <select v-model="solicitud.tipo" id="tipo" required @change="handleTipoChange">
              <option disabled value="">Seleccione un tipo</option>
              <option value="Nuevo Cliente">Nuevo Cliente</option>
              <option value="Venta">Venta</option>
              <option value="Agendamiento">Agendamiento</option>
            </select>
          </div>
  
          <!-- Campo Cliente (siempre visible) -->
          <div class="form-group">
            <label for="cliente">Cliente</label>
            <select v-model="solicitud.cliente_id" id="id_cliente" required>
              <option disabled value="">Seleccione un cliente</option>
              <option v-for="cliente in clientes" :key="cliente.id_cliente" :value="cliente.id_cliente">
                {{ cliente.nombre }} {{ cliente.apellido }}
              </option>
            </select>
          </div>
  
          <div class="form-group">
              <label for="inmobiliaria">Inmobiliaria</label>
              <select v-model="solicitud.id_inmobiliaria" id="id_inmobiliaria" @change="filterProperties" required>
                <option disabled value="">Seleccione una inmobiliaria</option>
                <option v-for="inmobiliaria in inmobiliarias" :key="inmobiliaria.id_inmobiliaria" :value="inmobiliaria.id_inmobiliaria">
                  {{ inmobiliaria.nombre }}
                </option>
              </select>
            </div>

          <!-- Campos adicionales si el tipo de solicitud es Venta o Agendamiento -->
          <template v-if="solicitud.tipo === 'Venta' || solicitud.tipo === 'Agendamiento'">
            <div class="form-group">
              <label for="broker">Broker</label>
              <select v-model="solicitud.id_broker" id="id_broker" required>
                <option disabled value="">Seleccione un broker</option>
                <option v-for="broker in brokers" :key="broker.id_broker" :value="broker.id_broker">
                  {{ broker.nombre }}
                </option>
              </select>
            </div>
  
            <div class="form-group">
              <label for="propiedad">Propiedad</label>
              <select v-model="solicitud.id_propiedad" id="id_propiedad" required>
                <option disabled value="">Seleccione una propiedad</option>
                <option v-for="propiedad in filteredProperties" :key="propiedad.id_propiedad" :value="propiedad.id_propiedad">
                  {{ propiedad.titulo }}
                </option>
              </select>
            </div>
          </template>
  
          <!-- Botones de acción -->
          <div class="form-group">
            <button type="submit">{{ isEditing ? 'Guardar Cambios' : 'Agregar Solicitud' }}</button>
            <button type="button" @click="$emit('close')">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      visible: Boolean,
      isEditing: Boolean,
      solicitudData: Object,
      clientes: Array,
      brokers: Array,
      inmobiliarias: Array,
      propiedades: Array,
      userType: String,
    },
    data() {
      return {
        solicitud: {
          tipo: '',
          id_cliente: null,
          id_broker: null,
          id_inmobiliaria: null,
          id_propiedad: null,
        },
        filteredProperties: [],
      };
    },
    watch: {
      solicitudData: {
        immediate: true,
        handler(solicitudData) {
        if (this.isEditing) {
            this.solicitud = { 
                ...solicitudData
             };
            console.log(solicitudData);
        } else if (!this.isEditing) {
            this.solicitud = {
                tipo: '',
                id_cliente: null,
                id_broker: null,
                id_inmobiliaria: null,
                id_propiedad: null,
            };
        }
      },
      },
    },
    methods: {
      handleTipoChange() {
        // Si el tipo es "Nuevo Cliente", limpia los campos adicionales
        if (this.solicitud.tipo === 'Nuevo Cliente') {
          this.solicitud.id_broker = null;
          this.solicitud.id_inmobiliaria = null;
          this.solicitud.id_propiedad = null;
        }
      },
      filterProperties() {
        // Filtra propiedades según la inmobiliaria seleccionada
        this.filteredProperties = this.propiedades.filter(
          propiedad => propiedad.id_inmobiliaria === this.solicitud.id_inmobiliaria
        );
      },
      submitForm() {
        this.$emit(this.isEditing ? 'update-solicitud' : 'add-solicitud', { ...this.solicitud });
      },
    },
  };
  </script>
  
  <style scoped>
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
  .form-group {
    margin-bottom: 1rem;
  }
  </style>
  
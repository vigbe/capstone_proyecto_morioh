<template>
  <div class="overlay" v-if="visible">
    <div class="overlay-content">
      <h3 class="form-title">{{ isEditing ? 'Editar Solicitud' : 'Nueva Solicitud' }}</h3>
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

        <!-- Campo Cliente -->
        <div class="form-group">
          <label for="cliente">Cliente</label>
          <select v-model="solicitud.id_cliente" id="id_cliente" required>
            <option disabled value="">Seleccione un cliente</option>
            <option v-for="cliente in clientes" :key="cliente.id_cliente" :value="cliente.id_cliente">
              {{ cliente.nombre }} {{ cliente.apellido }}
            </option>
          </select>
        </div>

        <!-- Campo Inmobiliaria -->
        <div class="form-group">
          <label for="inmobiliaria">Inmobiliaria</label>
          <select v-model="solicitud.id_inmobiliaria" id="id_inmobiliaria" @change="filterProperties" :disabled="solicitud.tipo === 'Nuevo Cliente'" required>
            <option disabled value="">Seleccione una inmobiliaria</option>
            <option v-for="inmobiliaria in inmobiliarias" :key="inmobiliaria.id_inmobiliaria" :value="inmobiliaria.id_inmobiliaria">
              {{ inmobiliaria.nombre }}
            </option>
          </select>
        </div>

        <!-- Campos adicionales para Venta o Agendamiento -->
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
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">{{ isEditing ? 'Guardar Cambios' : 'Agregar Solicitud' }}</button>
          <button type="button" class="btn btn-secondary" @click="$emit('close')">Cancelar</button>
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
          this.solicitud = { ...solicitudData };
        } else {
          this.resetForm();
        }
      },
    },
  },
  methods: {
    handleTipoChange() {
      if (this.solicitud.tipo === 'Nuevo Cliente') {
        this.solicitud.id_broker = null;
        this.solicitud.id_inmobiliaria = null;
        this.solicitud.id_propiedad = null;
      }
    },
    filterProperties() {
      this.filteredProperties = this.propiedades.filter(
        propiedad => propiedad.id_inmobiliaria === this.solicitud.id_inmobiliaria
      );
    },
    resetForm() {
      this.solicitud = {
        tipo: '',
        id_cliente: null,
        id_broker: null,
        id_inmobiliaria: null,
        id_propiedad: null,
      };
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
  border-radius: 10px;
  width: 450px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.form-title {
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  text-align: center;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  font-weight: bold;
  margin-bottom: 0.5rem;
  display: block;
  color: #555;
}

select,
input {
  width: 100%;
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  outline: none;
  transition: border-color 0.3s;
}

select:hover,
input:hover {
  border-color: #1ab188;
}

select:focus,
input:focus {
  border-color: #1ab188;
  box-shadow: 0 0 5px rgba(26, 177, 136, 0.5);
}

.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 1.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  font-size: 1rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
}

.btn-primary {
  background-color: #1ab188;
  color: white;
}

.btn-primary:hover {
  background-color: #159c80;
}

.btn-secondary {
  background-color: #f5f5f5;
  color: #555;
}

.btn-secondary:hover {
  background-color: #e0e0e0;
}
</style>

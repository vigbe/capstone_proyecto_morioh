<template>
  <NavBar />
  <div class="detalle-propiedad-container">
    <div class="detalle-propiedad" v-if="propiedad">
      <div class="detalle-contenido">
        <div class="carousel">
          <div
            class="carousel-inner"
            :style="{ transform: `translateX(-${currentSlide * 100}%)` }"
          >
            <div
              class="carousel-item"
              v-for="(foto, index) in (propiedad.fotos || [])"
              :key="index"
            >
              <img :src="foto.url" alt="Imagen de propiedad" />
            </div>
          </div>
          <button
            v-if="currentSlide > 0"
            class="carousel-control prev"
            @click="prevSlide"
          >
            &#10094;
          </button>
          <button
            v-if="currentSlide < (propiedad.fotos?.length || 0) - 1"
            class="carousel-control next"
            @click="nextSlide"
          >
            &#10095;
          </button>
        </div>
        <div class="detalle-info">
          <h1>{{ propiedad.titulo }}</h1>
          <h2>${{ formatPrecio(propiedad.precio) }}</h2>
          <p>Ubicación: {{ propiedad.ubicacion }}</p>
          <p>Estado: {{ propiedad.estado }}</p>
          <p>Stock: {{ propiedad.stock }}</p>
          <button class="venta-button" @click="openVentaModal">Venta</button>
        </div>
      </div>
      <div class="detalle-descripcion">
        <h3>Descripción</h3>
        <p>{{ propiedad.descripcion }}</p>
        <div class="detalle-icons">
          <div><i class="fas fa-bath"></i> Baños: {{ propiedad.num_banos }}</div>
          <div><i class="fas fa-bed"></i> Habitaciones: {{ propiedad.num_habitaciones }}</div>
          <div><i class="fas fa-car"></i> Estacionamientos: {{ propiedad.estacionamientos }}</div>
          <div><i class="fas fa-ruler-combined"></i> Superficie Total: {{ propiedad.superficie_total }} m²</div>
          <div><i class="fas fa-ruler"></i> Superficie Útil: {{ propiedad.superficie_util }} m²</div>
        </div>
      </div>
    </div>
    <div v-else class="loading">
      Cargando propiedad...
    </div>

    <!-- Modal para crear la solicitud -->
    <div v-if="showVentaModal" class="modal-overlay">
      <div class="modal">
        <h2>Nueva Solicitud de Venta</h2>
        <form @submit.prevent="createVentaSolicitud">
          <div class="form-group">
            <label for="cliente">Cliente:</label>
            <select v-model="nuevaSolicitud.id_cliente" required>
              <option value="" disabled>Seleccione un cliente</option>
              <option
                v-for="cliente in clientes"
                :key="cliente.id_cliente"
                :value="cliente.id_cliente"
              >
                {{ cliente.nombre }} {{ cliente.apellido }}
              </option>
            </select>
          </div>
          <button type="submit" class="submit-button">Crear Solicitud</button>
          <button type="button" class="close-button" @click="closeVentaModal">
            Cancelar
          </button>
        </form>
      </div>
    </div>
  </div>
</template>


<script>
import NavBar from "../NavBar.vue";
import supabase from "../../supabase";

export default {
  components: { NavBar },
  data() {
    return {
      propiedad: null,
      currentSlide: 0,
      showVentaModal: false,
      nuevaSolicitud: {
        fecha_solicitud: new Date(),
        tipo: "Venta",
        id_propiedad: null,
        id_cliente: null,
        id_broker: null,
        id_inmobiliaria: null,
        estado: "Nueva Solicitud",
      },
      clientes: [], // Lista de clientes para seleccionar
    };
  },
  methods: {
    async fetchPropiedad() {
      try {
        const { id_propiedad } = this.$route.params;
        const { data, error } = await supabase
          .from("propiedad")
          .select("*, foto(*)")
          .eq("id_propiedad", id_propiedad)
          .single();

        if (error) throw error;
        this.propiedad = {
          ...data,
          fotos: data.foto ? data.foto : [],
        };
      } catch (error) {
        console.error("Error al cargar la propiedad:", error.message);
      }
    },
    async fetchClientes() {
      try {
        const { data, error } = await supabase.from("cliente").select("*");
        if (error) throw error;
        this.clientes = data;
      } catch (error) {
        console.error("Error al cargar los clientes:", error.message);
      }
    },
    openVentaModal() {
      // Precarga los datos de la solicitud
      this.nuevaSolicitud.id_propiedad = this.propiedad.id_propiedad;
      this.nuevaSolicitud.id_broker = JSON.parse(
        localStorage.getItem("user")
      ).id_broker;
      this.nuevaSolicitud.id_inmobiliaria = this.propiedad.id_inmobiliaria;
      this.showVentaModal = true;
    },
    closeVentaModal() {
      this.showVentaModal = false;
    },
    async createVentaSolicitud() {
  try {
    // Inserta la nueva solicitud en la tabla "solicitud"
    const { error } = await supabase
      .from("solicitud")
      .insert([this.nuevaSolicitud]);

    if (error) throw error;

    // Actualiza el stock de la propiedad
    const nuevoStock = this.propiedad.stock - 1;
    const { error: stockError } = await supabase
      .from("propiedad")
      .update({ stock: nuevoStock })
      .eq("id_propiedad", this.propiedad.id_propiedad);

    if (stockError) throw stockError;

    // Actualiza el stock en el componente para reflejar el cambio
    this.propiedad.stock = nuevoStock;

    alert("Solicitud creada exitosamente. El stock se ha actualizado.");
    this.closeVentaModal();
  } catch (error) {
    console.error("Error al crear la solicitud o actualizar el stock:", error.message);
  }
},

    prevSlide() {
      if (this.currentSlide > 0) {
        this.currentSlide--;
      }
    },
    nextSlide() {
      if (this.currentSlide < this.propiedad.fotos.length - 1) {
        this.currentSlide++;
      }
    },
    formatPrecio(precio) {
      return precio.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    },
  },
  async created() {
    await this.fetchPropiedad();
    await this.fetchClientes();
  },
};
</script>


<style scoped>
.detalle-propiedad-container {
  max-width: 80%;
  margin: 0 auto;
  padding: 2rem 0;
  display: flex;
  justify-content: center;
}

.detalle-propiedad {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.detalle-contenido {
  display: flex;
  border-bottom: 1px solid #ddd;
}

.carousel {
  position: relative;
  width: 60%;
  height: 400px;
  overflow: hidden;
}

.carousel-inner {
  display: flex;
  transition: transform 0.5s ease-in-out;
}

.carousel-item {
  min-width: 100%;
  height: 100%;
}

.carousel-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.carousel-control {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  font-size: 1.5rem;
  z-index: 2;
}

.carousel-control.prev {
  left: 10px;
}

.carousel-control.next {
  right: 10px;
}

.detalle-info {
  padding: 2rem;
  flex: 1;
  font-size: 1.2rem;
}

.detalle-info h1 {
  margin: 0;
}

.detalle-info h2 {
  color: #1ab188;
  margin: 1rem 0;
}

.detalle-info p {
  margin: 0.5rem 0;
}

.detalle-descripcion {
  padding: 2rem;
}

.detalle-icons {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  margin-top: 1rem;
}

.detalle-icons div {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.2rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 400px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  text-align: center;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
}

.form-group select {
  width: 100%;
  padding: 0.5rem;
  font-size: 1rem;
}

.submit-button,
.close-button {
  padding: 0.5rem 1rem;
  margin-top: 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.submit-button {
  background-color: #1ab188;
  color: white;
}

.close-button {
  background-color: #ccc;
  color: black;
}
</style>

<template>
  <NavBar />
  <div class="marketplace">
    <div class="filters">
      <h2>Filtros</h2>
      <label>
        Tipo de Propiedad:
        <select v-model="filters.tipo" @change="applyFilters">
          <option value="">Todos</option>
          <option value="Casa">Casa</option>
          <option value="Departamento">Departamento</option>
        </select>
      </label>
      <label>
        Precio Máximo:
        <input
          type="number"
          v-model="filters.precioMaximo"
          placeholder="Ej: 1000000"
          @input="applyFilters"
        />
      </label>
      <label>
        País:
        <select v-model="filters.pais" @change="filterDistritos">
          <option value="">Todos</option>
          <option v-for="pais in paises" :key="pais.id" :value="pais.id">
            {{ pais.nombre }}
          </option>
        </select>
      </label>
      <label>
        Distrito:
        <select v-model="filters.distrito" @change="filterCiudades" :disabled="!filters.pais">
          <option value="">Todos</option>
          <option v-for="distrito in distritosFiltrados" :key="distrito.id" :value="distrito.id">
            {{ distrito.nombre }}
          </option>
        </select>
      </label>
      <label>
        Ciudad:
        <select v-model="filters.ciudad" @change="applyFilters" :disabled="!filters.pais || !filters.distrito">
          <option value="">Todos</option>
          <option v-for="ciudad in ciudadesFiltradas" :key="ciudad.id" :value="ciudad.id">
            {{ ciudad.nombre }}
          </option>
        </select>
      </label>
    
    </div>

    <div class="propiedades-list">
      <div v-if="loading" class="loading">Cargando propiedades...</div>
      <div v-else-if="propiedadesFiltradas.length === 0" class="no-results">
        No se encontraron propiedades.
      </div>
      <div
        v-else
        class="propiedad"
        v-for="propiedad in propiedadesFiltradas"
        :key="propiedad.id_propiedad"
        @click="goToPropertyDetail(propiedad.id_propiedad)"
      >
        <div class="propiedad-image">
          <div v-if="propiedad.fotos && propiedad.fotos.length > 0" class="carousel">
            <div
              class="carousel-inner"
              :style="{ transform: `translateX(-${currentSlide[propiedad.id_propiedad] * 100}%)` }"
            >
              <div
                class="carousel-item"
                v-for="(foto, index) in propiedad.fotos"
                :key="index"
              >
                <img :src="foto.url" :alt="foto.descripcion" />
              </div>
            </div>
            <button
              v-if="currentSlide[propiedad.id_propiedad] > 0"
              class="carousel-control prev"
              @click="prevSlide(propiedad.id_propiedad)"
            >
              &#10094;
            </button>

            <button
              v-if="currentSlide[propiedad.id_propiedad] < propiedad.fotos.length - 1"
              class="carousel-control next"
              @click="nextSlide(propiedad.id_propiedad, propiedad.fotos.length)"
            >
              &#10095;
            </button>
          </div>
        </div>
        <div class="propiedad-content">
          <h3>{{ propiedad.titulo }}</h3>
          <p>{{ propiedad.descripcion }}</p>
          <p>Precio: {{ formatPrice(propiedad.precio) }}</p>
          <p>Ubicación: {{ propiedad.ubicacion }}</p>
          <div class="property-icons">
            <div class="icon-item">
              <i class="fas fa-bath"></i> {{ propiedad.num_banos }} Baños
            </div>
            <div class="icon-item">
              <i class="fas fa-bed"></i> {{ propiedad.num_habitaciones }} Habitaciones
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import supabase from "../../supabase";
import NavBar from "../NavBar.vue";

export default {
  components: {
    NavBar,
  },
  data() {
    return {
      propiedades: [],
      paises: [],
      distritos: [],
      ciudades: [],
      filters: {
        tipo: "",
        precioMaximo: "",
        pais: "",
        distrito: "",
        ciudad: "",
      },
      loading: true,
      currentSlide: {}, // Almacena el índice del slide actual por propiedad
    };
  },
  computed: {
    propiedadesFiltradas() {
      return this.propiedades.filter((propiedad) => {
        return (
          (!this.filters.tipo || propiedad.tipo === this.filters.tipo) &&
          (!this.filters.precioMaximo || propiedad.precio <= this.filters.precioMaximo) &&
          (!this.filters.pais || propiedad.id_pais === this.filters.pais) &&
          (!this.filters.distrito || propiedad.id_distrito === this.filters.distrito) &&
          (!this.filters.ciudad || propiedad.id_ciudad === this.filters.ciudad)
        );
      });
    },
    distritosFiltrados() {
      if (!this.filters.pais) return [];
      return this.distritos.filter(
        (distrito) => distrito.id_pais === this.filters.pais
      );
  },
    ciudadesFiltradas() {
      if (!this.filters.distrito) return [];
      return this.ciudades.filter(
        (ciudad) => ciudad.id_distrito === this.filters.distrito
      );
  },

  },
  methods: {
    async fetchPropiedades() {
      try {
        const { data, error } = await supabase
          .from("propiedad")
          .select("*, foto(*)");
        if (error) {
          throw error;
        }
        this.propiedades = data.map((propiedad) => ({
          ...propiedad,
          fotos: propiedad.foto
            ? Array.isArray(propiedad.foto)
              ? propiedad.foto
              : [propiedad.foto]
            : [],
        }));

        // Inicializar el índice del slide actual para cada propiedad
        this.propiedades.forEach((propiedad) => {
          this.currentSlide[propiedad.id_propiedad] = 0;
        });
      } catch (error) {
        console.error("Error al obtener propiedades:", error.message);
      } finally {
        this.loading = false;
      }
    },
    async fetchDropdownData() {
      try {
        const { data: paisesData, error: paisesError } = await supabase
          .from("pais")
          .select("id_pais, nombre_pais");
        if (paisesError) throw paisesError;
        this.paises = paisesData.map((pais) => ({
          id: pais.id_pais,
          nombre: pais.nombre_pais,
        }));

        const { data: distritosData, error: distritosError } = await supabase
          .from("distrito")
          .select("id_distrito, nombre_distrito, id_pais");
        if (distritosError) throw distritosError;
        this.distritos = distritosData.map((distrito) => ({
          id: distrito.id_distrito,
          nombre: distrito.nombre_distrito,
          id_pais: distrito.id_pais,
        }));

        const { data: ciudadesData, error: ciudadesError } = await supabase
          .from("ciudad")
          .select("id, nombre, id_distrito");
        if (ciudadesError) throw ciudadesError;
        this.ciudades = ciudadesData.map((ciudad) => ({
          id: ciudad.id,
          nombre: ciudad.nombre,
          id_distrito: ciudad.id_distrito,
        }));
      } catch (error) {
        console.error("Error fetching dropdown data:", error.message);
      }
    },
    filterDistritos() {
      this.filters.distrito = ""; // Reiniciar el filtro de distrito
      this.filters.ciudad = ""; // Reiniciar el filtro de ciudad
    },
    filterCiudades() {
      this.filters.ciudad = ""; // Reiniciar el filtro de ciudad
    },
    applyFilters() {
      this.loading = true; // Mostrar indicador de carga al aplicar filtros
      setTimeout(() => {
        this.loading = false; // Ocultar indicador después de un retraso
      }, 500); // Simular un retraso de 500 ms
    },

    formatPrice(value) {
      if (!value) return "$0";
      return new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        minimumFractionDigits: 0, // Sin decimales
      }).format(value);
    },

    goToPropertyDetail(id) {
      this.$router.push({ name: "DetallePropiedad", params: { id_propiedad: id } });
    },

    prevSlide(propiedadId) {
      if (this.currentSlide[propiedadId] > 0) {
        this.currentSlide[propiedadId]--;
      }
    },
    nextSlide(propiedadId, totalSlides) {
      if (this.currentSlide[propiedadId] < totalSlides - 1) {
        this.currentSlide[propiedadId]++;
      }
    },
  },
  async created() {
    await this.fetchDropdownData();
    await this.fetchPropiedades();
  },
};
</script>



<style scoped>
.marketplace {
  padding: 2rem;
}

.filters {
  margin-bottom: 2rem;
  background: #f9f9f9; /* Fondo claro */
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); /* Sombra suave */
  display: grid; /* Usar CSS Grid */
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); /* Dos filtros por fila */
  gap: 1rem; /* Espacio entre filtros */
  align-items: center; /* Alinear verticalmente los elementos */
}

.filters h2 {
  grid-column: span 2; /* Hacer que el título ocupe toda la fila */
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 1rem;
}

.filters label {
  display: flex;
  flex-direction: column;
  font-size: 14px;
  color: #555;
}

.filters select,
.filters input {
  padding: 0.8rem;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 5px;
  outline: none;
  transition: border-color 0.3s;
}

.filters select:hover,
.filters input:hover {
  border-color: #007BFF;
}

.filters select:focus,
.filters input:focus {
  border-color: #007BFF;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
}



.propiedades-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.propiedad {
  background: white;
  padding: 1rem;
  border-radius: 5px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); /* Sombra suave */
  margin-bottom: 2rem;
  transition: transform 0.3s, box-shadow 0.3s; /* Animación suave para hover */
}

.propiedad:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2); /* Más sombra al hacer hover */
  transform: translateY(-5px); /* Pequeño efecto de elevación */
}


.propiedad-image {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 300px;
}

.carousel {
  position: relative;
  width: 100%; /* Asegura que el carrusel ocupa todo el espacio disponible */
  height: 300px; /* Ajusta según sea necesario */
  overflow: hidden; /* Previene que elementos adicionales se muestren fuera del carrusel */
  z-index: 0; /* Asegura que no tape otros elementos */
}

.carousel-inner {
  display: flex;
  transform: translateX(0);
  transition: transform 0.5s ease-in-out;
  width: 100%; /* Asegura que ocupa todo el contenedor */
  overflow: visible;/* Evita que el contenido adicional sobresalga */
  z-index: 1; /* Las imágenes deben estar visibles */
  align-items: center;
}

.carousel-item {
  min-width: 100%; /* Cada slide ocupa el 100% del ancho del contenedor */
  height: 100%; /* Se adapta a la altura del carrusel */
  position: relative; /* Garantiza que las imágenes se posicionen dentro del slide */

}

.carousel-item img {
  width: 100%; /* Asegura que las imágenes se expandan completamente */
  height: 100%;
  object-fit: cover; /* Ajusta las imágenes sin distorsionarlas */
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
  z-index: 2; /* Los controles deben estar encima */
}

.carousel-control.prev {
  left: 10px;
}

.carousel-control.next {
  right: 10px;
}

.loading {
  text-align: center;
  color: #1ab188;
}

.no-results {
  text-align: center;
  color: #ff6b6b;
}

.propiedad-content {
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.propiedad-content h4 {
  font-size: 14px;
  color: #888;
  margin: 0;
}

.propiedad-content h2 {
  font-size: 18px;
  margin: 5px 0;
  font-weight: bold;
  color: #333;
}

.propiedad-precio {
  font-size: 20px;
  color: #007BFF;
  margin: 10px 0;
  font-weight: bold;
}

.badge {
  display: inline-block;
  background: #007BFF;
  color: #fff;
  padding: 4px 10px;
  font-size: 12px;
  border-radius: 4px;
  font-weight: bold;
}

.propiedad-content p {
  margin: 5px 0;
  font-size: 14px;
  color: #555;
}

.propiedad-content p:last-of-type {
  font-style: italic;
  color: #888;
}

.property-icons {
  display: flex;
  gap: 1rem;
  margin-top: 10px;
}

.icon-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 14px;
  color: #555;
}

.icon-item i {
  font-size: 18px;
  color: #1ab188;
}

</style>

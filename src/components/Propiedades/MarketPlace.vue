<template>
  <NavBar />
  <div class="marketplace">
    <div class="filters">
      <h2>Filtros</h2>
      <label>
        Tipo de Propiedad:
        <select v-model="filters.tipo">
          <option value="">Todos</option>
          <option value="Casa">Casa</option>
          <option value="Departamento">Departamento</option>
        </select>
      </label>
      <label>
        Precio Máximo:
        <input type="number" v-model="filters.precioMaximo" placeholder="Ej: 1000000" />
      </label>
      <label>
        Ubicación:
        <input type="text" v-model="filters.ubicacion" placeholder="Ej: Santiago" />
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
              class="carousel-control prev"
              @click="prevSlide(propiedad.id_propiedad)"
              :disabled="currentSlide[propiedad.id_propiedad] === 0"
            >
              &#10094;
            </button>
            <button
              class="carousel-control next"
              @click="nextSlide(propiedad.id_propiedad, propiedad.fotos.length)"
              :disabled="currentSlide[propiedad.id_propiedad] === propiedad.fotos.length - 1"
            >
              &#10095;
            </button>
          </div>
        </div>
        <div class="propiedad-info">
          <h3>{{ propiedad.titulo }}</h3>
          <p>{{ propiedad.descripcion }}</p>
          <p>Precio: {{ propiedad.precio }}</p>
          <p>Ubicación: {{ propiedad.ubicacion }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import supabase from '../../supabase';
import NavBar from '../NavBar.vue';

export default {
  components: {
    NavBar,
  },
  data() {
    return {
      propiedades: [],
      filters: {
        tipo: '',
        precioMaximo: '',
        ubicacion: '',
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
          (!this.filters.ubicacion ||
            propiedad.ubicacion.toLowerCase().includes(this.filters.ubicacion.toLowerCase()))
        );
      });
    },
  },
  methods: {
    async fetchPropiedades() {
      try {
        const { data, error } = await supabase.from('propiedad').select('*, foto(*)');
        if (error) {
          throw error;
        }
        this.propiedades = data.map((propiedad) => ({
          ...propiedad,
          fotos: propiedad.foto ? (Array.isArray(propiedad.foto) ? propiedad.foto : [propiedad.foto]) : [],
        }));

        // Inicializar el índice del slide actual para cada propiedad
        this.propiedades.forEach((propiedad) => {
          this.currentSlide[propiedad.id_propiedad] = 0; // Inicializar directamente
        });
      } catch (error) {
        console.error('Error al obtener propiedades:', error.message);
      } finally {
        this.loading = false;
      }
    },
    prevSlide(propiedadId) {
      if (this.currentSlide[propiedadId] > 0) {
        this.currentSlide[propiedadId]--;
        console.log('Slide anterior:', this.currentSlide[propiedadId]);
      }
    },
    nextSlide(propiedadId, totalSlides) {
      if (this.currentSlide[propiedadId] < totalSlides - 1) {
        this.currentSlide[propiedadId]++;
        this.$nextTick(() => {
          const container = document.querySelector('.carousel-inner');
          container.style.display = 'none'; // Ocultar temporalmente
          container.offsetHeight; // Forzar un reflujo
          container.style.display = ''; // Mostrar nuevamente
        });
      }
    },
  },
  async created() {
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
  background: rgba(19, 35, 47, 0.9);
  padding: 1rem;
  border-radius: 5px;
  color: white;
}

.filters label {
  display: block;
  margin-bottom: 1rem;
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
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
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
</style>

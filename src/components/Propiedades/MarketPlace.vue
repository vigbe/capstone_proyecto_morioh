<template>
    <div class="marketplace">
      <nav class="nav-bar">
      <div class="user-info-container">
        <div class="user-info">
        </div>
        <div class="company-name">
          <span>LUVI Brokers</span>
        </div>
      </div>
      <div class="menu-container">
        <div class="menu-items">
          <router-link to="/home" class="menu-item">Home</router-link>
          <router-link to="/solicitudes" class="menu-item">Solicitudes</router-link>
          <router-link to="/marketplace" class="menu-item">Marketplace</router-link>
          <router-link to="/clientes" class="menu-item">Clientes</router-link>
          <router-link v-if="userType === 'Inmobiliaria'" to="/cargar-propiedades" class="menu-item">Cargar Propiedades</router-link>
        </div>
        <button @click="logout" class="logout-button">Cerrar Sesión</button>
      </div>
    </nav>
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
        <button @click="aplicarFiltros">Aplicar Filtros</button>
      </div>
  
      <div class="propiedades-list">
        <div v-if="loading" class="loading">Cargando propiedades...</div>
        <div v-else-if="propiedades.length === 0" class="no-results">No se encontraron propiedades.</div>
        <div v-else class="propiedad" v-for="propiedad in propiedadesFiltradas" :key="propiedad.id">
          <div class="propiedad-image">
            <div v-if="propiedad.fotos && propiedad.fotos.length > 0" class="carousel-wrapper">
              <swiper :options="options">
                <swiper-slide v-for="(foto, index) in propiedad.fotos" :key="index">
                  <img :src="foto.url" :alt="foto.descripcion" />
                </swiper-slide>
                <div v-if="propiedad.fotos.length > 1" class="swiper-pagination"></div>
              </swiper>
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
  import { Swiper, SwiperSlide } from 'vue-awesome-swiper';
  import 'swiper/swiper-bundle.css';
  
  
  export default {
    data() {
      return {
        propiedades: [],
        filters: {
          tipo: '',
          precioMaximo: '',
          ubicacion: '',
        },
        loading: true,
        options: {
          slidesPerView: 1,
          spaceBetween: 10,
          pagination: {
            el: '.swiper-pagination',
            clickable: true,
          },
          loop: true,
        },
      };
    },
    computed: {
      propiedadesFiltradas() {
        return this.propiedades.filter((propiedad) => {
          return (
            (!this.filters.tipo || propiedad.tipo === this.filters.tipo) &&
            (!this.filters.precioMaximo || propiedad.precio <= this.filters.precioMaximo) &&
            (!this.filters.ubicacion || propiedad.ubicacion.toLowerCase().includes(this.filters.ubicacion.toLowerCase()))
          );
        });
      },
    },
    async created() {
      await this.fetchPropiedades();
    },
    methods: {
      async fetchPropiedades() {
        try {
          const { data, error } = await supabase.from('propiedad').select('*, foto(*)');
          if (error) {
            throw error;
          }
          console.log('Fetched propiedades:', data);
          this.propiedades = data.map((propiedad) => ({
            ...propiedad,
            fotos: propiedad.foto ? (Array.isArray(propiedad.foto) ? propiedad.foto : [propiedad.foto]) : [],
          }));
        } catch (error) {
          console.error('Error al obtener propiedades:', error.message);
        } finally {
          this.loading = false;
        }
      },
      aplicarFiltros() {
        // Esto dispara el recalculo de propiedadesFiltradas
      },
    },
    components: {
      Swiper,
      SwiperSlide,
    },
  };
  </script>
  
  <style scoped>
  .marketplace {
    padding: 2rem;
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
.user-info {
  font-weight: bold;
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
    display: flex;
    flex-direction: column;
  }
  .propiedad-image {
    flex: 0 0 70%;
    overflow: hidden;
    position: relative;
  }
  .propiedad-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .propiedad-info {
    flex: 1;
    padding-top: 1rem;
  }
  .loading {
    text-align: center;
    color: #1ab188;
  }
  .no-results {
    text-align: center;
    color: #ff6b6b;
  }
  .carousel-wrapper {
    margin-top: 1rem;
    position: relative;
  }
  </style>

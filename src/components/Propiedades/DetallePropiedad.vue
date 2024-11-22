<template>
    <NavBar />
    <div class="detalle-propiedad-container">
      <div class="detalle-propiedad" v-if="propiedad">
        <div class="detalle-header">
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
    },
  };
  </script>
  
  <style scoped>
  .detalle-propiedad-container {
    max-width: 80%;
    margin: 0 auto; /* Centra horizontalmente */
    padding: 2rem 0;
  }
  
  .detalle-propiedad {
    padding: 2rem;
  }
  
  .detalle-header {
    display: flex;
    gap: 2rem;
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
    overflow: visible;
  }
  
  .carousel-item {
    min-width: 100%;
    height: 100%;
  }
  
  .carousel-item img {
    width: 100%;
    height: 550px;
    object-fit: contain;
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
    flex: 1;
    font-size: 1.2rem;
  }
  
  .detalle-info h1 {
    margin: 0;
  }
  
  .detalle-info h2 {
    color: #1ab188;
  }
  
  .detalle-info p {
    margin: 0.5rem 0;
  }
  
  .detalle-descripcion {
    margin-top: 2rem;
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
  </style>
  
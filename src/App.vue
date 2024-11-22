<template>
  <div id="app">
    <div v-if="isLoading" class="loading-overlay">
      <div class="house-animation">
        <div class="roof"></div>
        <div class="walls"></div>
        <div class="door"></div>
      </div>
      <p>Cargando...</p>
    </div>
    <router-view v-else />
  </div>
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      isLoading: false,
    };
  },
  created() {
    this.$router.beforeResolve((to, from, next) => {
      this.isLoading = true; // Mostrar la animación de carga
      next();
    });

    this.$router.afterEach(() => {
      setTimeout(() => {
        this.isLoading = false; // Ocultar la animación
      }, 500); // Ajusta el tiempo si es necesario
    });
  },
};
</script>

<style scoped>
@import "./assets/reset.css";
@import "./assets/tailwind.css";

#app {
  font-family: "Roboto", sans-serif;
}

/* Estilos de la pantalla de carga */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  color: white;
}

.house-animation {
  position: relative;
  width: 100px;
  height: 100px;
  margin-bottom: 20px;
  animation: bounce 1s infinite ease-in-out;
}

.roof {
  width: 0;
  height: 0;
  border-left: 50px solid transparent;
  border-right: 50px solid transparent;
  border-bottom: 50px solid white;
  position: absolute;
  top: 0;
  left: 0;
}

.walls {
  width: 80px;
  height: 50px;
  background: white;
  position: absolute;
  bottom: 0;
  left: 10px;
}

.door {
  width: 20px;
  height: 30px;
  background: brown;
  position: absolute;
  bottom: 0;
  left: 40px;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

p {
  font-size: 18px;
  font-weight: bold;
  text-align: center;
}
</style>

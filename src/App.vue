<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
};
</script>

<style scoped>
@import './assets/reset.css'; /* Aquí se importa el archivo reset */
@import './assets/tailwind.css'; /* Importa Tailwind CSS si estás usándolo */
#app {
  font-family: 'Roboto', sans-serif;
}
</style>


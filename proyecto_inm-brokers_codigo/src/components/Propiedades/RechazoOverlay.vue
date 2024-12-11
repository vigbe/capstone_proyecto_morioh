<!-- RechazoOverlay.vue -->
<template>
    <div class="overlay">
      <div class="overlay-content">
        <h3>Rechazar Solicitud</h3>
        <textarea v-model="comentario" placeholder="Escriba el motivo del rechazo..."></textarea>
        <div class="buttons">
          <button @click="submitRechazo">Confirmar</button>
          <button @click="$emit('close')">Cancelar</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        comentario: "", // Comentario de rechazo
      };
    },
    methods: {
      submitRechazo() {
        this.$emit("rechazoSubmitted", this.comentario); // Emitir el comentario al componente padre
        this.$emit("close"); // Cerrar el overlay
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
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .overlay-content {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    text-align: center;
    width: 300px;
    max-width: 90%;
  }
  textarea {
    width: 100%;
    height: 80px;
    margin-top: 1rem;
    padding: 0.5rem;
    border-radius: 4px;
    border: 1px solid #ccc;
    resize: none;
  }
  .buttons {
    margin-top: 1rem;
    display: flex;
    justify-content: space-between;
  }
  button {
    padding: 0.5rem 1rem;
    border: none;
    color: white;
    background-color: #1ab188;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.3s ease;
  }
  button:hover {
    background-color: #0b9185;
  }
  </style>
  
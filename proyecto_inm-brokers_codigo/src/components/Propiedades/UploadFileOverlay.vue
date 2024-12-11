<template>
    <div class="upload-overlay">
      <div class="overlay-content">
        <h3>Subir Archivo</h3>
        <input type="file" @change="handleFileChange" />
        <button @click="uploadFile" :disabled="!archivo">Subir</button>
        <button @click="$emit('close')">Cancelar</button>
      </div>
    </div>
  </template>
  
  <script>
  import supabase from '../../supabase';
  
  export default {
    props: ['idSolicitud'],
    data() {
      return {
        archivo: null,
      };
    },
    methods: {
      handleFileChange(event) {
        this.archivo = event.target.files[0];
      },
      sanitizeFileName(fileName) {
        return fileName
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "") // Elimina acentos y caracteres especiales
          .replace(/[^a-zA-Z0-9._-]/g, "_"); // Reemplaza caracteres no válidos con _
      },
      async uploadFile() {
        if (!this.archivo) return;
  
        // Normalizar el nombre del archivo antes de subirlo
        const sanitizedFileName = this.sanitizeFileName(this.archivo.name);
        const filePath = `uploads/${this.idSolicitud}/${Date.now()}_${sanitizedFileName}`;
  
        try {
          // Subir archivo a Supabase Storage
          const { data, error: uploadError } = await supabase.storage
            .from('Archivos')
            .upload(filePath, this.archivo);
  
          if (uploadError) throw uploadError;
  
          // Obtener URL pública y guardar en la tabla Archivos
          const publicUrl = supabase.storage.from('Archivos').getPublicUrl(filePath).data.publicUrl;
          const { error: insertError } = await supabase
            .from('Archivos')
            .insert([{ id_solicitud: this.idSolicitud, url: publicUrl }]);
  
          if (insertError) throw insertError;
  
          alert("Archivo subido y registrado exitosamente.");
          this.$emit("fileUploaded");
        } catch (error) {
          console.error("Error al subir el archivo:", error.message);
          alert("Error al subir el archivo. Intente nuevamente.");
        }
      },
    },
  };
  </script>
  
  <style scoped>
  .upload-overlay {
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
  }
  </style>
  
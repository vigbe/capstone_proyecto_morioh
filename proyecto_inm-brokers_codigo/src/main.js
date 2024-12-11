import { createApp } from 'vue';
import App from './App.vue';
import './assets/tailwind.css';
import "@fortawesome/fontawesome-free/css/all.min.css";
import router from './router';
import 'swiper/swiper-bundle.css';
import 'vueperslides/dist/vueperslides.css'; // Importa la hoja de estilos de VueperSlides
import '@syncfusion/ej2-vue-navigations/styles/material.css';
import VueKanban from 'vue-kanban';

createApp(App).use(router).mount('#app');

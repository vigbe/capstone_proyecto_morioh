import { createRouter, createWebHistory } from 'vue-router';
import Home from './components/Home.vue';
import Login from './components/Login.vue';
import Registro from './components/Registro.vue';
import RegistroC from './components/RegistroC.vue';

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login
  },
  {
    path: '/home',
    name: 'Home',
    component: Home
  },
  {
    path: '/registro',
    name: 'Registro',
    component: Registro
  },
  {
    path: '/registroc',
    name: 'RegistroC',
    component: RegistroC
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
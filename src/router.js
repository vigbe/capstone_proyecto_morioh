import { createRouter, createWebHistory } from 'vue-router';
import Home from './components/Login/Home.vue';
import Login from './components//Login/Login.vue';
import Registro from './components/Login/Registro.vue';
import RegistroC from './components/Login/RegistroC.vue';
import MarketPlace from './components/Propiedades/MarketPlace.vue';
import Solicitudes from './components/Propiedades/Solicitudes.vue';
import Clientes from './components/Propiedades/Clientes.vue';

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
  },
  {
    path: '/marketplace',
    name: 'MarketPlace',
    component: MarketPlace
  },
  {
    path: '/solicitudes',
    name: 'Solicitudes',
    component: Solicitudes
  },
  {
    path: '/clientes',
    name: 'Clientes',
    component: Clientes
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
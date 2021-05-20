import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'

import axios from 'axios'

axios.defaults.baseURL = "http://localhost:3000/";
axios.defaults.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem('token');

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

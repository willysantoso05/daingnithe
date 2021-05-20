<template>
  <nav class="navbar navbar-expand-md navbar-dark bg-dark mb-4">
    <div class="container-fluid">
      <router-link to="/" class="navbar-brand">Home</router-link>
      <div>
        <ul class="navbar-nav me-auto mb-2 mb-md-0" v-if="!userID || !username">
          <li class="nav-item">
            <router-link to="/login" class="nav-link">Login</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/register" class="nav-link">Register</router-link>
          </li>
        </ul>
        <ul class="navbar-nav me-auto mb-2 mb-md-0" v-if="userID && username">
          <li class="nav-item">
            <a href="javascript:void(0)" @click="logout" class="nav-link">Logout</a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
import {mapGetters} from 'vuex';

export default {
  name: "Nav",
  methods:{
    logout() {
      localStorage.removeItem('userID');
      localStorage.removeItem('username');
      localStorage.removeItem('token');

      this.$store.dispatch('userID', null);
      this.$store.dispatch('username', null);

      this.$router.push('/login');
    }
  },
  computed: {
    ...mapGetters(['userID', 'username'])
  }
}
</script>
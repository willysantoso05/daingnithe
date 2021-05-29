<template>
  <form @submit.prevent="submit">
    <h1 class="h3 mb-3 fw-normal">Sign Up</h1>
    <input v-model="name" class="form-control mb-2" placeholder="Name">
    <input v-model="username" class="form-control mb-2" placeholder="Username">

    <input v-model="password" type="password" class="form-control mb-2"  placeholder="Password">

    <button class="w-100 btn btn-lg btn-primary" type="submit">Register</button>
  </form>
</template>

<script>
import download from 'js-file-download';
import axios from 'axios';

export default {

  name: "Register",
  data() {
    return {
      name: '',
      username: '',
      password: ''
    }
  },

  methods: {
    async submit() {
      var querystring = require('querystring');

      const data = {
        name: this.name,
        username: this.username,
        password: this.password
      }
      
      const headers = { 
        "Content-Type": "application/x-www-form-urlencoded"
      }

      try{
        const response = await axios.post('users/register', querystring.stringify(data),{
                                  headers: headers,
                                  responseType: 'blob'
                                });
        download(response.data, "Wallet.id")
  
        this.$router.push('/login');
      } catch (err) {
        console.log(err.response.data.message);
        alert(err.response.data.message);
      }
    }
  }
}
</script>

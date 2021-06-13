<template>
  <div class="register-page d-flex justify-content-center">
    <form @submit.prevent="submit">
      <h1 class="h3 mb-3 fw-normal">Sign Up</h1>

      <label class="mt-3">Name</label>
      <input v-model="name" class="form-control mb-2" placeholder="Name">

      <label class="mt-3">Username</label>
      <input v-model="username" class="form-control mb-2" placeholder="Username">

      <label class="mt-3">Password</label>
      <input v-model="password" type="password" class="form-control mb-2"  placeholder="Password">

      <button class="w-100 btn btn-lg btn-primary" type="submit">Register</button>
    </form>
  </div>
</template>

<script>
import download from 'js-file-download';
import service from '../utils/req';

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
        const response = await service.post('users/register', querystring.stringify(data),{
                                  headers: headers,
                                  responseType: 'blob'
                                });
        download(response.data, `Wallet_${this.username}.id`);
  
        this.$router.push('/login');
      } catch (err) {
          console.log(err);
      }
    }
  }
}
</script>

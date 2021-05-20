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
    submit() {
      const data = {
        name: this.name,
        username: this.username,
        password: this.password
      }
      console.log(data);

      var querystring = require('querystring');
      const headers = { 
        "Content-Type": "application/x-www-form-urlencoded"
      }
      
      axios.post('http://localhost:3000/users/register', querystring.stringify(data),{
        headers: headers,
        responseType: 'blob'
        }).then(
            res => {
              download(res.data, "Wallet.id")
              console.log(res)
            } 
          ).catch(
            err => {
              console.log(err)
            }
          )
    }
  }
}
</script>

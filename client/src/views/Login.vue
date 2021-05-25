<template>
  <form @submit.prevent="submit">
    <h1 class="h3 mb-3 fw-normal">Sign in</h1>
    <input v-model="username" class="form-control" placeholder="Username">

    <input v-model="password" type="password" class="form-control"  placeholder="Password">

    <label>Wallet</label>
    <input @change="onFileChange" type="file" class="form-control" placeholder="Wallet">

    <button class="w-100 btn btn-lg btn-primary mt-4" type="submit">Sign in</button>
  </form>
</template>

<script>
import axios from 'axios';

export default {
  name: "Login",
  data() {
    return {
      username: '',
      password: '',
      wallet: ''
    }
  },
  methods: {
    onFileChange(event) {
      this.wallet = event.target.files[0]
    },

    async submit() {
      const headers = { 
        "Content-Type": "multipart/form-data; boundary=<calculated when request is sent>"
      }

      var form = new FormData();
      form.append('username',this.username);
      form.append('password',this.password);
      form.append('wallet',this.wallet);

      const response = await axios.post('/users/sign-in', form, {headers: headers});
      // console.log(response);

      localStorage.setItem('userID', response.data.data.id);
      localStorage.setItem('username', response.data.data.username);
      localStorage.setItem('token', response.data.data.token);
      
      this.$store.dispatch('userID', response.data.data.id);
      this.$store.dispatch('username', response.data.data.username);
      this.$router.push('/').catch(()=>{});
    }
  },
  updated(){
    if (this.userID && this.username){
      this.$router.push('/').catch(()=>{});
    }
  }
}
</script>
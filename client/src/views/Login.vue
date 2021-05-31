<template>
  <div class="login-page d-flex justify-content-center">
    <form @submit.prevent="submit">
      <h1 class="h3 mb-3 fw-normal">Sign in</h1>
      <label class="mt-3">Username</label>
      <input v-model="username" class="form-control" placeholder="Username">
      
      <label class="mt-3">Password</label>
      <input v-model="password" type="password" class="form-control"  placeholder="Password">

      <label class="mt-3">Wallet</label>
      <input @change="onFileChange" type="file" class="form-control" placeholder="Wallet">

      <button class="w-100 btn btn-lg btn-primary mt-4" type="submit">Sign in</button>
    </form>
  </div>
</template>

<script>
import service from '../utils/req';

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

      try{
        const response = await service.post('/users/sign-in', form, {headers: headers});
        localStorage.setItem('userID', response.data.data.id);
        localStorage.setItem('username', response.data.data.username);
        localStorage.setItem('token', response.data.data.token);
        
        this.$store.dispatch('userID', response.data.data.id);
        this.$store.dispatch('username', response.data.data.username);
        this.$router.push('/');
      } catch (err) {
        console.log(err.response.data.message);
        alert(err.response.data.message);
      }
    }
  },

  updated(){
    if (this.userID && this.username){
      this.$router.push('/');
    }
  }
}
</script>
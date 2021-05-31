<template>
<div>
  <Nav/>
  <main class="form-signin">
    <router-view/>
  </main>
  </div>
</template>

<script>
import Nav from '@/components/Nav'

export default{
  components: {
    Nav
  },

  created() {
    this.$store.dispatch('userID', localStorage.getItem("userID"));
    this.$store.dispatch('username', localStorage.getItem("username"));
  }
}
</script>
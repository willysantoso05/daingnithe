<template>
  <form>
    <h1 class="h3 mb-3 fw-normal">Sign in</h1>
    <input class="form-control" placeholder="Username">

    <input type="password" class="form-control"  placeholder="Password">

    <label>Wallet</label>
    <input type="file" class="form-control" placeholder="Wallet">

    <button class="w-100 btn btn-lg btn-primary mt-4" type="submit">Sign in</button>
  </form>
</template>

<script>
export default {
  name: "Login"
}
</script>
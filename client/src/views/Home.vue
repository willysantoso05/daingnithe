<template>
  <div>
    <h1 v-if="!userID && !username"> File System with Hyperledger Fabric and IPFS</h1>
    <div v-if="userID && username">
      <h2> User : <strong>{{userID}}</strong></h2>
      <h2> User : <strong>{{username}}</strong></h2>
      <br>
      <h4> Files </h4>
    </div>
  </div>
</template>

<script>
import {mapGetters} from 'vuex';
import axios from 'axios';

export default {
  name: "Home",
  async updated() {
    const response = await axios.get('file');
    console.log(response);
  },
  computed: {
    ...mapGetters(['userID', 'username'])
  }
}
</script>

<template>
  <div>
    <h1 v-if="!userID && !username"> File System with Hyperledger Fabric and IPFS</h1>
    <div v-if="userID && username">
      <h2> User : <strong>{{userID}}</strong></h2>
      <h2> User : <strong>{{username}}</strong></h2>
      <br>
      <h4> Files </h4>

      <form @submit.prevent="submitFile">
        <h1 class="h3 mb-3 fw-normal">Upload New File</h1>
        <label>Upload a new file</label>
        <input @change="onFileChange" type="file" class="form-control" placeholder="File">

        <button class="w-100 btn btn-lg btn-primary mt-4" type="submit">Upload</button>
      </form>

      <ul v-if="files">
        <li v-for="file in files" :key="file.id">
          <ul>
            <li>
              <span class="fileName"> {{file.FileName}} </span>
              <span class="ownerFile"> {{file.OwnerFile}} </span>
              <!-- <span class="fileName"> {{file.FileName}} </span> -->
              <span class="lastUpdated"> {{file.LastUpdated}} </span>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import {mapGetters} from 'vuex';
import axios from 'axios';

export default {
  name: "Home",
  data(){
    return {
      newFile: null,
      files: null
    }
  },
  async created() {
    if (this.userID && this.username){
      const response = await axios.get('file');

      let result = null
      if (response.data.data.length != 0){
        result = response.data.data
      }
      console.log(response);

      this.files = result
    }
  },
  
  computed: {
    ...mapGetters(['userID', 'username']),
  },

  methods: {
    onFileChange(event) {
      this.newFile = event.target.files[0]
      console.log(event.target.files)
    },
    async submitFile() {
      const headers = { 
        "Content-Type": "multipart/form-data; boundary=<calculated when request is sent>"
      }

      var form = new FormData();
      form.append('file',this.newFile);

      const response = await axios.post('/file', form, {headers: headers});
      console.log(response);
      this.$router.go()
    }
  }
}
</script>

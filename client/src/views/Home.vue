<template>
  <div>
    <h1 v-if="!userID && !username"> File System with Hyperledger Fabric and IPFS</h1>
    <div v-if="userID && username">
      <h2> User : <strong>{{userID}}</strong></h2>
      <h2> User : <strong>{{username}}</strong></h2>
      <br>
      <h4> Files </h4>

      <div class="upload-file">
        <form @submit.prevent="submitFile">
          <label>Upload a new file</label>
          <input @change="onFileChange" type="file" class="form-control" placeholder="File">

          <button class="w-100 btn btn-lg btn-primary mt-4" type="submit">Upload</button>
        </form>
      </div>

      <div>
        <ul v-if="files">
          <li v-for="file in files" :key="file.ID">
            <router-link :to="`/file/${file.ID}`">
              <ul>
                <li>
                  <span class="fileName"> {{file.FileName}} </span>
                  <span class="ownerFile"> {{file.OwnerFile}} </span>
                  <span class="lastUpdated"> {{file.LastUpdated}} </span>
                </li>
              </ul>
            </router-link>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import {mapGetters} from 'vuex';
import service from '../utils/req';

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
      const response = await service.get('file');

      let result = null
      if (response.data.data.length != 0){
        result = response.data.data
      }

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

      try{
        const response = await service.post('/file', form, {headers: headers});
        console.log(response);
        this.newFile = null
      } catch(err){
        console.log(err)
      }
      
      this.$router.go();
    }
  }
}
</script>

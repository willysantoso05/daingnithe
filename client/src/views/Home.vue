<template>
  <div>
    <h1 class="d-flex justify-content-center mt-5 pt-5" v-if="!userID && !username"> File System with Hyperledger Fabric and IPFS</h1>
    
    <div class="w-75 mx-auto" v-if="userID && username">
      <h2> User ID : <strong>{{userID}}</strong></h2>
      <h2> Username : <strong>{{username}}</strong></h2>
      <br>

      <div class = "d-flex justify-content-between mb-3 border-top pt-3">
        <h2 class="mt=5"> FILES </h2>
        <button class = "btn btn-primary px-5" @click="onChangeUploadButton()"> Upload </button>
      </div>

      <div class="upload-file d-flex justify-content-center mb-5" v-if="uploadFlag">
        <form @submit.prevent="submitFile">
          <h4>Upload a new file</h4>
          <input @change="onFileChange" type="file" class="form-control" placeholder="File">

          <button class="w-100 btn btn-primary mt-4" type="submit">Upload</button>
        </form>
      </div>

      <div v-if="files">
        <table class="table">
          <thead>
            <tr>
              <th scope="col">FileName</th>
              <th scope="col">Owner File</th>
              <th scope="col">Last Updated</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="file in files" :key="file.ID" @click="goToFileDetail(file.ID)">
              <th scope="row">{{file.FileName}}</th>
              <td>{{file.OwnerID}}</td>
              <td>{{file.LastUpdated}}</td>
            </tr>
          </tbody>
        </table>
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
      files: null,
      uploadFlag: false
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
    goToFileDetail(id) {
      this.$router.push(`/file/${id}`);
    },

    onChangeUploadButton () {
      this.uploadFlag = !this.uploadFlag;
    },

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

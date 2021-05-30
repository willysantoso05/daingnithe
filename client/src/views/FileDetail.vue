<template>
  <div>
    <div class="detail-header">
      <h1> FILE DETAIL</h1>
      <button @click="downloadFile"> Download </button>
      <button @click="onChangeUpdateButton"> Update </button>

      <div v-if="updateFlag" class="upload-updated-file">
        <form @submit.prevent="updateFile">
          <label>Upload updated file</label>
          <input @change="onFileChange" type="file" class="form-control" placeholder="Updated File">

          <button class="w-100 btn btn-lg btn-primary mt-4" type="submit">Upload</button>
        </form>
      </div>
    </div>
    
    <br>

    <div class="file-metadata">
      <ul>
        <li>
            <h5> File Name = {{file.FileName}} </h5>
        </li>
        <li>
            <h5> File Owner = {{file.OwnerID}} </h5>
        </li>
        <li>
          <h5> Access User List : </h5>
          <button @click="onChangeShareButton"> Share </button>
          
          <div v-if="shareFlag" class="share-file">
            <form @submit.prevent="grantAccessFile">
              <label>Input user ID :</label>
              <input v-model="selectedShare" class="form-control" placeholder="Username">

              <button class="w-100 btn btn-lg btn-primary mt-4" type="submit">Share Access</button>
            </form>
          </div>
          
          <ul>
            <li v-for="(value, user) in file.AccessUserList" :key="user">
              <h5> {{user}}  
                <button v-if="userID==file.OwnerID && user!=file.OwnerID" @click="revokeAccessFile(user)"> X </button>
              </h5>
            </li>
          </ul>
        </li>
        <li>
          <h5> Last Updated = {{file.LastUpdated}} </h5>
        </li>
      </ul>
    </div>

    <br>

    <div v-if="userID==file.OwnerID"> 
      <h2> Owner Operation : </h2>
      <br>
      <button @click="deleteFile"> Delete </button>
      <button @click="onChangeTransferButton"> Transfer </button>

      <div v-if="transferFlag" class="transfer-file">
        <select v-model="selectedTransfer">
          <option disabled value="">Please select one</option>
          <option v-for="userTarget in targetTransfer" :key="userTarget"> {{userTarget}}</option>
        </select>
        <span>Selected: {{ selectedTransfer }}</span>

        <button v-if="selectedTransfer" @click="transferFile(selectedTransfer)"> Transfer </button>
      </div>
    </div>

    </div>
</template>

<script>
import {mapGetters} from 'vuex';
import service from '../utils/req';

export default {
  name: "FileDetail",
  data(){
    return{
      idFile: this.$route.params.fileID,
      file: {
        ID: null,
        FileName: null,
        OwnerID: null, 
        AccessUserList: null
      },
      updatedFile: null,
      shareFlag: false,
      updateFlag: false,
      transferFlag: false,
      selectedTransfer: null,
      selectedShare: null
    }
  },

  async created(){
    try{
      const response = await service.get('file');
      let result = response.data.data;

      this.file = result.find(res => {
        return res.ID == this.idFile
      })
    } catch (err) {
        console.log(err.response.data.message);
        alert(err.response.data.message);
      }
  },

  computed: {
    ...mapGetters(['userID', 'username']),
    targetTransfer () {
      let opt = [];

      const keys = Object.keys(this.file.AccessUserList);
      for (let i = 0; i < keys.length; i++) {
        if (keys[i] != this.file.OwnerID && keys[i]!=this.userID){
          opt.push(keys[i])
        }
      }
      return opt;
    }
  },

  methods:{
    onFileChange(event) {
      this.updatedFile = event.target.files[0]
      console.log(event.target.files);
    },

    onChangeUpdateButton () {
      this.updateFlag = !this.updateFlag;
    },

    onChangeShareButton () {
      this.shareFlag = !this.shareFlag;
    },

    onChangeTransferButton () {
      this.transferFlag = !this.transferFlag;
    },

    async downloadFile() {
      try{
        const response = await service.get(`/file/${this.$route.params.fileID}`, {responseType:'blob'});
        var url = window.URL.createObjectURL(response.data);
        var a = document.createElement('a');
        a.href = url;
        a.download = this.file.FileName;
        a.click();
        a.remove();
      } catch (err) {
        console.log(err.response.data.message);
        alert(err.response.data.message);
      }
    },

    async deleteFile() {
      try{
        const response = await service.delete(`/file/${this.$route.params.fileID}`);
        console.log(response);
      } catch (err) {
        console.log(err);
      }
      this.$router.push('/');
    },

    async updateFile() {
      const headers = { 
        "Content-Type": "multipart/form-data; boundary=<calculated when request is sent>"
      }

      var form = new FormData();
      form.append('file',this.updatedFile);

      try {
        const response = await service.put(`/file/${this.$route.params.fileID}`, form, {headers: headers});
        console.log("AAA");
        console.log(response);
        this.updateFlag = false,
        this.updatedFile = null;
      } catch (err) {
        console.log(err.response.data.message);
        alert(err.response.data.message);
      }
      this.$router.go();
    },

    async transferFile(targetUserID) {
      console.log(targetUserID);
      const headers = { 
        "Content-Type": "multipart/form-data; boundary=<calculated when request is sent>"
      }

      var form = new FormData();
      form.append('userId', targetUserID);

      try{
        const response = await service.put(`file/transfer/${this.$route.params.fileID}`, form, {headers: headers});
        console.log(response);
      } catch (err) {
        console.log(err.response.data.message);
        alert(err.response.data.message);
      }

      this.targetTransfer = null
      this.$router.go();
    },

    async grantAccessFile(){
      const action = 'GRANT';
      let targetUserID = this.selectedShare;

      const headers = { 
        "Content-Type": "multipart/form-data; boundary=<calculated when request is sent>"
      }

      var form = new FormData();
      form.append('access', action);
      form.append('userId', targetUserID);

      try{
        const response = await service.put(`file/access/${this.$route.params.fileID}`, form, {headers: headers});
        console.log(targetUserID);
        console.log(response);
        this.selectedShare = null;
      } catch (err) {
        console.log(err.response.data.message);
        alert(err.response.data.message);
      }

      this.$router.go();
    },

    async revokeAccessFile(targetUserID){
      const action = 'REVOKE';

      const headers = { 
        "Content-Type": "multipart/form-data; boundary=<calculated when request is sent>"
      }

      var form = new FormData();
      form.append('access', action);
      form.append('userId', targetUserID);

      try{
        const response = await service.put('file/access/' + this.$route.params.fileID, form, {headers: headers});
        console.log(targetUserID);
        console.log(response);
      } catch (err) {
        console.log(err.response.data.message);
        alert(err.response.data.message);
      }

      this.$router.go();
    }
  }
}
</script>
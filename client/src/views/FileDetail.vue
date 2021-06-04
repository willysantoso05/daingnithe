<template>
  <div class="w-75 mx-auto">
    <div class="detail-header d-flex justify-content-between mb-3 pt-3">
      <h1 class="text-center"> FILE DETAIL</h1>
      <div>
        <button class="mx-3 px-3 btn btn-dark" @click="onChangeHistoryButton"> <strong> Show File History </strong> </button>
        <button v-if="userID==file.OwnerID" class="mx-3 px-3 btn btn-danger" @click="deleteFile"> <strong> DELETE </strong> </button>
        <button class="mx-3 px-3 btn btn-warning" @click="onChangeUpdateButton"> <strong> UPDATE </strong> </button>
        <button class="mx-3 px-3 btn btn-success" @click="downloadFile"> <strong> DOWNLOAD </strong> </button>
      </div>
    </div>

    <div v-if="updateFlag" class="upload-updated-file d-flex justify-content-center mb-3">
      <form @submit.prevent="updateFile">
        <h4>Upload updated file</h4>
        <input @change="onFileChange" type="file" class="form-control" placeholder="Updated File">

        <button class="w-100 btn btn-primary mt-3" type="submit">Upload</button>
      </form>
    </div>
    
    <div class="file-metadata border-top pt-3">
      <table class="table">
        <thead>
          <tr>
            <th scope="col">Metadata</th>
            <th scope="col">Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">FileName</th>
            <td>{{file.FileName}}</td>
          </tr>
          <tr>
            <th scope="row">Owner File</th>
            <td>{{file.OwnerID}}</td>
          </tr>
          <tr>
            <th scope="row">Last Update Time</th>
            <td>{{file.LastUpdated}}</td>
          </tr>
        </tbody>
      </table>

      <div class="d-flex justify-content-between mb-3 pt-3">
        <h3> Access User List </h3>
        <button class="mx-3 px-3 btn btn-primary" @click="onChangeShareButton"> <strong> Share </strong> </button>
      </div>

      <div v-if="shareFlag" class="share-file d-flex justify-content-center mb-3">
        <form @submit.prevent="grantAccessFile">
          <label>Input user ID :</label>
          <input v-model="selectedShare" class="form-control" placeholder="Username">

          <button class="w-100 btn btn-lg btn-primary mt-3" type="submit">Share Access</button>
        </form>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th scope="col">User ID</th>
            <th scope="col">Revoke Access</th>
            <th scope="col">Transfe File</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(value, user) in file.AccessUserList" :key="user">
            <th scope="row">{{user}}</th>
            <td>
              <button class="btn btn-danger" v-if="userID==file.OwnerID && user!=file.OwnerID" @click="revokeAccessFile(user)"> <strong> Revoke </strong> </button>
              <label v-if="userID!=file.OwnerID || user==file.OwnerID"> - </label>
            </td>
            <td>
              <button class="btn btn-warning" v-if="userID==file.OwnerID && user!=file.OwnerID" @click="transferFile(user)"> <strong> Make Owner </strong> </button>
              <label v-if="userID!=file.OwnerID || user==file.OwnerID"> - </label>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="historyFlag && historyFiles">
      <h3 class="my-3 pt-3"> File History </h3>
      <table class="table">
        <thead>
          <tr>
            <th scope="col">File Name</th>
            <th scope="col">Owner File</th>
            <th scope="col">Last Updated Time</th>
            <th scope="col">Last Updated By User</th>
            <th scope="col">Download</th>
          </tr>
        </thead>
        <tbody>
            <tr v-for="version in historyFiles" :key=" version.Version + '_' + version.ID">
              <th scope="row">{{version.FileName}}</th>
              <td>{{version.OwnerID}}</td>
              <td>{{version.LastUpdatedTime}}</td>
              <td>{{version.LastUpdatedBy}}</td>
              <td>
                <button class="btn btn-primary" v-if="version.CanDownload" @click="downloadHistoryFile(version.FileName, Number(version.Version))"> <strong> Download </strong> </button>
                <label v-if="!version.CanDownload"> - </label>
              </td>
            </tr>
          </tbody>
      </table>
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
      historyFlag: false,
      transferFlag: false,
      selectedShare: null,
      historyFiles : null
    }
  },

  async created(){
    //Fetch File Detail
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

    //Fetch File History
    try{
      const historyResponse = await service.get(`/file/history/${this.$route.params.fileID}`);
      let historyResults = null
      if (historyResponse.data.data.length != 0){
        historyResults = historyResponse.data.data

        for(let i=0; i<historyResults.length; i++){
          if(Object.prototype.hasOwnProperty.call(historyResults[i].AccessUserList, this.userID)){
            historyResults[i]["CanDownload"] = true;
          } else {
            historyResults[i]["CanDownload"] = false;
          }
        }
      }
      this.historyFiles = historyResults
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

    onChangeHistoryButton () {
      this.historyFlag = !this.historyFlag;
    },

    async downloadFile() {
      try{
        const response = await service.get(`/file/${this.$route.params.fileID}`, {responseType:'blob'});
        if(response.data){
          var url = window.URL.createObjectURL(response.data);
          var a = document.createElement('a');
          a.href = url;
          a.download = this.file.FileName;
          a.click();
          a.remove();
        }
      } catch (err) {
        alert("Download failed");
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
    },

    async downloadHistoryFile(fileName, version){
      try{
        const response = await service.get(`/file/history/download/${this.$route.params.fileID}/${version}`, {responseType:'blob'});
        var url = window.URL.createObjectURL(response.data);
        var a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        a.remove();
      } catch (err) {
        alert("Download failed");
      }
    }
  }
}
</script>
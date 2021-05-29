<template>
  <div>
    <div class="detail-header">
      <h1> FILE DETAIL</h1>
      <button> Download </button>
      <button> Update </button>
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
          <button> Share </button>
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
            deleteFlag: false,
            transferFlag: false,
            selectedTransfer: null
        }
    },

    async created(){
        const response = await service.get('file');

        let result = response.data.data;

        this.file = result.find(res => {
            return res.ID == this.idFile
        })
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
          this.newFile = event.target.files[0]
          console.log(event.target.files)
        },

        onChangeTransferButton () {
          this.transferFlag = !this.transferFlag;
        },

        async downloadFile() {
            const response = await service.get(`/file/${this.$route.params.fileID}`);
            console.log(response);
            this.$router.go();
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
          form.append('file',this.newFile);

          try {
            const response = await service.post(`/file/${this.$route.params.fileID}`, form, {headers: headers});
            console.log(response);
            this.$router.go();
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

        async grantAccessFile(targetUserID){
          const action = 'GRANT';

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
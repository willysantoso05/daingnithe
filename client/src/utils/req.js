import axios from 'axios'

const instance = axios.create({
    baseURL: `http://localhost:${process.env.VUE_APP_APIPORT}/`,
    timeout: 30000,
    headers: {'Authorization': 'Bearer ' + localStorage.getItem('token')}
});

export default instance;
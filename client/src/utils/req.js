import axios from 'axios'

const instance = axios.create({
    baseURL: 'http://localhost:3000/',
    timeout: 5000,
    headers: {'Authorization': 'Bearer ' + localStorage.getItem('token')}
});

export default instance;
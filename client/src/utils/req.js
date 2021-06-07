import axios from 'axios'

const instance = axios.create({
    baseURL: `http://localhost:${process.env.API_PORT}/`,
    timeout: 30000,
    headers: {'Authorization': 'Bearer ' + localStorage.getItem('token')}
});

export default instance;
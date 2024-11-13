import axios from 'axios';

const instance = axios.create({
    baseURL: 'https://jewelry-backend-rh2w.onrender.com', 
    // baseURL: 'http://localhost:3000',
    timeout: 30000,
});
export default instance;
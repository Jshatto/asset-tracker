import axios from 'axios';

// Axios instance with base URL for all API requests
const api = axios.create({
  baseURL: '/api',
});

export default api;

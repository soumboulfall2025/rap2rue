import axios from 'axios';
import { apiUrl } from './api';

const authApi = axios.create({
  baseURL: apiUrl('/'),
});

authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = 'Bearer ' + token;
  return config;
});

export default authApi;

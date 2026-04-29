import { BASE_URL } from '../constants';
import axios from 'axios';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': '',
  },
});

export default apiClient;

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Default to 10.0.2.2 for Android emulator or localhost for iOS / Web
const BASE_URL = 'http://10.0.2.2:8080';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error('Error fetching auth token from AsyncStorage', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;

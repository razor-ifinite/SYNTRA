import axios from 'axios';
import { Storage as SecureStore } from '../utils/storage';

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_GATEWAY || 'http://10.0.2.2:8080',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('syntra_jwt');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // secure store error
  }
  return config;
});

// Avoid import cycles for expo-router by defining this logic in the hook or components where necessary,
// or handle it with a global emitter. But for now, we follow the spec.
// Since router.replace is a UI concern, it is often better handled in an error boundary or global hook.
// The spec says: "Use expo-router's router.replace('/(auth)/login') here"
import { router } from 'expo-router';

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        await SecureStore.deleteItemAsync('syntra_jwt');
        await SecureStore.deleteItemAsync('syntra_user');
        router.replace('/(auth)/login');
      } catch (e) {
        // secure store error
      }
    }
    return Promise.reject(error);
  }
);

import { useEffect, useState } from 'react';
import { Storage as SecureStore } from '../utils/storage';
import { router } from 'expo-router';
import { UserProfile, LoginRequest, RegisterRequest, AuthResponse } from '../types';
import { api } from '../services/api';

const TOKEN_KEY = 'syntra_jwt';
const USER_KEY  = 'syntra_user';

export const useAuth = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkLoginState();
  }, []);

  const checkLoginState = async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (token) {
        const userData = await SecureStore.getItemAsync(USER_KEY);
        if (userData) {
          setUser(JSON.parse(userData));
        }
      }
    } catch (e) {
      console.error('Failed to read auth state', e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (data: LoginRequest) => {
    setIsLoading(true);
    try {
      // Mock network request
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockResponse: AuthResponse = {
        token: 'mock_jwt_token_123',
        userId: 'user_1',
        name: 'Test User',
        email: data.email,
      };
      await setSession(mockResponse);
      router.replace('/(tabs)');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    setIsLoading(true);
    try {
      // Mock network request
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockResponse: AuthResponse = {
        token: 'mock_jwt_token_456',
        userId: 'user_2',
        name: data.name,
        email: data.email,
      };
      await setSession(mockResponse);
      router.replace('/(tabs)');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
    setUser(null);
    router.replace('/(auth)/login');
  };

  const setSession = async (data: AuthResponse) => {
    await SecureStore.setItemAsync(TOKEN_KEY, data.token);
    const userProfile: UserProfile = { id: data.userId, name: data.name, email: data.email };
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(userProfile));
    setUser(userProfile);
  };

  return { user, isLoading, login, register, logout, isLoggedIn: !!user };
};

export const isLoggedInSync = (): boolean => {
  // Synchronous checks aren't fully supported in SecureStore, but we can check if token exists.
  // Actually, we must use async check in the layout component.
  return false; // placeholder, the hook handles it
};

import React from 'react';
import { render } from '@testing-library/react-native';
import LoginScreen from '../app/(auth)/login';
import RegisterScreen from '../app/(auth)/register';

// Mock the hooks and components
jest.mock('../../src/hooks/useAuth', () => ({
  useAuth: () => ({
    login: jest.fn(),
    register: jest.fn(),
    isLoading: false,
  }),
}));

jest.mock('expo-router', () => ({
  Link: ({ children }: any) => children,
}));

// Mock safe area context
jest.mock('react-native-safe-area-context', () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: jest.fn(({ children }) => children),
    SafeAreaConsumer: jest.fn(({ children }) => children(inset)),
    useSafeAreaInsets: jest.fn(() => inset),
  };
});

describe('Authentication Screens', () => {
  it('renders Login screen correctly', () => {
    const { getByText, getByPlaceholderText } = render(<LoginScreen />);
    
    // Check if key elements exist
    expect(getByText('Log in')).toBeTruthy();
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByText('LOGIN')).toBeTruthy();
  });

  it('renders Register screen correctly', () => {
    const { getByText, getByPlaceholderText } = render(<RegisterScreen />);
    
    // Check if key elements exist
    expect(getByText('Register')).toBeTruthy();
    expect(getByPlaceholderText('Full Name')).toBeTruthy();
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByText('REGISTER')).toBeTruthy();
  });
});

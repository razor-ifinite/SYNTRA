import React from 'react';
import { render } from '@testing-library/react-native';
import DashboardScreen from '../app/(tabs)/index';
import DecisionAIScreen from '../app/(tabs)/decision-ai';
import FutureMeScreen from '../app/(tabs)/future-me';

// Mock dependencies
jest.mock('../../src/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-id', name: 'Test User' },
  }),
}));

jest.mock('../../src/hooks/useGoals', () => ({
  useGoals: () => ({
    data: [],
    isLoading: false,
    isRefetching: false,
  }),
  QUERY_KEYS: { goals: jest.fn() }
}));

jest.mock('../../src/hooks/useAI', () => ({
  useDecisionAI: () => ({
    mutate: jest.fn(),
    reset: jest.fn(),
    data: null,
    isPending: false,
  }),
  useFutureMeSimulation: () => ({
    mutate: jest.fn(),
    reset: jest.fn(),
    data: null,
    isPending: false,
  }),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    invalidateQueries: jest.fn(),
  }),
}));

describe('Tab Screens', () => {
  it('renders Dashboard screen correctly', () => {
    const { getByText } = render(<DashboardScreen />);
    
    // Check if key elements exist
    expect(getByText('Hello, Test')).toBeTruthy();
    expect(getByText('Active Goals')).toBeTruthy();
    expect(getByText('Overall Progress')).toBeTruthy();
  });

  it('renders Syntra AI screen correctly', () => {
    const { getByText, getByPlaceholderText } = render(<DecisionAIScreen />);
    
    // Check if key elements exist
    expect(getByText('Decision AI')).toBeTruthy();
    expect(getByPlaceholderText(/Describe your scenario/i)).toBeTruthy();
    expect(getByText('GENERATE MATRIX')).toBeTruthy();
  });

  it('renders Future Me screen correctly', () => {
    const { getByText, getByPlaceholderText } = render(<FutureMeScreen />);
    
    // Check if key elements exist
    expect(getByText('Future Me')).toBeTruthy();
    expect(getByPlaceholderText(/Describe a habit/i)).toBeTruthy();
    expect(getByText('SIMULATE FUTURE')).toBeTruthy();
  });
});

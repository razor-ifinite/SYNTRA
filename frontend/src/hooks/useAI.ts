import { useMutation } from '@tanstack/react-query';
import { api } from '../services/api';
import { DecisionResult, FutureMeInput, FutureMeResult } from '../types';

export const useDecisionAI = () => {
  return useMutation({
    mutationFn: async (scenario: string) => {
      // const { data } = await api.post<DecisionResult>('/api/ai/decision', { scenario });
      // return data;
      return new Promise<DecisionResult>((resolve) => setTimeout(() => resolve({
        scenario,
        options: [
          {
            optionTitle: 'Proceed with current plan',
            pros: ['Predictable', 'Low cost'],
            cons: ['Slow growth'],
            risks: ['Market changes'],
            opportunityScore: 75
          },
          {
            optionTitle: 'Pivot aggressively',
            pros: ['High upside', 'First mover advantage'],
            cons: ['Expensive', 'Unproven'],
            risks: ['Total failure'],
            opportunityScore: 88
          }
        ]
      }), 1500));
    },
  });
};

export const useFutureMeAI = () => {
  return useMutation({
    mutationFn: async (input: FutureMeInput) => {
      // const { data } = await api.post<FutureMeResult>('/api/ai/future-me', input);
      // return data;
      return new Promise<FutureMeResult>((resolve) => setTimeout(() => resolve({
        projectedGrowth: [
          { semester: 'S1', score: 65 },
          { semester: 'S2', score: 72 },
          { semester: 'S3', score: 85 },
          { semester: 'S4', score: 94 },
        ],
        roadmap: 'Keep maintaining your daily study hours. Increase your savings by 5% next month to hit your target early.'
      }), 1500));
    },
  });
};

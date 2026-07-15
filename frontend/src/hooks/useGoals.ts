import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Goal, GoalProgressResponse, CreateGoalPayload, CreateMilestonePayload } from '../types';
// Removed duplicate QUERY_KEYS import

// Mock data
const mockGoals: Goal[] = [
  {
    id: 'g1', userId: 'u1', title: 'Learn React Native', description: 'Master Expo and Reanimated',
    deadline: new Date(Date.now() + 86400000 * 30).toISOString(), status: 'ACTIVE', createdAt: new Date().toISOString(),
  }
];

export const QUERY_KEYS = {
  goals: (userId: string) => ['goals', userId] as const,
  goalDetail: (goalId: string) => ['goal', goalId] as const,
  goalProgress: (goalId: string) => ['progress', goalId] as const,
};

export const useGoals = (userId?: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.goals(userId || ''),
    queryFn: async () => {
      // Mock API call
      // const { data } = await api.get<Goal[]>(`/api/goals/user/${userId}`);
      // return data;
      return new Promise<Goal[]>((resolve) => setTimeout(() => resolve(mockGoals), 500));
    },
    enabled: !!userId,
  });
};

export const useGoalProgress = (goalId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.goalProgress(goalId),
    queryFn: async () => {
      // const { data } = await api.get<GoalProgressResponse>(`/api/goals/${goalId}/progress`);
      // return data;
      return new Promise<GoalProgressResponse>((resolve) => setTimeout(() => resolve({
        goal: mockGoals[0],
        milestones: [
          { id: 'm1', goalId: 'g1', title: 'Set up Expo', dueDate: new Date().toISOString(), status: 'COMPLETED', createdAt: new Date().toISOString() },
          { id: 'm2', goalId: 'g1', title: 'Learn Reanimated', dueDate: new Date(Date.now() + 86400000 * 5).toISOString(), status: 'PENDING', createdAt: new Date().toISOString() }
        ],
        completionPercentage: 50
      }), 500));
    },
    enabled: !!goalId,
  });
};

export const useCreateGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateGoalPayload) => {
      // const { data } = await api.post<Goal>('/api/goals', payload);
      // return data;
      return new Promise<Goal>((resolve) => setTimeout(() => resolve({
        id: 'g' + Date.now(),
        ...payload,
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      }), 500));
    },
    onSuccess: (_: any, variables: any) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.goals(variables.userId) });
    },
  });
};

export const useCreateMilestone = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateMilestonePayload) => {
      // await api.post('/api/milestones', payload);
      return new Promise((resolve) => setTimeout(resolve, 500));
    },
    onSuccess: (_: any, variables: any) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.goalProgress(variables.goalId) });
    },
  });
};

export const useUpdateMilestoneStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ milestoneId, status }: { milestoneId: string, status: string }) => {
      // await api.patch(`/api/milestones/${milestoneId}/status`, { status });
      return new Promise((resolve) => setTimeout(resolve, 500));
    },
    onMutate: async (variables: any) => {
      // Optimistic update logic would go here
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress'] });
    },
  });
};

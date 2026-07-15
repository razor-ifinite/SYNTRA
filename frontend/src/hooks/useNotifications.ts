import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { NotificationLog, NotificationConfig } from '../types';

export const QUERY_KEYS = {
  notificationLogs: (userId: string) => ['notif-logs', userId] as const,
  notificationConfig: (goalId: string) => ['notif-config', goalId] as const,
};

// Mock data
const mockLogs: NotificationLog[] = [
  { id: '1', userId: 'u1', goalId: 'g1', message: 'Remember to practice React Native', sentAt: new Date(Date.now() - 3600000).toISOString(), status: 'SENT' },
  { id: '2', userId: 'u1', goalId: 'g1', message: 'Your milestone is due soon!', sentAt: new Date(Date.now() - 86400000).toISOString(), status: 'FAILED' },
];

export const useNotificationLogs = (userId?: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.notificationLogs(userId || ''),
    queryFn: async () => {
      // const { data } = await api.get<NotificationLog[]>(`/api/notifications/logs?userId=${userId}`);
      // return data;
      return new Promise<NotificationLog[]>((resolve) => setTimeout(() => resolve(mockLogs), 500));
    },
    enabled: !!userId,
  });
};

export const useNotificationConfig = (goalId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.notificationConfig(goalId),
    queryFn: async () => {
      // const { data } = await api.get<NotificationConfig>(`/api/notifications/config?goalId=${goalId}`);
      // return data;
      return new Promise<NotificationConfig>((resolve) => setTimeout(() => resolve({
        goalId,
        frequency: 'DAILY',
        timeOfDay: '09:00',
        message: 'Keep pushing! You got this.',
      }), 500));
    },
    enabled: !!goalId,
  });
};

export const useSaveNotificationConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: NotificationConfig) => {
      // await api.put('/api/notifications/config', payload);
      return new Promise((resolve) => setTimeout(resolve, 500));
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notificationConfig(variables.goalId) });
    },
  });
};

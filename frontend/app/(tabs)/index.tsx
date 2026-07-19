import React from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Pressable } from 'react-native';
import { useAuth } from '../../src/hooks/useAuth';
import { useGoals } from '../../src/hooks/useGoals';
import { GoalCard } from '../../src/components/GoalCard';
import { ProgressRing } from '../../src/components/ProgressRing';
import { SYNTRA_THEME } from '../../constants/Theme';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '../../src/hooks/useGoals';
import { SkeletonLoader } from '../../src/components/SkeletonLoader';

export default function DashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: goals, isLoading, isRefetching } = useGoals(user?.id);

  const onRefresh = async () => {
    if (user?.id) {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.goals(user.id) });
    }
  };

  const handlePressGoal = (goalId: string) => {
    router.push(`/goals/${goalId}`);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0] || 'User'}</Text>
        <Pressable style={styles.avatar} onPress={() => router.push('/profile')}>
          <Text style={styles.avatarText}>
            {user?.name ? user.name.substring(0, 2).toUpperCase() : 'ME'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.bentoGrid}>
        <View style={[styles.bentoCard, styles.bentoLeft]}>
          <Text style={styles.bentoTitle}>Overall Progress</Text>
          <View style={styles.bentoContent}>
             {/* Mock 65% total progress */}
             <ProgressRing percentage={65} radius={40} strokeWidth={8} />
          </View>
        </View>
        <View style={[styles.bentoCard, styles.bentoRight]}>
          <Text style={styles.bentoTitle}>Due 24h</Text>
          <View style={styles.bentoContent}>
            <Text style={styles.bentoNumber}>3</Text>
            <Text style={styles.bentoSubtext}>Milestones</Text>
          </View>
        </View>
      </View>
      <Text style={styles.sectionTitle}>Active Goals</Text>
    </View>
  );

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View>
          <SkeletonLoader style={{ height: 100, marginBottom: 16 }} />
          <SkeletonLoader style={{ height: 100, marginBottom: 16 }} />
          <SkeletonLoader style={{ height: 100 }} />
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No active goals yet.</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={goals || []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        renderItem={({ item }) => (
          <GoalCard
            goal={item}
            progress={Math.random() * 100} // Mock progress for dashboard list
            onPress={() => handlePressGoal(item.id)}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={onRefresh}
            tintColor={SYNTRA_THEME.colors.primary}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 100, // Make room for floating tab bar
  },
  header: {
    marginBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    color: SYNTRA_THEME.colors.textPrimary,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: SYNTRA_THEME.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: SYNTRA_THEME.colors.white,
  },
  bentoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  bentoCard: {
    backgroundColor: SYNTRA_THEME.colors.surface,
    borderRadius: 20,
    padding: 16,
  },
  bentoLeft: {
    width: '58%',
  },
  bentoRight: {
    width: '38%',
  },
  bentoTitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: SYNTRA_THEME.colors.white,
    marginBottom: 16,
  },
  bentoContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  bentoNumber: {
    fontFamily: 'Inter_700Bold',
    fontSize: 48,
    color: SYNTRA_THEME.colors.success,
  },
  bentoSubtext: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: SYNTRA_THEME.colors.white,
    opacity: 0.8,
  },
  sectionTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: SYNTRA_THEME.colors.textPrimary,
    marginBottom: 16,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: SYNTRA_THEME.colors.textPrimary,
  },
});

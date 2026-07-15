import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useGoalProgress, useUpdateMilestoneStatus } from '../../src/hooks/useGoals';
import { MilestoneRow } from '../../src/components/MilestoneRow';
import { SYNTRA_THEME } from '../../constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import { SkeletonLoader } from '../../src/components/SkeletonLoader';

export default function GoalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading } = useGoalProgress(id);
  const updateMilestone = useUpdateMilestoneStatus();

  const handleToggleMilestone = (milestoneId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'PENDING' ? 'COMPLETED' : 'PENDING';
    updateMilestone.mutate({ milestoneId, status: newStatus });
  };

  if (isLoading || !data) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={SYNTRA_THEME.colors.white} />
          </Pressable>
        </View>
        <View style={styles.content}>
          <SkeletonLoader style={{ height: 200, marginBottom: 32 }} />
          <SkeletonLoader style={{ height: 60, marginBottom: 16 }} />
          <SkeletonLoader style={{ height: 60, marginBottom: 16 }} />
        </View>
      </View>
    );
  }

  const { goal, milestones, completionPercentage } = data;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={SYNTRA_THEME.colors.white} />
        </Pressable>
        <Pressable onPress={() => router.push(`/goals/${goal.id}/notifications`)}>
          <Ionicons name="notifications-outline" size={24} color={SYNTRA_THEME.colors.white} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.mainCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.title}>{goal.title}</Text>
            <View style={[styles.badge, goal.status === 'COMPLETED' ? styles.badgeSuccess : styles.badgeActive]}>
              <Text style={styles.badgeText}>{goal.status}</Text>
            </View>
          </View>
          {goal.description && <Text style={styles.description}>{goal.description}</Text>}
          
          <Text style={styles.completionText}>{Math.round(completionPercentage)}% Completed</Text>
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${completionPercentage}%` }]} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Trajectory</Text>

        <View style={styles.timelineContainer}>
          <View style={styles.timelineLine} />
          {milestones?.map((milestone, index) => (
            <View key={milestone.id} style={styles.timelineNode}>
              <MilestoneRow 
                milestone={milestone} 
                onToggle={handleToggleMilestone} 
              />
            </View>
          ))}
          {(!milestones || milestones.length === 0) && (
             <Text style={styles.emptyText}>No milestones added yet.</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SYNTRA_THEME.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  content: {
    padding: 24,
  },
  mainCard: {
    backgroundColor: SYNTRA_THEME.colors.surface,
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    color: SYNTRA_THEME.colors.white,
    flex: 1,
    marginRight: 16,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeActive: {
    backgroundColor: SYNTRA_THEME.colors.black,
  },
  badgeSuccess: {
    backgroundColor: SYNTRA_THEME.colors.success,
  },
  badgeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    color: SYNTRA_THEME.colors.white,
  },
  description: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: SYNTRA_THEME.colors.white,
    opacity: 0.8,
    marginBottom: 24,
  },
  completionText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: SYNTRA_THEME.colors.success,
    marginBottom: 8,
    textAlign: 'right',
  },
  progressContainer: {
    height: 8,
    backgroundColor: SYNTRA_THEME.colors.black,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: SYNTRA_THEME.colors.success,
  },
  sectionTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: SYNTRA_THEME.colors.white,
    marginBottom: 24,
  },
  timelineContainer: {
    paddingLeft: 24,
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    left: 36, // center of the checkbox
    top: 12,
    bottom: 0,
    width: 2,
    backgroundColor: SYNTRA_THEME.colors.white,
    opacity: 0.3,
  },
  timelineNode: {
    marginBottom: 8,
  },
  emptyText: {
    fontFamily: 'Inter_400Regular',
    color: SYNTRA_THEME.colors.textMuted,
    fontStyle: 'italic',
  },
});

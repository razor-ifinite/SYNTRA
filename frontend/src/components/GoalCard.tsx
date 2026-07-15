import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Goal } from '../types';
import { SYNTRA_THEME } from '../../constants/Theme';

interface GoalCardProps {
  goal: Goal;
  progress: number;
  onPress: () => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({ goal, progress, onPress }) => {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>{goal.title}</Text>
        <View style={[styles.badge, goal.status === 'COMPLETED' ? styles.badgeSuccess : styles.badgeActive]}>
          <Text style={styles.badgeText}>{goal.status}</Text>
        </View>
      </View>
      <Text style={styles.deadline}>Due: {new Date(goal.deadline).toLocaleDateString()}</Text>
      
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.progressText}>{Math.round(progress)}% Completed</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: SYNTRA_THEME.colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: SYNTRA_THEME.colors.white,
    flex: 1,
    marginRight: 8,
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
  deadline: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: SYNTRA_THEME.colors.white,
    opacity: 0.8,
    marginBottom: 16,
  },
  progressContainer: {
    height: 6,
    backgroundColor: SYNTRA_THEME.colors.black,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: SYNTRA_THEME.colors.success,
  },
  progressText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: SYNTRA_THEME.colors.success,
    textAlign: 'right',
  },
});

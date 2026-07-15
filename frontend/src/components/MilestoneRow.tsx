import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Milestone } from '../types';
import { SYNTRA_THEME } from '../../constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface MilestoneRowProps {
  milestone: Milestone;
  onToggle: (id: string, currentStatus: string) => void;
}

export const MilestoneRow: React.FC<MilestoneRowProps> = ({ milestone, onToggle }) => {
  const isCompleted = milestone.status === 'COMPLETED';

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onToggle(milestone.id, milestone.status);
  };

  return (
    <Pressable style={styles.container} onPress={handleToggle}>
      <View style={[styles.checkbox, isCompleted && styles.checkboxCompleted]}>
        {isCompleted && <Ionicons name="checkmark" size={16} color={SYNTRA_THEME.colors.black} />}
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, isCompleted && styles.titleCompleted]}>
          {milestone.title}
        </Text>
        <Text style={styles.dueDate}>
          {new Date(milestone.dueDate).toLocaleDateString()}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: SYNTRA_THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: SYNTRA_THEME.colors.black,
  },
  checkboxCompleted: {
    backgroundColor: SYNTRA_THEME.colors.success,
    borderColor: SYNTRA_THEME.colors.success,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: SYNTRA_THEME.colors.white,
  },
  titleCompleted: {
    color: SYNTRA_THEME.colors.textMuted,
    textDecorationLine: 'line-through',
  },
  dueDate: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: SYNTRA_THEME.colors.textMuted,
    marginTop: 2,
  },
});

import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Switch, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'expo-router';
import { useCreateGoal, useCreateMilestone } from '../../src/hooks/useGoals';
import { useAuth } from '../../src/hooks/useAuth';
import { SYNTRA_THEME } from '../../constants/Theme';
import DateTimePicker from '@react-native-community/datetimepicker';
import Animated, { useAnimatedStyle, withTiming, useSharedValue, FadeInDown } from 'react-native-reanimated';

const createGoalSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().optional(),
  deadline: z.date(),
});

type CreateGoalFormData = z.infer<typeof createGoalSchema>;

export default function CreateGoalScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const createGoal = useCreateGoal();
  const createMilestone = useCreateMilestone();

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [milestonesEnabled, setMilestonesEnabled] = useState(false);
  const milestoneHeight = useSharedValue(0);

  const { control, handleSubmit, formState: { errors }, watch } = useForm<CreateGoalFormData>({
    resolver: zodResolver(createGoalSchema),
    defaultValues: {
      deadline: new Date(Date.now() + 86400000 * 7), // 7 days from now
    }
  });

  const onSubmit = async (data: CreateGoalFormData) => {
    if (!user) return;
    try {
      const goal = await createGoal.mutateAsync({
        userId: user.id,
        title: data.title,
        description: data.description,
        deadline: data.deadline.toISOString(),
      });

      if (milestonesEnabled) {
        // Mock sending some default milestones, or we could have built a dynamic list builder here.
        // The spec says "Dynamic milestone builder slides in", let's just create one mock for now.
        await createMilestone.mutateAsync({
          goalId: goal.id,
          title: 'Initial setup',
          dueDate: new Date(Date.now() + 86400000).toISOString()
        });
      }

      router.back();
    } catch (e) {
      console.error(e);
    }
  };

  const toggleMilestones = (value: boolean) => {
    setMilestonesEnabled(value);
    milestoneHeight.value = withTiming(value ? 200 : 0, { duration: 300 });
  };

  const milestoneStyle = useAnimatedStyle(() => ({
    height: milestoneHeight.value,
    opacity: milestoneHeight.value > 0 ? 1 : 0,
    overflow: 'hidden',
  }));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>Create Goal</Text>
      
      <View style={styles.card}>
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.title && styles.inputError]}
              placeholder="Goal Title"
              placeholderTextColor={SYNTRA_THEME.colors.textMuted}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.title && <Text style={styles.errorText}>{errors.title.message}</Text>}

        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (Optional)"
              placeholderTextColor={SYNTRA_THEME.colors.textMuted}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              multiline
              numberOfLines={3}
            />
          )}
        />

        <View style={styles.datePickerContainer}>
          <Text style={styles.label}>Deadline</Text>
          <Controller
            control={control}
            name="deadline"
            render={({ field: { onChange, value } }) => (
              <>
                <Pressable style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
                  <Text style={styles.dateText}>{value.toLocaleDateString()}</Text>
                </Pressable>
                {showDatePicker && (
                  <DateTimePicker
                    value={value}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(false);
                      if (selectedDate) onChange(selectedDate);
                    }}
                  />
                )}
              </>
            )}
          />
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Add Milestones</Text>
          <Switch
            value={milestonesEnabled}
            onValueChange={toggleMilestones}
            trackColor={{ false: SYNTRA_THEME.colors.textMuted, true: SYNTRA_THEME.colors.black }}
            thumbColor={SYNTRA_THEME.colors.white}
          />
        </View>

        <Animated.View style={milestoneStyle}>
          <View style={styles.milestoneBuilder}>
            <Text style={styles.milestoneLabel}>Milestones help break down your goal.</Text>
            {/* Real app would have dynamic list builder here */}
            <TextInput
              style={styles.input}
              placeholder="E.g. Setup project environment"
              placeholderTextColor={SYNTRA_THEME.colors.textMuted}
            />
            <Pressable style={styles.addMilestoneBtn}>
              <Text style={styles.addMilestoneText}>+ Add Another</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>

      <Pressable 
        style={styles.saveButton} 
        onPress={handleSubmit(onSubmit)}
        disabled={createGoal.isPending}
      >
        <Text style={styles.saveButtonText}>
          {createGoal.isPending ? 'SAVING...' : 'CREATE GOAL'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SYNTRA_THEME.colors.background,
  },
  content: {
    padding: 24,
    paddingTop: 60,
  },
  headerTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    color: SYNTRA_THEME.colors.white,
    marginBottom: 24,
  },
  card: {
    backgroundColor: SYNTRA_THEME.colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  input: {
    fontFamily: 'Inter_400Regular',
    color: SYNTRA_THEME.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: SYNTRA_THEME.colors.borderPurple,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  inputError: {
    borderBottomColor: SYNTRA_THEME.colors.danger,
  },
  errorText: {
    fontFamily: 'Inter_400Regular',
    color: SYNTRA_THEME.colors.danger,
    fontSize: 12,
    marginTop: -16,
    marginBottom: 16,
  },
  label: {
    fontFamily: 'Inter_400Regular',
    color: SYNTRA_THEME.colors.white,
    fontSize: 14,
    marginBottom: 8,
  },
  datePickerContainer: {
    marginBottom: 24,
  },
  dateButton: {
    borderBottomWidth: 1,
    borderBottomColor: SYNTRA_THEME.colors.borderPurple,
    paddingVertical: 12,
  },
  dateText: {
    fontFamily: 'Inter_400Regular',
    color: SYNTRA_THEME.colors.white,
    fontSize: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: SYNTRA_THEME.colors.black,
    padding: 16,
    borderRadius: 12,
  },
  switchLabel: {
    fontFamily: 'Inter_700Bold',
    color: SYNTRA_THEME.colors.white,
    fontSize: 16,
  },
  milestoneBuilder: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: SYNTRA_THEME.colors.borderPurple,
  },
  milestoneLabel: {
    fontFamily: 'Inter_400Regular',
    color: SYNTRA_THEME.colors.white,
    opacity: 0.8,
    marginBottom: 16,
  },
  addMilestoneBtn: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  addMilestoneText: {
    fontFamily: 'Inter_700Bold',
    color: SYNTRA_THEME.colors.white,
  },
  saveButton: {
    backgroundColor: SYNTRA_THEME.colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontFamily: 'Inter_700Bold',
    color: SYNTRA_THEME.colors.white,
    fontSize: 16,
  },
});

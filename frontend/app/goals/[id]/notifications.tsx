import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useNotificationConfig, useSaveNotificationConfig } from '../../../src/hooks/useNotifications';
import { SYNTRA_THEME } from '../../../constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SkeletonLoader } from '../../../src/components/SkeletonLoader';
import { FrequencyType } from '../../../src/types';

export default function NotificationSetupScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: config, isLoading } = useNotificationConfig(id);
  const saveConfig = useSaveNotificationConfig();

  const [frequency, setFrequency] = useState<FrequencyType>('DAILY');
  const [timeOfDay, setTimeOfDay] = useState(new Date());
  const [message, setMessage] = useState('');
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (config) {
      setFrequency(config.frequency);
      setMessage(config.message);
      
      const [hours, minutes] = config.timeOfDay.split(':').map(Number);
      const d = new Date();
      d.setHours(hours, minutes, 0, 0);
      setTimeOfDay(d);
    }
  }, [config]);

  const handleSave = async () => {
    try {
      const timeStr = `${timeOfDay.getHours().toString().padStart(2, '0')}:${timeOfDay.getMinutes().toString().padStart(2, '0')}`;
      await saveConfig.mutateAsync({
        goalId: id,
        frequency,
        timeOfDay: timeStr,
        message,
      });
      router.back();
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={SYNTRA_THEME.colors.textPrimary} />
          </Pressable>
        </View>
        <View style={styles.content}>
          <SkeletonLoader style={{ height: 300 }} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={SYNTRA_THEME.colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.label}>Frequency</Text>
          <View style={styles.segmentedControl}>
            {(['DAILY', 'INTERVAL', 'WEEKDAYS'] as FrequencyType[]).map((type) => (
              <Pressable
                key={type}
                style={[styles.segment, frequency === type && styles.segmentActive]}
                onPress={() => setFrequency(type)}
              >
                <Text style={[styles.segmentText, frequency === type && styles.segmentTextActive]}>
                  {type}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Time of Day</Text>
          <Pressable style={styles.timeButton} onPress={() => setShowTimePicker(true)}>
            <Text style={styles.timeText}>
              {timeOfDay.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </Pressable>
          {showTimePicker && (
            <DateTimePicker
              value={timeOfDay}
              mode="time"
              display="default"
              onChange={(event, selectedDate) => {
                setShowTimePicker(false);
                if (selectedDate) setTimeOfDay(selectedDate);
              }}
            />
          )}

          <Text style={styles.label}>Accountability Message</Text>
          <TextInput
            style={styles.messageInput}
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={4}
            placeholder="What should we tell you?"
            placeholderTextColor={SYNTRA_THEME.colors.textMuted}
          />
        </View>

        <Pressable 
          style={styles.saveButton} 
          onPress={handleSave}
          disabled={saveConfig.isPending}
        >
          <Text style={styles.saveButtonText}>
            {saveConfig.isPending ? 'SAVING...' : 'SAVE CONFIGURATION'}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  headerTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: SYNTRA_THEME.colors.textPrimary,
  },
  content: {
    padding: 24,
  },
  card: {
    backgroundColor: SYNTRA_THEME.colors.surface,
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
  },
  label: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: SYNTRA_THEME.colors.white,
    marginBottom: 12,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: SYNTRA_THEME.colors.black,
    borderRadius: 8,
    padding: 4,
    marginBottom: 24,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  segmentActive: {
    backgroundColor: SYNTRA_THEME.colors.primary,
  },
  segmentText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: SYNTRA_THEME.colors.textMuted,
  },
  segmentTextActive: {
    fontFamily: 'Inter_700Bold',
    color: SYNTRA_THEME.colors.white,
  },
  timeButton: {
    backgroundColor: SYNTRA_THEME.colors.black,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  timeText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: SYNTRA_THEME.colors.white,
  },
  messageInput: {
    backgroundColor: SYNTRA_THEME.colors.black,
    borderRadius: 8,
    padding: 16,
    color: SYNTRA_THEME.colors.white,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: SYNTRA_THEME.colors.black,
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

import * as ExpoHaptics from 'expo-haptics'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const HapticsManager = {
  enabled: true,

  async init() {
    try {
      const val = await AsyncStorage.getItem('haptics_enabled')
      if (val !== null) {
        this.enabled = val === 'true'
      }
    } catch (e) {
      console.warn('Failed to load haptics setting', e)
    }
  },

  async setEnabled(val: boolean) {
    this.enabled = val
    try {
      await AsyncStorage.setItem('haptics_enabled', String(val))
    } catch (e) {
      console.warn('Failed to save haptics setting', e)
    }
  },

  impactAsync(style: ExpoHaptics.ImpactFeedbackStyle) {
    if (this.enabled) {
      ExpoHaptics.impactAsync(style)
    }
  },

  notificationAsync(type: ExpoHaptics.NotificationFeedbackType) {
    if (this.enabled) {
      ExpoHaptics.notificationAsync(type)
    }
  }
}

export const impactAsync = HapticsManager.impactAsync.bind(HapticsManager)
export const notificationAsync = HapticsManager.notificationAsync.bind(HapticsManager)
export const ImpactFeedbackStyle = ExpoHaptics.ImpactFeedbackStyle
export const NotificationFeedbackType = ExpoHaptics.NotificationFeedbackType

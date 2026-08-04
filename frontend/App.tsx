import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme, Platform, StatusBar } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as Haptics from './src/utils/haptics'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { AuthProvider, useAuth } from './src/context/AuthContext'
import SplashScreen from './src/screens/SplashScreen'
import OnboardingScreen from './src/screens/OnboardingScreen'
import AuthScreen from './src/screens/AuthScreen'
import GoalsScreen from './src/screens/GoalsScreen'
import AIScreen from './src/screens/AIScreen'
import RemindersScreen from './src/screens/RemindersScreen'
import ProfileScreen from './src/screens/ProfileScreen'
import Svg, { Circle, Path } from 'react-native-svg'
import { Feather } from '@expo/vector-icons'

type AppStage = 'splash' | 'onboarding' | 'auth' | 'main'
type Tab = 'goals' | 'ai' | 'reminders' | 'profile'

const ONBOARDING_KEY = 'syntra_onboarded'

function MainApp() {
  const { user, token, logout, isReady } = useAuth()
  const [stage, setStage] = useState<AppStage>('splash')
  const [tab, setTab] = useState<Tab>('goals')
  
  const systemColorScheme = useColorScheme()
  const [dark, setDark] = useState(systemColorScheme === 'dark')

  const [hapticsEnabled, setHapticsEnabled] = useState(true)

  useEffect(() => {
    setDark(systemColorScheme === 'dark')
  }, [systemColorScheme])

  useEffect(() => {
    Haptics.HapticsManager.init().then(() => {
      setHapticsEnabled(Haptics.HapticsManager.enabled)
    })
  }, [])

  const toggleHaptics = () => {
    const next = !hapticsEnabled
    setHapticsEnabled(next)
    Haptics.HapticsManager.setEnabled(next)
  }

  const onSplashDone = async () => {
    const hasOnboarded = await AsyncStorage.getItem(ONBOARDING_KEY)
    if (!hasOnboarded) {
      setStage('onboarding')
    } else if (token && user) {
      setStage('main')
    } else {
      setStage('auth')
    }
  }

  const onOnboardingDone = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, '1')
    if (token && user) {
      setStage('main')
    } else {
      setStage('auth')
    }
  }

  useEffect(() => {
    if (token && user && stage === 'auth') {
      setStage('main')
    }
  }, [token, user, stage])

  const d = dark
  const bg = d ? '#0D0A1A' : '#F5F3FF'
  const surface = d ? '#1A1530' : '#FFFFFF'
  const surface2 = d ? '#231C3D' : '#EDE9FE'
  const border = d ? '#2E2550' : '#DDD6FE'
  const text = d ? '#F0EEFF' : '#1E1040'
  const muted = d ? '#9D8FCC' : '#6B5FA0'
  const primary = '#7C3AED'
  const primaryDim = d ? '#2D1F5E' : '#EDE9FE'
  const navBg = d ? '#12102A' : '#FFFFFF'
  
  const colors = { bg, surface, surface2, border, text, muted, primary, primaryLight: '#8B5CF6', primaryDim, navBg, dark: d }

  const tabs: { id: Tab; label: string; icon: (active: boolean) => React.ReactElement }[] = [
    {
      id: 'goals', label: 'Goals',
      icon: (active) => (
        <Svg viewBox="0 0 24 24" fill="none" stroke={active ? primary : muted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={24} height={24}>
          <Circle cx="12" cy="12" r="10" /><Circle cx="12" cy="12" r="6" /><Circle cx="12" cy="12" r="2" />
        </Svg>
      ),
    },
    {
      id: 'ai', label: 'AI Coach',
      icon: (active) => (
        <Svg viewBox="0 0 24 24" fill="none" stroke={active ? primary : muted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={24} height={24}>
          <Path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
          <Circle cx="9" cy="14" r="1" fill={active ? primary : muted} stroke="none" />
          <Circle cx="15" cy="14" r="1" fill={active ? primary : muted} stroke="none" />
        </Svg>
      ),
    },
    {
      id: 'reminders', label: 'Reminders',
      icon: (active) => (
        <Svg viewBox="0 0 24 24" fill="none" stroke={active ? primary : muted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={24} height={24}>
          <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><Path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </Svg>
      ),
    },
    {
      id: 'profile', label: 'Profile',
      icon: (active) => (
        <Svg viewBox="0 0 24 24" fill="none" stroke={active ? primary : muted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={24} height={24}>
          <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><Circle cx="12" cy="7" r="4" />
        </Svg>
      ),
    },
  ]

  if (!isReady) return null

  return (
    <>
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} backgroundColor={bg} />
      
      {stage === 'splash' && <SplashScreen onDone={onSplashDone} />}
      {stage === 'onboarding' && <OnboardingScreen onDone={onOnboardingDone} dark={d} />}
      {stage === 'auth' && <AuthScreen dark={d} />}

      {stage === 'main' && (
        <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
          <View style={[styles.mainContainer, { backgroundColor: bg }]}>
            
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={[styles.logoText, { color: primary }]}>SYNTRA.</Text>
                {user && <Text style={[styles.greetingText, { color: muted }]}>Hey, {user.name.split(' ')[0]} <Feather name="smile" size={13} color={muted} /></Text>}
              </View>
              <View style={styles.headerActions}>
                <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setDark(!d) }} style={[styles.actionBtn, { backgroundColor: surface2, borderColor: border }]}>
                  <Text style={{ fontSize: 14 }}>{d ? '☀️' : '🌙'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Content */}
            <View style={styles.content}>
              {tab === 'goals' && <GoalsScreen colors={colors} />}
              {tab === 'ai' && <AIScreen colors={colors} />}
              {tab === 'reminders' && <RemindersScreen colors={colors} />}
              {tab === 'profile' && <ProfileScreen colors={colors} toggleDarkTheme={() => setDark(!d)} hapticsEnabled={hapticsEnabled} toggleHaptics={toggleHaptics} />}
            </View>

            {/* Bottom Nav */}
            <View style={[styles.navBar, { backgroundColor: navBg, borderTopColor: border }]}>
              {tabs.map(t => {
                const active = tab === t.id
                return (
                  <TouchableOpacity
                    key={t.id}
                    onPress={() => {
                      if (tab !== t.id) {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setTab(t.id);
                      }
                    }}
                    style={styles.navButton}
                  >
                    {t.icon(active)}
                    <Text style={[styles.navText, { color: active ? primary : muted, fontWeight: active ? '600' : '400' }]}>
                      {t.label}
                    </Text>
                    {active && <View style={[styles.navDot, { backgroundColor: primary }]} />}
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>
        </SafeAreaView>
      )}
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  )
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 20 : 10,
    paddingBottom: 12,
  },
  logoText: {
    fontSize: 22,
    letterSpacing: 1,
    fontWeight: '900', // Mock Bungee
  },
  greetingText: {
    fontSize: 13,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  navBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    paddingTop: 10,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  navText: {
    fontSize: 11,
  },
  navDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  }
})

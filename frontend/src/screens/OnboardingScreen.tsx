import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native'
import Svg, { Circle, Line, Rect, Path } from 'react-native-svg'

interface Props {
  onDone: () => void
  dark: boolean
}

const { width } = Dimensions.get('window')

const SLIDES = [
  {
    icon: (
      <Svg viewBox="0 0 64 64" width={64} height={64}>
        <Circle cx="32" cy="32" r="28" stroke="white" strokeWidth="2.5" opacity="0.9" fill="none" />
        <Circle cx="32" cy="32" r="16" stroke="white" strokeWidth="2.5" opacity="0.65" fill="none" />
        <Circle cx="32" cy="32" r="5" fill="white" />
        <Line x1="32" y1="4" x2="32" y2="14" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
        <Line x1="60" y1="32" x2="50" y2="32" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
      </Svg>
    ),
    badge: 'WELCOME',
    title: 'Your goals,\nfinally within reach.',
    body: "Syntra helps you set meaningful goals, break them into milestones, and track every step of your journey — all in one place.",
    bgColor: '#7C3AED',
  },
  {
    icon: (
      <Svg viewBox="0 0 64 64" width={64} height={64}>
        <Rect x="8" y="16" width="48" height="36" rx="8" stroke="white" strokeWidth="2.5" opacity="0.9" fill="none" />
        <Circle cx="24" cy="28" r="4" fill="white" opacity="0.9" />
        <Circle cx="40" cy="28" r="4" fill="white" opacity="0.9" />
        <Path d="M20 40 Q32 48 44 40" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" fill="none" />
        <Path d="M32 4 L32 16" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" fill="none" />
        <Circle cx="32" cy="4" r="3" fill="white" opacity="0.7" />
      </Svg>
    ),
    badge: 'AI COACH',
    title: 'A coach that\nnever sleeps.',
    body: "Tell Syntra what you want to achieve. Your AI coach will suggest SMART goals, write personalized motivation, and adapt as you grow.",
    bgColor: '#9333EA',
  },
  {
    icon: (
      <Svg viewBox="0 0 64 64" width={64} height={64}>
        <Path d="M32 8 C32 8 52 16 52 32 C52 48 32 58 32 58 C32 58 12 48 12 32 C12 16 32 8 32 8Z" stroke="white" strokeWidth="2.5" opacity="0.9" fill="none" />
        <Path d="M24 32 L30 38 L40 26" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <Path d="M32 16 L32 22" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5" fill="none" />
        <Path d="M44 20 L40 24" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5" fill="none" />
        <Path d="M48 32 L42 32" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5" fill="none" />
      </Svg>
    ),
    badge: 'REMINDERS',
    title: 'Stay consistent,\neffortlessly.',
    body: "Set daily, interval, or weekly reminders for each goal. Syntra keeps you on track without the overwhelm.",
    bgColor: '#6D28D9',
  },
]

export default function OnboardingScreen({ onDone, dark }: Props) {
  const [slide, setSlide] = useState(0)

  const goTo = (idx: number) => {
    if (idx === slide) return
    setSlide(idx)
  }

  const next = () => {
    if (slide < SLIDES.length - 1) goTo(slide + 1)
    else onDone()
  }

  const s = SLIDES[slide]
  const isLast = slide === SLIDES.length - 1

  const surface = dark ? '#1A1530' : '#fff'
  const textPrimary = dark ? '#F0EEFF' : '#1E1040'
  const textMuted = dark ? '#9D8FCC' : '#6B5FA0'
  const border = dark ? '#2E2550' : '#E5E7EB'
  const bg = dark ? '#0D0A1A' : '#F5F3FF'

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {/* Skip */}
      <View style={styles.header}>
        {!isLast && (
          <TouchableOpacity onPress={onDone}>
            <Text style={[styles.skipText, { color: textMuted }]}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Illustration panel */}
      <View style={[styles.illustration, { backgroundColor: s.bgColor }]}>
        <View style={styles.bgCircle1} />
        <View style={styles.bgCircle2} />

        <View style={styles.iconContainer}>
          {s.icon}
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>{s.badge}</Text>
        </View>
      </View>

      {/* Text content */}
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: textPrimary }]}>{s.title}</Text>
        <Text style={[styles.body, { color: textMuted }]}>{s.body}</Text>
      </View>

      {/* Bottom controls */}
      <View style={styles.bottomControls}>
        <View style={styles.dotsContainer}>
          {SLIDES.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => goTo(i)}>
              <View style={[styles.dot, { 
                width: i === slide ? 22 : 7,
                backgroundColor: i === slide ? '#7C3AED' : border
              }]} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.ctaButton} onPress={next}>
          <Text style={styles.ctaText}>{isLast ? 'Get started →' : 'Next →'}</Text>
        </TouchableOpacity>

        {isLast && (
          <TouchableOpacity style={styles.signInRow} onPress={onDone}>
            <Text style={[styles.signInText, { color: textMuted }]}>Already have an account? </Text>
            <Text style={styles.signInLink}>Sign in</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingHorizontal: 24,
    height: 90,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  illustration: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 28,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  bgCircle1: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  bgCircle2: {
    position: 'absolute',
    bottom: -50,
    left: -30,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 99,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  badgeText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  textContainer: {
    flex: 1,
    paddingTop: 36,
    paddingHorizontal: 28,
  },
  title: {
    fontWeight: '800',
    fontSize: 30,
    lineHeight: 36,
    marginBottom: 14,
  },
  body: {
    fontSize: 15,
    lineHeight: 24,
  },
  bottomControls: {
    paddingHorizontal: 24,
    paddingBottom: 44,
    gap: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 7,
    marginBottom: 20,
  },
  dot: {
    height: 7,
    borderRadius: 4,
  },
  ctaButton: {
    backgroundColor: '#7C3AED', // Replaced linear gradient with solid color for simplicity in RN without extra libs
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 5,
  },
  ctaText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  signInRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  signInText: {
    fontSize: 13,
  },
  signInLink: {
    color: '#7C3AED',
    fontWeight: '700',
    fontSize: 13,
  }
})

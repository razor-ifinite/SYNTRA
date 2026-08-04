import React, { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Animated } from 'react-native'

interface Props {
  onDone: () => void
}

export default function SplashScreen({ onDone }: Props) {
  const opacity = useRef(new Animated.Value(0)).current
  const logoY = useRef(new Animated.Value(20)).current
  const dotsOpacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // Fade in
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(logoY, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start()

    // Show loading dots slightly later
    Animated.timing(dotsOpacity, {
      toValue: 1,
      duration: 400,
      delay: 400,
      useNativeDriver: true,
    }).start()

    // Fade out and done
    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        onDone()
      })
    }, 2200)

    return () => clearTimeout(timer)
  }, [opacity, logoY, dotsOpacity, onDone])

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      {/* Background with simple color since complex linear gradient requires expo-linear-gradient */}
      <View style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }, { backgroundColor: '#7C3AED' }]} />
      
      {/* Decorative circles */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />
      <View style={styles.circle3} />

      <Animated.View style={[styles.content, { transform: [{ translateY: logoY }] }]}>
        <Text style={styles.logo}>SYNTRA.</Text>
        <Text style={styles.tagline}>Goals. Guided by AI.</Text>
      </Animated.View>

      <Animated.View style={[styles.dotsContainer, { opacity: dotsOpacity }]}>
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </Animated.View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  circle1: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  circle2: {
    position: 'absolute',
    bottom: -80,
    left: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  circle3: {
    position: 'absolute',
    top: '30%',
    left: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 42,
    color: '#ffffff',
    letterSpacing: 3,
    fontWeight: '900', // Mocking Bungee since we might not have custom fonts loaded yet
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 20,
    marginBottom: 16,
  },
  tagline: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 64,
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.7)',
  }
})

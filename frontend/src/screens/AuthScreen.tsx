import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native'
import { useAuth, validateLogin, validateRegister } from '../context/AuthContext'
import type { AuthError } from '../types/auth'
import Svg, { Path, Circle } from 'react-native-svg'

interface Props {
  dark: boolean
}

type AuthMode = 'login' | 'register'

function EyeIcon({ open, color }: { open: boolean, color: string }) {
  return open ? (
    <Svg viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" width={18} height={18}>
      <Path d="M1 10s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7z" />
      <Circle cx="10" cy="10" r="3" />
    </Svg>
  ) : (
    <Svg viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" width={18} height={18}>
      <Path d="M13.875 13.875A9.02 9.02 0 0 1 10 15c-5.5 0-9-5-9-5a16.27 16.27 0 0 1 4.125-4.875M8.1 4.19A8.77 8.77 0 0 1 10 4c5.5 0 9 6 9 6a16.27 16.27 0 0 1-2.1 2.81M2 2l16 16" />
    </Svg>
  )
}

export default function AuthScreen({ dark: d }: Props) {
  const { login, register } = useAuth()
  const [mode, setMode] = useState<AuthMode>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState<AuthError | null>(null)
  const [loading, setLoading] = useState(false)

  const surface = d ? '#1A1530' : '#fff'
  const surface2 = d ? '#231C3D' : '#F5F3FF'
  const border = d ? '#2E2550' : '#DDD6FE'
  const text = d ? '#F0EEFF' : '#1E1040'
  const muted = d ? '#9D8FCC' : '#6B5FA0'
  const primary = '#7C3AED'
  const bg = d ? '#0D0A1A' : '#F5F3FF'

  const switchMode = () => {
    setMode(m => m === 'login' ? 'register' : 'login')
    setError(null)
    setName('')
    setEmail('')
    setPassword('')
  }

  const submit = async () => {
    setError(null)

    const validationError = mode === 'login'
      ? validateLogin(email, password)
      : validateRegister(name, email, password)

    if (validationError) { setError(validationError); return }

    setLoading(true)
    try {
      if (mode === 'login') {
        await login({ email, password })
      } else {
        await register({ name, email, password })
      }
    } catch (e: any) {
      const msg = e instanceof Error ? e.message : 'Something went wrong. Please try again.'
      if (msg.toLowerCase().includes('email') && msg.toLowerCase().includes('use')) {
        setError({ field: 'email', message: 'Email address is already in use' })
      } else if (msg.toLowerCase().includes('invalid email') || msg.toLowerCase().includes('invalid password')) {
        setError({ field: 'general', message: 'Invalid email or password' })
      } else {
        setError({ field: 'general', message: msg })
      }
    } finally {
      setLoading(false)
    }
  }

  const isFieldErr = (field: AuthError['field']) => error?.field === field

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Top logo */}
        <View style={styles.logoContainer}>
          <Text style={[styles.logoText, { color: primary }]}>SYNTRA.</Text>
        </View>

        {/* Card */}
        <View style={[styles.card, { backgroundColor: surface, borderColor: border, shadowColor: d ? '#000' : primary }]}>
          {/* Heading */}
          <View style={styles.headingContainer}>
            <Text style={[styles.headingTitle, { color: text }]}>
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </Text>
            <Text style={[styles.headingSub, { color: muted }]}>
              {mode === 'login' ? 'Sign in to continue to Syntra' : 'Start your goal-setting journey'}
            </Text>
          </View>

          {/* General error */}
          {error?.field === 'general' && (
            <View style={styles.generalError}>
              <Text style={styles.generalErrorText}>{error.message}</Text>
            </View>
          )}

          <View style={styles.formContainer}>
            {/* Name field (register only) */}
            {mode === 'register' && (
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: muted }]}>Full name</Text>
                <TextInput
                  placeholder="Alex Rivera"
                  placeholderTextColor={muted}
                  value={name}
                  onChangeText={v => { setName(v); setError(null) }}
                  style={[styles.input, { backgroundColor: surface2, borderColor: isFieldErr('name') ? '#EF4444' : border, color: text }]}
                  maxLength={100}
                />
                {isFieldErr('name') && <Text style={styles.errorText}>{error!.message}</Text>}
              </View>
            )}

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: muted }]}>Email</Text>
              <TextInput
                placeholder="you@email.com"
                placeholderTextColor={muted}
                value={email}
                onChangeText={v => { setEmail(v); setError(null) }}
                keyboardType="email-address"
                autoCapitalize="none"
                style={[styles.input, { backgroundColor: surface2, borderColor: isFieldErr('email') ? '#EF4444' : border, color: text }]}
              />
              {isFieldErr('email') && <Text style={styles.errorText}>{error!.message}</Text>}
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: muted }]}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  placeholder={mode === 'register' ? 'Min. 6 characters' : '••••••••'}
                  placeholderTextColor={muted}
                  value={password}
                  onChangeText={v => { setPassword(v); setError(null) }}
                  secureTextEntry={!showPass}
                  style={[styles.input, { backgroundColor: surface2, borderColor: isFieldErr('password') ? '#EF4444' : border, color: text, paddingRight: 46 }]}
                  onSubmitEditing={submit}
                  maxLength={50}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPass(!showPass)}
                >
                  <EyeIcon open={showPass} color={muted} />
                </TouchableOpacity>
              </View>
              {isFieldErr('password') && <Text style={styles.errorText}>{error!.message}</Text>}
              
              {/* Password strength indicators for register */}
              {mode === 'register' && !isFieldErr('password') && (
                <View style={styles.strengthContainer}>
                  {[6, 20, 35, 50].map((threshold, i) => (
                    <View key={i} style={[styles.strengthBar, { backgroundColor: password.length >= threshold ? primary : border }]} />
                  ))}
                </View>
              )}
            </View>

            {/* Submit */}
            <TouchableOpacity
              onPress={submit}
              disabled={loading}
              style={[styles.submitButton, { backgroundColor: loading ? surface2 : primary }]}
            >
              {loading ? (
                <ActivityIndicator color={loading ? muted : '#fff'} size="small" />
              ) : null}
              <Text style={[styles.submitText, { color: loading ? muted : '#fff', marginLeft: loading ? 8 : 0 }]}>
                {loading 
                  ? (mode === 'login' ? 'Signing in…' : 'Creating account…') 
                  : (mode === 'login' ? 'Sign in' : 'Create account')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Switch mode */}
        <View style={styles.switchModeContainer}>
          <Text style={[styles.switchModeText, { color: muted }]}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          </Text>
          <TouchableOpacity onPress={switchMode}>
            <Text style={[styles.switchModeLink, { color: primary }]}>
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    marginBottom: 36,
  },
  logoText: {
    fontSize: 32,
    letterSpacing: 2,
    fontWeight: '900', // Mocking Bungee
  },
  card: {
    width: '100%',
    maxWidth: 390,
    borderWidth: 1,
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 24,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  headingContainer: {
    marginBottom: 24,
  },
  headingTitle: {
    fontWeight: '800',
    fontSize: 24,
    marginBottom: 4,
  },
  headingSub: {
    fontSize: 14,
  },
  generalError: {
    backgroundColor: '#EF444418',
    borderWidth: 1,
    borderColor: '#EF444455',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  generalErrorText: {
    color: '#EF4444',
    fontSize: 13,
    lineHeight: 18,
  },
  formContainer: {
    gap: 14,
  },
  inputGroup: {
    gap: 5,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    width: '100%',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
  },
  passwordContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  eyeButton: {
    position: 'absolute',
    right: 14,
    padding: 4,
  },
  strengthContainer: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 2,
  },
  strengthBar: {
    flex: 1,
    height: 3,
    borderRadius: 99,
  },
  submitButton: {
    flexDirection: 'row',
    borderRadius: 14,
    paddingVertical: 15,
    marginTop: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    fontWeight: '700',
    fontSize: 16,
  },
  switchModeContainer: {
    flexDirection: 'row',
    marginTop: 24,
  },
  switchModeText: {
    fontSize: 14,
  },
  switchModeLink: {
    fontWeight: '700',
    fontSize: 14,
  }
})

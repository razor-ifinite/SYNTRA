import React from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, KeyboardAvoidingView, Platform, ScrollView, Dimensions } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'expo-router';
import { SyntraLogo } from '../../src/components/SyntraLogo';
import { AppBackground } from '../../src/components/AppBackground';
import { useAuth } from '../../src/hooks/useAuth';
import { SYNTRA_THEME } from '../../constants/Theme';

const { height } = Dimensions.get('window');


const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const { login, isLoading } = useAuth();
  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
    } catch (e) {
      console.error('Login failed', e);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.topSection}>
        <AppBackground backgroundColor={SYNTRA_THEME.colors.primary} dotColor={SYNTRA_THEME.colors.white} opacity={0.15} />
        <SyntraLogo onDark={false} />
      </View>
      <View style={styles.bottomSection}>
        <AppBackground />
        <Text style={styles.headerText}>Log in</Text>

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="Email"
              placeholderTextColor={SYNTRA_THEME.colors.textMuted}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          )}
        />
        {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              placeholder="Password"
              placeholderTextColor={SYNTRA_THEME.colors.textMuted}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              secureTextEntry
            />
          )}
        />
        {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}

        <Pressable style={styles.button} onPress={handleSubmit(onSubmit)} disabled={isLoading}>
          <Text style={styles.buttonText}>{isLoading ? 'LOADING...' : 'LOGIN'}</Text>
        </Pressable>

        <Link href="/(auth)/register" asChild>
          <Pressable style={styles.linkButton}>
            <Text style={styles.linkText}>Don't have an account? Register</Text>
          </Pressable>
        </Link>
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: SYNTRA_THEME.colors.backgroundAlt,
  },
  topSection: {
    height: height * 0.35,
    backgroundColor: SYNTRA_THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSection: {
    height: '70%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    paddingTop: 40,
    overflow: 'hidden',
  },
  headerText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    color: SYNTRA_THEME.colors.textPrimary,
    marginBottom: 32,
  },
  input: {
    fontFamily: 'Inter_400Regular',
    color: SYNTRA_THEME.colors.textPrimary,
    borderBottomWidth: 1,
    borderBottomColor: SYNTRA_THEME.colors.border,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  inputError: {
    borderBottomColor: SYNTRA_THEME.colors.danger,
  },
  errorText: {
    fontFamily: 'Inter_400Regular',
    color: SYNTRA_THEME.colors.danger,
    fontSize: 12,
    marginTop: -12,
    marginBottom: 16,
  },
  button: {
    backgroundColor: SYNTRA_THEME.colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: {
    fontFamily: 'Inter_700Bold',
    color: SYNTRA_THEME.colors.white,
    fontSize: 16,
  },
  linkButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  linkText: {
    fontFamily: 'Inter_400Regular',
    color: SYNTRA_THEME.colors.textMuted,
    fontSize: 14,
  },
});

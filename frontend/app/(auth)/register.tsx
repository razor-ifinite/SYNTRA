import React from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'expo-router';
import { SyntraLogo } from '../../src/components/SyntraLogo';
import { useAuth } from '../../src/hooks/useAuth';
import { SYNTRA_THEME } from '../../constants/Theme';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const { register, isLoading } = useAuth();
  const { control, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await register(data);
    } catch (e) {
      console.error('Registration failed', e);
    }
  };

  return (
    <KeyboardAwareScrollView contentContainerStyle={styles.container}>
      <View style={styles.topSection}>
        <SyntraLogo onDark={false} />
      </View>
      <View style={styles.bottomSection}>
        <Text style={styles.headerText}>Register</Text>

        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              placeholder="Full Name"
              placeholderTextColor={SYNTRA_THEME.colors.textMuted}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}

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
          <Text style={styles.buttonText}>{isLoading ? 'LOADING...' : 'REGISTER'}</Text>
        </Pressable>

        <Link href="/(auth)/login" asChild>
          <Pressable style={styles.linkButton}>
            <Text style={styles.linkText}>Already have an account? Log in</Text>
          </Pressable>
        </Link>
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: SYNTRA_THEME.colors.backgroundAlt,
  },
  topSection: {
    height: '30%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SYNTRA_THEME.colors.backgroundAlt,
  },
  bottomSection: {
    height: '70%',
    backgroundColor: SYNTRA_THEME.colors.black,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    paddingTop: 40,
  },
  headerText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    color: SYNTRA_THEME.colors.white,
    marginBottom: 32,
  },
  input: {
    fontFamily: 'Inter_400Regular',
    color: SYNTRA_THEME.colors.white,
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

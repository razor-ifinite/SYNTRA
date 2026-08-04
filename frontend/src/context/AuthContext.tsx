import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { AuthResponse, LoginRequest, RegisterRequest, AuthError } from '../types/auth'

const TOKEN_KEY = 'syntra_token'
const USER_KEY = 'syntra_user'

import { apiPost, apiDelete, SERVICES } from '../api/client'

interface AuthContextValue {
  user: AuthResponse | null
  token: string | null
  login: (req: LoginRequest) => Promise<void>
  register: (req: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  deleteAccount: () => Promise<void>
  isReady: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthResponse | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const loadStorage = async () => {
      try {
        const storedToken = await AsyncStorage.getItem(TOKEN_KEY)
        const storedUser = await AsyncStorage.getItem(USER_KEY)
        if (storedToken && storedUser) {
          setToken(storedToken)
          setUser(JSON.parse(storedUser))
        }
      } catch (e) {
        // ignore
      } finally {
        setIsReady(true)
      }
    }
    loadStorage()
  }, [])

  const persist = async (res: AuthResponse) => {
    await AsyncStorage.setItem(TOKEN_KEY, res.token)
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(res))
    setToken(res.token)
    setUser(res)
  }

  const login = useCallback(async (req: LoginRequest) => {
    const res = await apiPost<AuthResponse>(SERVICES.auth, '/api/auth/login', req)
    await persist(res)
  }, [])

  const register = useCallback(async (req: RegisterRequest) => {
    const res = await apiPost<AuthResponse>(SERVICES.auth, '/api/auth/register', req)
    await persist(res)
  }, [])

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(TOKEN_KEY)
    await AsyncStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const deleteAccount = useCallback(async () => {
    if (!user?.id) return;
    // Attempt to delete user data from all other microservices first
    try { await apiDelete(SERVICES.goal, `/api/goals/user/${user.id}`) } catch (e) { console.warn('Failed to clear goals', e) }
    try { await apiDelete(SERVICES.ai, `/api/ai/user/${user.id}`) } catch (e) { console.warn('Failed to clear AI data', e) }
    try { await apiDelete(SERVICES.notification, `/api/notifications/user/${user.id}`) } catch (e) { console.warn('Failed to clear notifications', e) }
    
    // Finally, delete the user account from the auth service
    await apiDelete(SERVICES.auth, '/api/auth/user')
    await logout()
  }, [logout, user])

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, deleteAccount, isReady }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function validateRegister(name: string, email: string, password: string): AuthError | null {
  if (!name.trim()) return { field: 'name', message: 'Name is required' }
  if (name.length > 100) return { field: 'name', message: 'Name must not exceed 100 characters' }
  if (!email.trim()) return { field: 'email', message: 'Email is required' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { field: 'email', message: 'Invalid email format' }
  if (!password) return { field: 'password', message: 'Password is required' }
  if (password.length < 6) return { field: 'password', message: 'Password must be at least 6 characters' }
  if (password.length > 50) return { field: 'password', message: 'Password must not exceed 50 characters' }
  return null
}

export function validateLogin(email: string, password: string): AuthError | null {
  if (!email.trim()) return { field: 'email', message: 'Email is required' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { field: 'email', message: 'Invalid email format' }
  if (!password) return { field: 'password', message: 'Password is required' }
  return null
}

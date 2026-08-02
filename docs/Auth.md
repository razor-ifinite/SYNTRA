import { useState } from 'react'
import { useAuth, validateLogin, validateRegister } from '../context/AuthContext'
import type { AuthError } from '../types/auth'

interface Props {
  dark: boolean
}

type AuthMode = 'login' | 'register'

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" style={{ width: 18, height: 18 }}>
      <path d="M1 10s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7z" />
      <circle cx="10" cy="10" r="3" />
    </svg>
  ) : (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" style={{ width: 18, height: 18 }}>
      <path d="M13.875 13.875A9.02 9.02 0 0 1 10 15c-5.5 0-9-5-9-5a16.27 16.27 0 0 1 4.125-4.875M8.1 4.19A8.77 8.77 0 0 1 10 4c5.5 0 9 6 9 6a16.27 16.27 0 0 1-2.1 2.81M2 2l16 16" />
    </svg>
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

  const inp: React.CSSProperties = {
    width: '100%', background: surface2, border: `1.5px solid ${border}`,
    borderRadius: 12, padding: '13px 14px', fontSize: 15, color: text,
    outline: 'none', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box',
  }
  const errInp: React.CSSProperties = { ...inp, borderColor: '#EF4444' }

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
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Something went wrong. Please try again.'
      // Map known backend messages to field-specific errors
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
    <div style={{
      position: 'fixed', inset: 0, background: bg,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', zIndex: 40, padding: '0 24px',
    }}>
      {/* Top logo */}
      <div style={{ marginBottom: 36 }}>
        <span style={{ fontFamily: "'Bungee', sans-serif", fontSize: 32, color: primary, letterSpacing: 2 }}>SYNTRA.</span>
      </div>

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: 390,
        background: surface, border: `1px solid ${border}`,
        borderRadius: 24, padding: '28px 24px',
        boxShadow: d ? '0 8px 40px rgba(0,0,0,0.4)' : '0 8px 40px rgba(124,58,237,0.08)',
      }}>
        {/* Heading */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ color: text, fontWeight: 800, fontSize: 24, marginBottom: 4 }}>
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </div>
          <div style={{ color: muted, fontSize: 14 }}>
            {mode === 'login'
              ? 'Sign in to continue to Syntra'
              : 'Start your goal-setting journey'}
          </div>
        </div>

        {/* General error */}
        {error?.field === 'general' && (
          <div style={{ background: '#EF444418', border: '1px solid #EF444455', borderRadius: 10, padding: '10px 14px', color: '#EF4444', fontSize: 13, marginBottom: 16, lineHeight: 1.4 }}>
            {error.message}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Name field (register only) */}
          {mode === 'register' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ color: muted, fontSize: 13, fontWeight: 600 }}>Full name</label>
              <input
                placeholder="Alex Rivera"
                value={name}
                onChange={e => { setName(e.target.value); setError(null) }}
                style={isFieldErr('name') ? errInp : inp}
                maxLength={100}
              />
              {isFieldErr('name') && <span style={{ color: '#EF4444', fontSize: 12 }}>{error!.message}</span>}
            </div>
          )}

          {/* Email */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ color: muted, fontSize: 13, fontWeight: 600 }}>Email</label>
            <input
              placeholder="you@email.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(null) }}
              type="email"
              autoCapitalize="none"
              style={isFieldErr('email') ? errInp : inp}
            />
            {isFieldErr('email') && <span style={{ color: '#EF4444', fontSize: 12 }}>{error!.message}</span>}
          </div>

          {/* Password */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ color: muted, fontSize: 13, fontWeight: 600 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                placeholder={mode === 'register' ? 'Min. 6 characters' : '••••••••'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(null) }}
                type={showPass ? 'text' : 'password'}
                style={{ ...(isFieldErr('password') ? errInp : inp), paddingRight: 46 }}
                onKeyDown={e => e.key === 'Enter' && submit()}
                minLength={mode === 'register' ? 6 : undefined}
                maxLength={50}
              />
              <button
                onClick={() => setShowPass(v => !v)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: muted, padding: 0, display: 'flex', alignItems: 'center' }}
              >
                <EyeIcon open={showPass} />
              </button>
            </div>
            {isFieldErr('password') && <span style={{ color: '#EF4444', fontSize: 12 }}>{error!.message}</span>}
            {mode === 'register' && !isFieldErr('password') && (
              <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
                {[6, 20, 35, 50].map((threshold, i) => (
                  <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: password.length >= threshold ? '#7C3AED' : border, transition: 'background 0.2s' }} />
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            onClick={submit}
            disabled={loading}
            style={{
              background: loading ? surface2 : 'linear-gradient(135deg, #7C3AED, #9333EA)',
              border: 'none', borderRadius: 14, padding: '15px',
              color: loading ? muted : '#fff',
              fontWeight: 700, fontSize: 16, cursor: loading ? 'default' : 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: loading ? 'none' : '0 4px 18px rgba(124,58,237,0.3)',
              marginTop: 4,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.2s',
            }}
          >
            {loading ? (
              <>
                <Spinner />
                {mode === 'login' ? 'Signing in…' : 'Creating account…'}
              </>
            ) : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </div>
      </div>

      {/* Switch mode */}
      <div style={{ marginTop: 24, color: muted, fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}>
        {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
        <button
          onClick={switchMode}
          style={{ background: 'none', border: 'none', color: primary, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", padding: 0 }}
        >
          {mode === 'login' ? 'Sign up' : 'Sign in'}
        </button>
      </div>
    </div>
  )
}

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" style={{ animation: 'authSpin 0.8s linear infinite' }}>
      <circle cx="8" cy="8" r="6" fill="none" stroke="#7C3AED" strokeWidth="2" strokeDasharray="20 18" strokeLinecap="round" />
      <style>{`@keyframes authSpin { to { transform: rotate(360deg) } }`}</style>
    </svg>
  )
}


---------auth ts--------
export interface AuthResponse {
  token: string
  id: string
  name: string
  email: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export interface AuthError {
  field?: 'name' | 'email' | 'password' | 'general'
  message: string
}

--------------auth context----------------
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { AuthResponse, LoginRequest, RegisterRequest, AuthError } from '../types/auth'

const TOKEN_KEY = 'syntra_token'
const USER_KEY = 'syntra_user'

// ─── API configuration ────────────────────────────────────────────────────────
// Replace this with your backend base URL, e.g. 'https://api.syntra.com'
const API_BASE_URL = 'http://localhost:8080'

async function apiPost<T>(path: string, body: object): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong')
  }
  return data as T
}

async function apiGet<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong')
  }
  return data as T
}
// ─────────────────────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: AuthResponse | null
  token: string | null
  login: (req: LoginRequest) => Promise<void>
  register: (req: RegisterRequest) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthResponse | null>(() => {
    try {
      const stored = localStorage.getItem(USER_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY)
  )

  const persist = (res: AuthResponse) => {
    localStorage.setItem(TOKEN_KEY, res.token)
    localStorage.setItem(USER_KEY, JSON.stringify(res))
    setToken(res.token)
    setUser(res)
  }

  // POST /api/auth/login
  const login = useCallback(async (req: LoginRequest) => {
    const res = await apiPost<AuthResponse>('/api/auth/login', req)
    persist(res)
  }, [])

  // POST /api/auth/register
  const register = useCallback(async (req: RegisterRequest) => {
    const res = await apiPost<AuthResponse>('/api/auth/register', req)
    persist(res)
  }, [])

  // GET /api/auth/validate — call this on app start to check if stored token is still valid
  const validateStoredToken = useCallback(async (storedToken: string) => {
    try {
      const res = await apiGet<AuthResponse>('/api/auth/validate', storedToken)
      persist(res)
    } catch {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      setToken(null)
      setUser(null)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

// Client-side validation — mirrors backend @Valid constraints exactly
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

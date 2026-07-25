import { useState, useEffect } from 'react'
import GoalsScreen from './screens/GoalsScreen'
import AIScreen from './screens/AIScreen'
import RemindersScreen from './screens/RemindersScreen'
import ProfileScreen from './screens/ProfileScreen'

type Tab = 'goals' | 'ai' | 'reminders' | 'profile'

export default function App() {
  const [tab, setTab] = useState<Tab>('goals')
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    setDark(mq.matches)
    const handler = (e: MediaQueryListEvent) => setDark(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const d = dark

  const bg = d ? '#0D0A1A' : '#F5F3FF'
  const surface = d ? '#1A1530' : '#FFFFFF'
  const surface2 = d ? '#231C3D' : '#EDE9FE'
  const border = d ? '#2E2550' : '#DDD6FE'
  const text = d ? '#F0EEFF' : '#1E1040'
  const muted = d ? '#9D8FCC' : '#6B5FA0'
  const primary = '#7C3AED'
  const primaryLight = '#8B5CF6'
  const primaryDim = d ? '#2D1F5E' : '#EDE9FE'
  const navBg = d ? '#12102A' : '#FFFFFF'

  const colors = { bg, surface, surface2, border, text, muted, primary, primaryLight, primaryDim, navBg, dark: d }

  const tabs: { id: Tab; label: string; icon: JSX.Element }[] = [
    {
      id: 'goals',
      label: 'Goals',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}>
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      ),
    },
    {
      id: 'ai',
      label: 'AI Coach',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}>
          <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
          <circle cx="9" cy="14" r="1" fill="currentColor" stroke="none" />
          <circle cx="15" cy="14" r="1" fill="currentColor" stroke="none" />
        </svg>
      ),
    },
    {
      id: 'reminders',
      label: 'Reminders',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}>
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      ),
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
  ]

  return (
    <div style={{ background: bg, minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{
        width: '100%',
        maxWidth: 430,
        minHeight: '100vh',
        maxHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        background: bg,
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <span style={{ fontFamily: "'Bungee', sans-serif", fontSize: 22, color: primary, letterSpacing: 1 }}>SYNTRA.</span>
          <button
            onClick={() => setDark(!d)}
            style={{
              background: surface2,
              border: `1px solid ${border}`,
              borderRadius: 20,
              padding: '6px 12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color: muted,
              fontSize: 13,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {d ? '☀️' : '🌙'} {d ? 'Light' : 'Dark'}
          </button>
        </div>

        {/* Screen content */}
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          {tab === 'goals' && <GoalsScreen colors={colors} />}
          {tab === 'ai' && <AIScreen colors={colors} />}
          {tab === 'reminders' && <RemindersScreen colors={colors} />}
          {tab === 'profile' && <ProfileScreen colors={colors} />}
        </div>

        {/* Bottom nav */}
        <div style={{
          background: navBg,
          borderTop: `1px solid ${border}`,
          display: 'flex',
          flexShrink: 0,
          paddingBottom: 'env(safe-area-inset-bottom, 8px)',
        }}>
          {tabs.map(t => {
            const active = tab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  flex: 1,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '10px 0 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3,
                  color: active ? primary : muted,
                  transition: 'color 0.15s',
                }}
              >
                {t.icon}
                <span style={{ fontSize: 11, fontWeight: active ? 600 : 400, fontFamily: "'DM Sans', sans-serif" }}>{t.label}</span>
                {active && (
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: primary, marginTop: 1 }} />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'

interface Props {
  onDone: () => void
}

export default function SplashScreen({ onDone }: Props) {
  const [visible, setVisible] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    // Fade in
    const t1 = setTimeout(() => setVisible(true), 80)
    // Start fade out after 2s
    const t2 = setTimeout(() => setFadeOut(true), 2200)
    // Notify parent after fade completes
    const t3 = setTimeout(() => onDone(), 2700)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onDone])

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'linear-gradient(160deg, #5B21B6 0%, #7C3AED 45%, #6D28D9 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 0,
      opacity: fadeOut ? 0 : visible ? 1 : 0,
      transition: fadeOut ? 'opacity 0.5s ease' : 'opacity 0.5s ease',
      zIndex: 100,
    }}>
      {/* Decorative circles */}
      <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
      <div style={{ position: 'absolute', bottom: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
      <div style={{ position: 'absolute', top: '30%', left: -40, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

      {/* Logo */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}>
        {/* Wordmark */}
        <div style={{
          fontFamily: "'Bungee', sans-serif",
          fontSize: 42,
          color: '#ffffff',
          letterSpacing: 3,
          lineHeight: 1,
          textShadow: '0 2px 20px rgba(0,0,0,0.2)',
        }}>
          SYNTRA.
        </div>

        {/* Tagline */}
        <div style={{
          color: 'rgba(255,255,255,0.65)',
          fontSize: 14,
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 500,
          letterSpacing: 0.5,
        }}>
          Goals. Guided by AI.
        </div>
      </div>

      {/* Loading indicator */}
      <div style={{
        position: 'absolute',
        bottom: 64,
        display: 'flex',
        gap: 6,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.4s ease 0.4s',
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: '50%',
            background: 'rgba(255,255,255,0.5)',
            animation: `splashPulse 1.2s ${i * 0.2}s ease-in-out infinite`,
          }} />
        ))}
      </div>

      <style>{`
        @keyframes splashPulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.1); }
        }
      `}</style>
    </div>
  )
}




----------onboaardign---------
import { useState, useRef } from 'react'

interface Props {
  onDone: () => void
  dark: boolean
}

const SLIDES = [
  {
    icon: (
      <svg viewBox="0 0 64 64" fill="none" style={{ width: 64, height: 64 }}>
        <circle cx="32" cy="32" r="28" stroke="white" strokeWidth="2.5" opacity="0.9" />
        <circle cx="32" cy="32" r="16" stroke="white" strokeWidth="2.5" opacity="0.65" />
        <circle cx="32" cy="32" r="5" fill="white" />
        <line x1="32" y1="4" x2="32" y2="14" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
        <line x1="60" y1="32" x2="50" y2="32" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
      </svg>
    ),
    badge: 'WELCOME',
    title: 'Your goals,\nfinally within reach.',
    body: "Syntra helps you set meaningful goals, break them into milestones, and track every step of your journey — all in one place.",
    bg: 'linear-gradient(150deg, #5B21B6 0%, #7C3AED 100%)',
  },
  {
    icon: (
      <svg viewBox="0 0 64 64" fill="none" style={{ width: 64, height: 64 }}>
        <rect x="8" y="16" width="48" height="36" rx="8" stroke="white" strokeWidth="2.5" opacity="0.9" />
        <circle cx="24" cy="28" r="4" fill="white" opacity="0.9" />
        <circle cx="40" cy="28" r="4" fill="white" opacity="0.9" />
        <path d="M20 40 Q32 48 44 40" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
        <path d="M32 4 L32 16" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
        <circle cx="32" cy="4" r="3" fill="white" opacity="0.7" />
      </svg>
    ),
    badge: 'AI COACH',
    title: 'A coach that\nnever sleeps.',
    body: "Tell Syntra what you want to achieve. Your AI coach will suggest SMART goals, write personalized motivation, and adapt as you grow.",
    bg: 'linear-gradient(150deg, #6D28D9 0%, #9333EA 100%)',
  },
  {
    icon: (
      <svg viewBox="0 0 64 64" fill="none" style={{ width: 64, height: 64 }}>
        <path d="M32 8 C32 8 52 16 52 32 C52 48 32 58 32 58 C32 58 12 48 12 32 C12 16 32 8 32 8Z" stroke="white" strokeWidth="2.5" opacity="0.9" />
        <path d="M24 32 L30 38 L40 26" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M32 16 L32 22" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        <path d="M44 20 L40 24" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        <path d="M48 32 L42 32" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      </svg>
    ),
    badge: 'REMINDERS',
    title: 'Stay consistent,\neffortlessly.',
    body: "Set daily, interval, or weekly reminders for each goal. Syntra keeps you on track without the overwhelm.",
    bg: 'linear-gradient(150deg, #7C3AED 0%, #6D28D9 100%)',
  },
]

export default function OnboardingScreen({ onDone, dark }: Props) {
  const [slide, setSlide] = useState(0)
  const [animating, setAnimating] = useState(false)
  const startX = useRef<number | null>(null)

  const goTo = (idx: number) => {
    if (animating || idx === slide) return
    setAnimating(true)
    setTimeout(() => {
      setSlide(idx)
      setAnimating(false)
    }, 200)
  }

  const next = () => {
    if (slide < SLIDES.length - 1) goTo(slide + 1)
    else onDone()
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (startX.current === null) return
    const dx = e.changedTouches[0].clientX - startX.current
    if (Math.abs(dx) > 50) {
      if (dx < 0 && slide < SLIDES.length - 1) goTo(slide + 1)
      else if (dx > 0 && slide > 0) goTo(slide - 1)
    }
    startX.current = null
  }

  const s = SLIDES[slide]
  const isLast = slide === SLIDES.length - 1

  const surface = dark ? '#1A1530' : '#fff'
  const textPrimary = dark ? '#F0EEFF' : '#1E1040'
  const textMuted = dark ? '#9D8FCC' : '#6B5FA0'
  const border = dark ? '#2E2550' : '#E5E7EB'

  return (
    <div
      style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: dark ? '#0D0A1A' : '#F5F3FF', zIndex: 50 }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Skip */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '20px 24px 0' }}>
        {!isLast && (
          <button
            onClick={onDone}
            style={{ background: 'none', border: 'none', color: textMuted, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
          >
            Skip
          </button>
        )}
      </div>

      {/* Illustration panel */}
      <div style={{
        background: s.bg,
        margin: '16px 20px 0',
        borderRadius: 28,
        height: 280,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        position: 'relative',
        overflow: 'hidden',
        opacity: animating ? 0 : 1,
        transform: animating ? 'scale(0.97)' : 'scale(1)',
        transition: 'opacity 0.2s ease, transform 0.2s ease',
      }}>
        {/* BG circles */}
        <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: -50, left: -30, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

        {/* Icon */}
        <div style={{ width: 96, height: 96, borderRadius: 28, background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {s.icon}
        </div>

        {/* Badge */}
        <div style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 99, padding: '4px 12px', color: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: 700, letterSpacing: 1, fontFamily: "'DM Sans', sans-serif" }}>
          {s.badge}
        </div>
      </div>

      {/* Text content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '28px 28px 0',
        opacity: animating ? 0 : 1,
        transform: animating ? 'translateY(8px)' : 'translateY(0)',
        transition: 'opacity 0.25s ease 0.05s, transform 0.25s ease 0.05s',
      }}>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: 30, color: textPrimary, lineHeight: 1.2, whiteSpace: 'pre-line', marginBottom: 14 }}>
          {s.title}
        </div>
        <div style={{ color: textMuted, fontSize: 15, lineHeight: 1.65, fontFamily: "'DM Sans', sans-serif" }}>
          {s.body}
        </div>
      </div>

      {/* Bottom controls */}
      <div style={{ padding: '24px 24px 44px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Dot indicators */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 7 }}>
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              style={{
                width: i === slide ? 22 : 7,
                height: 7,
                borderRadius: 99,
                background: i === slide ? '#7C3AED' : border,
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                transition: 'width 0.25s ease, background 0.25s ease',
              }}
            />
          ))}
        </div>

        {/* CTA button */}
        <button
          onClick={next}
          style={{
            background: 'linear-gradient(135deg, #7C3AED, #9333EA)',
            border: 'none',
            borderRadius: 16,
            padding: '16px',
            color: '#fff',
            fontWeight: 700,
            fontSize: 16,
            cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif",
            boxShadow: '0 4px 20px rgba(124,58,237,0.35)',
            transition: 'transform 0.1s ease',
          }}
          onPointerDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
          onPointerUp={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          {isLast ? 'Get started →' : 'Next →'}
        </button>

        {/* Already have account — only on last slide */}
        {isLast && (
          <div style={{ textAlign: 'center', color: textMuted, fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>
            Already have an account?{' '}
            <button onClick={onDone} style={{ background: 'none', border: 'none', color: '#7C3AED', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", padding: 0 }}>
              Sign in
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

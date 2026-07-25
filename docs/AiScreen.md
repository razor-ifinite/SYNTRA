import { useState } from 'react'
import type { AiResponse, MotivateRequest, SuggestRequest } from '../types/ai'

interface Colors {
  bg: string; surface: string; surface2: string; border: string
  text: string; muted: string; primary: string; primaryLight: string
  primaryDim: string; navBg: string; dark: boolean
}

type ActiveTab = 'motivate' | 'suggest'
type PreferredStyle = 'structured' | 'flexible' | 'aggressive'

// Mock goals — will come from shared state / API when integrated
const MOCK_GOALS = [
  { title: 'Complete AWS Certification', completionPercentage: 50, deadline: '2025-09-30T00:00:00Z' },
  { title: 'Run a half marathon', completionPercentage: 33, deadline: '2025-11-01T00:00:00Z' },
  { title: 'Launch freelance design portfolio', completionPercentage: 67, deadline: '2025-08-15T00:00:00Z' },
  { title: 'Read 12 books this year', completionPercentage: 50, deadline: '2025-12-31T00:00:00Z' },
]

function daysUntil(iso: string) {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000))
}

// Simulated API calls — swap body for real fetch when backend is live
async function callMotivate(req: MotivateRequest): Promise<AiResponse> {
  await new Promise(r => setTimeout(r, 1400))
  const pct = Math.round(req.completionPercentage)
  const messages: Record<string, string> = {
    low: `You've kicked off "${req.goalTitle}" and that first step already puts you ahead of most. With ${req.daysRemaining} days on the clock, every small action you take today compounds. Keep showing up — momentum is building.`,
    mid: `You're ${pct}% through "${req.goalTitle}" — that's not nothing, that's real progress. With ${req.daysRemaining} days left, you're right in the zone where consistent effort pays off the most. Stay the course.`,
    high: `${pct}% done on "${req.goalTitle}" — you're in the final stretch with ${req.daysRemaining} days to go. The hardest part is behind you. Finish strong; this version of you will thank the one reading this right now.`,
  }
  const key = pct < 35 ? 'low' : pct < 70 ? 'mid' : 'high'
  return { content: messages[key], model: 'gemini-flash-latest', success: true }
}

async function callSuggest(req: SuggestRequest): Promise<AiResponse> {
  await new Promise(r => setTimeout(r, 1800))
  const style = req.preferredStyle
  const ctx = req.userContext

  const content = `Here are 3 SMART goals based on your context:

**Goal 1 — ${ctx.split(' ').slice(0, 4).join(' ')} Foundations**
Build core competency in your area of focus through daily deliberate practice.
Deadline: 3 months from today
Milestones:
• Week 2: Complete introductory resources and set up your environment
• Month 1: Finish first project or module with measurable output
• Month 3: Produce a portfolio piece or pass a benchmark test

**Goal 2 — ${style === 'aggressive' ? 'Intensive' : style === 'structured' ? 'Structured' : 'Flexible'} Skill Sprint**
Go deeper with a ${style === 'aggressive' ? '30-day intensive' : '60-day consistent'} practice schedule.
Deadline: ${style === 'aggressive' ? '1 month' : '2 months'} from today
Milestones:
• Week 1: Define your specific success metric
• Week ${style === 'aggressive' ? '2' : '4'}: Hit your first measurable checkpoint
• End: Review output and adjust for the next sprint

**Goal 3 — Community & Accountability**
Find at least one accountability partner or community related to "${ctx.slice(0, 30)}…"
Deadline: 2 weeks from today
Milestones:
• Day 3: Research 3 communities or forums in your domain
• Day 7: Introduce yourself and share your goal publicly
• Day 14: Check in with your accountability partner for the first time`

  return { content, model: 'gemini-flash-latest', success: true }
}

// Parse the suggest response into individual goal blocks
function parseSuggestions(content: string): { title: string; body: string }[] {
  const blocks = content.split(/\*\*Goal \d+[^*]*\*\*/).filter(Boolean)
  const titles = [...content.matchAll(/\*\*Goal \d+ — ([^\*]+)\*\*/g)].map(m => m[1])
  return titles.map((title, i) => ({ title: title.trim(), body: (blocks[i] || '').trim() }))
}

function inp(c: Colors): React.CSSProperties {
  return { width: '100%', background: c.dark ? c.bg : c.surface2, border: `1px solid ${c.border}`, borderRadius: 10, padding: '9px 12px', fontSize: 14, color: c.text, outline: 'none', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' }
}

const STYLE_OPTIONS: { value: PreferredStyle; label: string; desc: string }[] = [
  { value: 'structured', label: 'Structured', desc: 'Clear steps & schedules' },
  { value: 'flexible', label: 'Flexible', desc: 'Adaptable pace' },
  { value: 'aggressive', label: 'Aggressive', desc: 'Push hard & fast' },
]

export default function AIScreen({ colors: c }: { colors: Colors }) {
  const [tab, setTab] = useState<ActiveTab>('motivate')

  // Motivate state
  const [selectedGoalIdx, setSelectedGoalIdx] = useState(0)
  const [motivateResult, setMotivateResult] = useState<AiResponse | null>(null)
  const [motivateLoading, setMotivateLoading] = useState(false)

  // Suggest state
  const [userContext, setUserContext] = useState('')
  const [preferredStyle, setPreferredStyle] = useState<PreferredStyle>('structured')
  const [suggestResult, setSuggestResult] = useState<AiResponse | null>(null)
  const [suggestLoading, setSuggestLoading] = useState(false)
  const [parsedSuggestions, setParsedSuggestions] = useState<{ title: string; body: string }[]>([])
  const [expandedSuggestion, setExpandedSuggestion] = useState<number | null>(null)

  const selectedGoal = MOCK_GOALS[selectedGoalIdx]

  const handleMotivate = async () => {
    setMotivateLoading(true)
    setMotivateResult(null)
    const req: MotivateRequest = {
      goalTitle: selectedGoal.title,
      completionPercentage: selectedGoal.completionPercentage,
      daysRemaining: daysUntil(selectedGoal.deadline),
    }
    const res = await callMotivate(req)
    setMotivateResult(res)
    setMotivateLoading(false)
  }

  const handleSuggest = async () => {
    if (!userContext.trim()) return
    setSuggestLoading(true)
    setSuggestResult(null)
    setParsedSuggestions([])
    setExpandedSuggestion(null)
    const req: SuggestRequest = {
      userContext: userContext.trim(),
      existingGoals: MOCK_GOALS.map(g => g.title),
      preferredStyle,
    }
    const res = await callSuggest(req)
    setSuggestResult(res)
    if (res.success) setParsedSuggestions(parseSuggestions(res.content))
    setSuggestLoading(false)
  }

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>

      {/* Tab bar */}
      <div style={{ padding: '0 20px 12px', display: 'flex', gap: 8 }}>
        {(['motivate', 'suggest'] as ActiveTab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1, padding: '9px 0', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: tab === t ? c.primary : c.surface2,
              color: tab === t ? '#fff' : c.muted,
              fontWeight: 600, fontSize: 14,
              fontFamily: "'DM Sans', sans-serif",
              transition: 'all 0.15s',
            }}
          >
            {t === 'motivate' ? '💬 Motivate' : '✨ Suggest Goals'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* ── MOTIVATE TAB ── */}
        {tab === 'motivate' && (
          <>
            {/* Explainer */}
            <div style={{ background: `linear-gradient(135deg, ${c.primary}, #9333EA)`, borderRadius: 18, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -24, right: -24, width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: 600, letterSpacing: 0.8, marginBottom: 6 }}>AI COACH</div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Get a personal boost</div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, lineHeight: 1.5 }}>
                Pick a goal and your AI coach will write a motivational message tailored to your exact progress and deadline.
              </div>
            </div>

            {/* Goal picker */}
            <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 16, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ color: c.muted, fontSize: 12, fontWeight: 600, letterSpacing: 0.5 }}>SELECT GOAL</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {MOCK_GOALS.map((g, i) => {
                  const active = selectedGoalIdx === i
                  return (
                    <button
                      key={i}
                      onClick={() => { setSelectedGoalIdx(i); setMotivateResult(null) }}
                      style={{
                        background: active ? c.primaryDim : c.surface2,
                        border: `1.5px solid ${active ? c.primary : c.border}`,
                        borderRadius: 12, padding: '10px 14px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        cursor: 'pointer', textAlign: 'left',
                      }}
                    >
                      <div>
                        <div style={{ color: c.text, fontWeight: 600, fontSize: 13 }}>{g.title}</div>
                        <div style={{ color: c.muted, fontSize: 11, marginTop: 2 }}>
                          {Math.round(g.completionPercentage)}% done · {daysUntil(g.deadline)}d left
                        </div>
                      </div>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${active ? c.primary : c.border}`, background: active ? c.primary : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {active && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff' }} />}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Progress summary for selected goal */}
            <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 14, padding: '12px 16px', display: 'flex', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ color: c.muted, fontSize: 11, fontWeight: 600, letterSpacing: 0.4 }}>COMPLETION</div>
                <div style={{ color: c.primary, fontSize: 22, fontWeight: 700, marginTop: 2 }}>{Math.round(selectedGoal.completionPercentage)}%</div>
              </div>
              <div style={{ width: 1, background: c.border }} />
              <div style={{ flex: 1 }}>
                <div style={{ color: c.muted, fontSize: 11, fontWeight: 600, letterSpacing: 0.4 }}>DAYS LEFT</div>
                <div style={{ color: c.text, fontSize: 22, fontWeight: 700, marginTop: 2 }}>{daysUntil(selectedGoal.deadline)}</div>
              </div>
              <div style={{ width: 1, background: c.border }} />
              <div style={{ flex: 1 }}>
                <div style={{ color: c.muted, fontSize: 11, fontWeight: 600, letterSpacing: 0.4 }}>MODEL</div>
                <div style={{ color: c.text, fontSize: 12, fontWeight: 600, marginTop: 4, lineHeight: 1.3 }}>Gemini Flash</div>
              </div>
            </div>

            {/* Generate button */}
            <button
              onClick={handleMotivate}
              disabled={motivateLoading}
              style={{
                background: motivateLoading ? c.primaryDim : `linear-gradient(135deg, ${c.primary}, #9333EA)`,
                border: 'none', borderRadius: 14, padding: '14px',
                color: motivateLoading ? c.muted : '#fff',
                fontWeight: 700, fontSize: 15, cursor: motivateLoading ? 'default' : 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.2s',
              }}
            >
              {motivateLoading ? (
                <>
                  <Spinner color={c.primary} />
                  Generating your message…
                </>
              ) : '✦ Generate motivation'}
            </button>

            {/* Result */}
            {motivateResult && (
              <div style={{ background: c.surface, border: `1.5px solid ${c.primary}55`, borderRadius: 16, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: c.primaryDim, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🤖</div>
                  <div>
                    <div style={{ color: c.text, fontWeight: 600, fontSize: 13 }}>Syntra Coach</div>
                    <div style={{ color: c.muted, fontSize: 11 }}>{motivateResult.model}</div>
                  </div>
                  {motivateResult.success && (
                    <span style={{ marginLeft: 'auto', background: '#10B98120', color: '#10B981', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99 }}>SUCCESS</span>
                  )}
                </div>
                <div style={{ color: c.text, fontSize: 14, lineHeight: 1.65 }}>{motivateResult.content}</div>
                <button
                  onClick={handleMotivate}
                  style={{ background: 'none', border: `1px solid ${c.border}`, borderRadius: 10, padding: '7px', color: c.muted, fontSize: 12, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
                >
                  ↺ Regenerate
                </button>
              </div>
            )}
          </>
        )}

        {/* ── SUGGEST TAB ── */}
        {tab === 'suggest' && (
          <>
            {/* Explainer */}
            <div style={{ background: `linear-gradient(135deg, #6D28D9, ${c.primary})`, borderRadius: 18, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', bottom: -20, left: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: 600, letterSpacing: 0.8, marginBottom: 6 }}>AI SUGGESTIONS</div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>SMART goal ideas</div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, lineHeight: 1.5 }}>
                Describe what you want to achieve and your AI coach will suggest 3 actionable SMART goals with milestones.
              </div>
            </div>

            {/* Context input */}
            <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 16, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <label style={{ color: c.muted, fontSize: 12, fontWeight: 600, letterSpacing: 0.5 }}>WHAT DO YOU WANT TO ACHIEVE?</label>
              <textarea
                placeholder='e.g. "I want to learn Spanish well enough to hold a conversation in 3 months"'
                value={userContext}
                onChange={e => setUserContext(e.target.value)}
                rows={3}
                style={{ ...inp(c), resize: 'none', lineHeight: 1.5 }}
              />
            </div>

            {/* Style picker */}
            <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 16, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ color: c.muted, fontSize: 12, fontWeight: 600, letterSpacing: 0.5 }}>PREFERRED STYLE</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {STYLE_OPTIONS.map(opt => {
                  const active = preferredStyle === opt.value
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setPreferredStyle(opt.value)}
                      style={{
                        flex: 1, padding: '10px 6px', borderRadius: 12,
                        border: `1.5px solid ${active ? c.primary : c.border}`,
                        background: active ? c.primaryDim : c.surface2,
                        cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                      }}
                    >
                      <span style={{ color: active ? c.primary : c.text, fontWeight: 700, fontSize: 13 }}>{opt.label}</span>
                      <span style={{ color: c.muted, fontSize: 10, textAlign: 'center', lineHeight: 1.3 }}>{opt.desc}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Existing goals context note */}
            <div style={{ background: c.surface2, border: `1px solid ${c.border}`, borderRadius: 12, padding: '10px 14px', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>💡</span>
              <div style={{ color: c.muted, fontSize: 12, lineHeight: 1.5 }}>
                Your {MOCK_GOALS.length} existing goals will be sent as context so suggestions don't overlap with what you're already working on.
              </div>
            </div>

            {/* Generate button */}
            <button
              onClick={handleSuggest}
              disabled={suggestLoading || !userContext.trim()}
              style={{
                background: suggestLoading || !userContext.trim() ? c.primaryDim : `linear-gradient(135deg, ${c.primary}, #9333EA)`,
                border: 'none', borderRadius: 14, padding: '14px',
                color: suggestLoading || !userContext.trim() ? c.muted : '#fff',
                fontWeight: 700, fontSize: 15, cursor: suggestLoading || !userContext.trim() ? 'default' : 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.2s',
              }}
            >
              {suggestLoading ? (
                <>
                  <Spinner color={c.primary} />
                  Thinking…
                </>
              ) : '✦ Suggest 3 goals'}
            </button>

            {/* Suggestions */}
            {parsedSuggestions.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ color: c.muted, fontSize: 12, fontWeight: 600, letterSpacing: 0.5 }}>SUGGESTED GOALS</div>
                  <span style={{ background: '#10B98120', color: '#10B981', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99 }}>
                    {suggestResult?.model}
                  </span>
                </div>
                {parsedSuggestions.map((s, i) => {
                  const open = expandedSuggestion === i
                  return (
                    <div key={i} style={{ background: c.surface, border: `1.5px solid ${open ? c.primary + '66' : c.border}`, borderRadius: 16, overflow: 'hidden', transition: 'border-color 0.2s' }}>
                      <button
                        onClick={() => setExpandedSuggestion(open ? null : i)}
                        style={{ width: '100%', background: 'none', border: 'none', padding: '14px 16px', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
                      >
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: c.primaryDim, color: c.primary, fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {i + 1}
                        </div>
                        <div style={{ flex: 1, color: c.text, fontWeight: 600, fontSize: 14, lineHeight: 1.3 }}>{s.title}</div>
                        <svg viewBox="0 0 16 16" fill="none" stroke={c.muted} strokeWidth={1.5} style={{ width: 14, height: 14, flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                          <path d="M3 6l5 5 5-5" />
                        </svg>
                      </button>
                      {open && (
                        <div style={{ padding: '0 16px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                          <div style={{ color: c.muted, fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-line' }}>{s.body}</div>
                          <button style={{ background: c.primary, border: 'none', borderRadius: 10, padding: '9px', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                            + Add to my goals
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Raw fallback if parsing fails */}
            {suggestResult && parsedSuggestions.length === 0 && (
              <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 16, padding: '16px 18px' }}>
                <div style={{ color: c.text, fontSize: 13, lineHeight: 1.65, whiteSpace: 'pre-line' }}>{suggestResult.content}</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function Spinner({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" style={{ animation: 'spin 0.8s linear infinite' }}>
      <circle cx="8" cy="8" r="6" fill="none" stroke={color} strokeWidth="2" strokeDasharray="20 18" strokeLinecap="round" />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </svg>
  )
}

-----------------------
AI.TS


export interface AiResponse {
  content: string
  model: string
  success: boolean
}

export interface SuggestRequest {
  userContext: string
  existingGoals: string[]
  preferredStyle: 'structured' | 'flexible' | 'aggressive'
}

export interface MotivateRequest {
  goalTitle: string
  completionPercentage: number
  daysRemaining: number
}

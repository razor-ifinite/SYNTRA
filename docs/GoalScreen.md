import { useState } from 'react'
import type { GoalProgressResponse, GoalStatus, MilestoneStatus } from '../types/goal'

interface Colors {
  bg: string; surface: string; surface2: string; border: string
  text: string; muted: string; primary: string; primaryLight: string
  primaryDim: string; navBg: string; dark: boolean
}

const MOCK_USER_ID = '00000000-0000-0000-0000-000000000001'

function uuid() { return crypto.randomUUID() }

function formatDeadline(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function daysUntil(iso: string) {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000)
}

function deadlineColor(iso: string, status: GoalStatus) {
  if (status === 'COMPLETED') return '#10B981'
  if (status === 'ABANDONED') return '#9CA3AF'
  const d = daysUntil(iso)
  return d < 0 ? '#EF4444' : d <= 7 ? '#F59E0B' : '#10B981'
}

const STATUS_LABEL: Record<GoalStatus, string> = { ACTIVE: 'Active', COMPLETED: 'Completed', ABANDONED: 'Abandoned' }
const STATUS_COLOR: Record<GoalStatus, string> = { ACTIVE: '#7C3AED', COMPLETED: '#10B981', ABANDONED: '#9CA3AF' }

const INITIAL_DATA: GoalProgressResponse[] = [
  {
    goal: { id: uuid(), userId: MOCK_USER_ID, title: 'Complete AWS Certification', description: 'Pass the AWS Solutions Architect Associate exam by studying 1 hour daily.', deadline: '2025-09-30T00:00:00Z', status: 'ACTIVE', createdAt: '2025-07-01T09:00:00Z' },
    milestones: [
      { id: uuid(), goalId: '', title: 'Finish IAM & EC2 modules', dueDate: '2025-07-31T00:00:00Z', status: 'COMPLETED', createdAt: '2025-07-01T09:00:00Z' },
      { id: uuid(), goalId: '', title: 'Complete S3 & RDS sections', dueDate: '2025-08-15T00:00:00Z', status: 'COMPLETED', createdAt: '2025-07-01T09:00:00Z' },
      { id: uuid(), goalId: '', title: 'Do 3 full practice exams', dueDate: '2025-09-15T00:00:00Z', status: 'PENDING', createdAt: '2025-07-01T09:00:00Z' },
      { id: uuid(), goalId: '', title: 'Book and sit the exam', dueDate: '2025-09-30T00:00:00Z', status: 'PENDING', createdAt: '2025-07-01T09:00:00Z' },
    ],
    completionPercentage: 50,
  },
  {
    goal: { id: uuid(), userId: MOCK_USER_ID, title: 'Run a half marathon', description: 'Train consistently and complete a 21km race in under 2 hours.', deadline: '2025-11-01T00:00:00Z', status: 'ACTIVE', createdAt: '2025-06-01T09:00:00Z' },
    milestones: [
      { id: uuid(), goalId: '', title: 'Run 5km without stopping', dueDate: '2025-07-15T00:00:00Z', status: 'COMPLETED', createdAt: '2025-06-01T09:00:00Z' },
      { id: uuid(), goalId: '', title: 'Complete a 10km training run', dueDate: '2025-08-30T00:00:00Z', status: 'PENDING', createdAt: '2025-06-01T09:00:00Z' },
      { id: uuid(), goalId: '', title: 'Enter a local 10km race', dueDate: '2025-09-20T00:00:00Z', status: 'PENDING', createdAt: '2025-06-01T09:00:00Z' },
    ],
    completionPercentage: 33,
  },
  {
    goal: { id: uuid(), userId: MOCK_USER_ID, title: 'Launch freelance design portfolio', description: 'Build and publish a portfolio site showcasing 6 case studies.', deadline: '2025-08-15T00:00:00Z', status: 'ACTIVE', createdAt: '2025-05-01T09:00:00Z' },
    milestones: [
      { id: uuid(), goalId: '', title: 'Select and write up 6 projects', dueDate: '2025-07-10T00:00:00Z', status: 'COMPLETED', createdAt: '2025-05-01T09:00:00Z' },
      { id: uuid(), goalId: '', title: 'Design the site in Figma', dueDate: '2025-07-25T00:00:00Z', status: 'COMPLETED', createdAt: '2025-05-01T09:00:00Z' },
      { id: uuid(), goalId: '', title: 'Build and deploy the site', dueDate: '2025-08-10T00:00:00Z', status: 'PENDING', createdAt: '2025-05-01T09:00:00Z' },
    ],
    completionPercentage: 67,
  },
  {
    goal: { id: uuid(), userId: MOCK_USER_ID, title: 'Read 12 books this year', description: 'One book per month across non-fiction, biography, and fiction.', deadline: '2025-12-31T00:00:00Z', status: 'ACTIVE', createdAt: '2025-01-01T09:00:00Z' },
    milestones: [
      { id: uuid(), goalId: '', title: 'Read 3 books by March', dueDate: '2025-03-31T00:00:00Z', status: 'COMPLETED', createdAt: '2025-01-01T09:00:00Z' },
      { id: uuid(), goalId: '', title: 'Read 6 books by June', dueDate: '2025-06-30T00:00:00Z', status: 'COMPLETED', createdAt: '2025-01-01T09:00:00Z' },
      { id: uuid(), goalId: '', title: 'Read 9 books by September', dueDate: '2025-09-30T00:00:00Z', status: 'PENDING', createdAt: '2025-01-01T09:00:00Z' },
      { id: uuid(), goalId: '', title: 'Read 12 books by December', dueDate: '2025-12-31T00:00:00Z', status: 'PENDING', createdAt: '2025-01-01T09:00:00Z' },
    ],
    completionPercentage: 50,
  },
]

// ─── input/button style helpers ───────────────────────────────────────────────
function inp(c: Colors): React.CSSProperties {
  return { width: '100%', background: c.dark ? c.bg : c.surface2, border: `1px solid ${c.border}`, borderRadius: 10, padding: '9px 12px', fontSize: 14, color: c.text, outline: 'none', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' }
}
function btnPrimary(primary: string): React.CSSProperties {
  return { flex: 1, background: primary, border: 'none', borderRadius: 10, padding: 9, color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }
}
function btnCancel(c: Colors): React.CSSProperties {
  return { flex: 1, background: c.surface2, border: `1px solid ${c.border}`, borderRadius: 10, padding: 9, color: c.muted, fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }
}

export default function GoalsScreen({ colors: c }: { colors: Colors }) {
  const [data, setData] = useState<GoalProgressResponse[]>(INITIAL_DATA)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [showAddMs, setShowAddMs] = useState(false)
  const [goalForm, setGoalForm] = useState({ title: '', description: '', deadline: '' })
  const [msForm, setMsForm] = useState({ title: '', dueDate: '' })

  const selected = data.find(d => d.goal.id === selectedId) ?? null

  const recalcPct = (ms: GoalProgressResponse['milestones']) =>
    ms.length ? Math.round((ms.filter(m => m.status === 'COMPLETED').length / ms.length) * 100) : 0

  const toggleMs = (goalId: string, msId: string) =>
    setData(prev => prev.map(d => {
      if (d.goal.id !== goalId) return d
      const milestones = d.milestones.map(m =>
        m.id === msId ? { ...m, status: (m.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED') as MilestoneStatus } : m
      )
      return { ...d, milestones, completionPercentage: recalcPct(milestones) }
    }))

  const updateStatus = (goalId: string, status: GoalStatus) =>
    setData(prev => prev.map(d => d.goal.id === goalId ? { ...d, goal: { ...d.goal, status } } : d))

  const deleteGoal = (goalId: string) => {
    setData(prev => prev.filter(d => d.goal.id !== goalId))
    setSelectedId(null)
  }

  const addGoal = () => {
    if (!goalForm.title.trim() || !goalForm.deadline) return
    const id = uuid()
    setData(prev => [{
      goal: { id, userId: MOCK_USER_ID, title: goalForm.title, description: goalForm.description, deadline: new Date(goalForm.deadline).toISOString(), status: 'ACTIVE', createdAt: new Date().toISOString() },
      milestones: [],
      completionPercentage: 0,
    }, ...prev])
    setGoalForm({ title: '', description: '', deadline: '' })
    setShowAddGoal(false)
  }

  const addMilestone = (goalId: string) => {
    if (!msForm.title.trim() || !msForm.dueDate) return
    setData(prev => prev.map(d => {
      if (d.goal.id !== goalId) return d
      const milestones = [...d.milestones, { id: uuid(), goalId, title: msForm.title, dueDate: new Date(msForm.dueDate).toISOString(), status: 'PENDING' as MilestoneStatus, createdAt: new Date().toISOString() }]
      return { ...d, milestones, completionPercentage: recalcPct(milestones) }
    }))
    setMsForm({ title: '', dueDate: '' })
    setShowAddMs(false)
  }

  const active = data.filter(d => d.goal.status === 'ACTIVE').length
  const completed = data.filter(d => d.goal.status === 'COMPLETED').length

  return (
    <div style={{ flex: 1, minHeight: 0, position: 'relative', display: 'flex', flexDirection: 'column' }}>

      {/* ── Scrollable goal list ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={{ background: c.primary, borderRadius: 16, padding: '14px 16px' }}>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 600, letterSpacing: 0.5, marginBottom: 4 }}>ACTIVE</div>
            <div style={{ color: '#fff', fontSize: 30, fontWeight: 700 }}>{active}</div>
          </div>
          <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 16, padding: '14px 16px' }}>
            <div style={{ color: c.muted, fontSize: 11, fontWeight: 600, letterSpacing: 0.5, marginBottom: 4 }}>COMPLETED</div>
            <div style={{ color: c.text, fontSize: 30, fontWeight: 700 }}>{completed}</div>
          </div>
        </div>

        {/* Header + add button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: c.text, fontSize: 17, fontWeight: 700 }}>Your Goals</span>
          <button
            onClick={() => setShowAddGoal(v => !v)}
            style={{ background: c.primary, color: '#fff', border: 'none', borderRadius: 20, padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            + New goal
          </button>
        </div>

        {/* Add goal form */}
        {showAddGoal && (
          <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ color: c.text, fontWeight: 600, fontSize: 14 }}>New Goal</div>
            <input placeholder="Title *" value={goalForm.title} onChange={e => setGoalForm(f => ({ ...f, title: e.target.value }))} style={inp(c)} />
            <textarea placeholder="Description (optional)" value={goalForm.description} onChange={e => setGoalForm(f => ({ ...f, description: e.target.value }))} rows={2} style={{ ...inp(c), resize: 'none' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ color: c.muted, fontSize: 12 }}>Deadline *</label>
              <input type="date" value={goalForm.deadline} onChange={e => setGoalForm(f => ({ ...f, deadline: e.target.value }))} style={inp(c)} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setShowAddGoal(false)} style={btnCancel(c)}>Cancel</button>
              <button onClick={addGoal} disabled={!goalForm.title.trim() || !goalForm.deadline} style={{ ...btnPrimary(c.primary), opacity: !goalForm.title.trim() || !goalForm.deadline ? 0.5 : 1 }}>Create</button>
            </div>
          </div>
        )}

        {/* Goal cards */}
        {data.map(({ goal, milestones, completionPercentage }) => {
          const pct = Math.round(completionPercentage)
          const days = daysUntil(goal.deadline)
          const dlColor = deadlineColor(goal.deadline, goal.status)

          return (
            <button
              key={goal.id}
              onClick={() => setSelectedId(goal.id)}
              style={{ width: '100%', background: c.surface, border: `1px solid ${c.border}`, borderRadius: 18, padding: '16px 18px', textAlign: 'left', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 10 }}
            >
              {/* Title + status */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: c.text, fontWeight: 700, fontSize: 15, lineHeight: 1.3 }}>{goal.title}</div>
                  {goal.description && (
                    <div style={{ color: c.muted, fontSize: 12, marginTop: 3, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>
                      {goal.description}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5, flexShrink: 0 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 99, background: STATUS_COLOR[goal.status] + '22', color: STATUS_COLOR[goal.status] }}>
                    {STATUS_LABEL[goal.status]}
                  </span>
                  <span style={{ color: c.text, fontWeight: 700, fontSize: 16 }}>{pct}%</span>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ background: c.surface2, borderRadius: 99, height: 6, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: `linear-gradient(90deg, ${c.primary}, #9333EA)`, borderRadius: 99, transition: 'width 0.4s ease' }} />
              </div>

              {/* Meta */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: dlColor, fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <svg viewBox="0 0 16 16" fill="none" stroke={dlColor} strokeWidth={1.5} style={{ width: 12, height: 12 }}>
                    <rect x="1" y="2" width="14" height="13" rx="2" /><path d="M5 1v2M11 1v2M1 6h14" />
                  </svg>
                  {goal.status === 'ACTIVE'
                    ? days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? 'Due today' : `${days}d left`
                    : formatDeadline(goal.deadline)}
                </span>
                <span style={{ color: c.muted, fontSize: 12 }}>
                  {milestones.filter(m => m.status === 'COMPLETED').length}/{milestones.length} milestones →
                </span>
              </div>
            </button>
          )
        })}

        {data.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: c.muted }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🎯</div>
            <div style={{ fontWeight: 600, fontSize: 15, color: c.text, marginBottom: 4 }}>No goals yet</div>
            <div style={{ fontSize: 13 }}>Tap "New goal" to get started.</div>
          </div>
        )}
      </div>

      {/* ── Goal detail sheet ── */}
      {selected && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => { setSelectedId(null); setShowAddMs(false); setMsForm({ title: '', dueDate: '' }) }}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 10 }}
          />

          {/* Sheet */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: c.surface,
            borderRadius: '22px 22px 0 0',
            zIndex: 11,
            maxHeight: '82%',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 -8px 40px rgba(0,0,0,0.25)',
          }}>
            {/* Drag handle */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
              <div style={{ width: 36, height: 4, borderRadius: 99, background: c.border }} />
            </div>

            {/* Sheet header */}
            <div style={{ padding: '8px 20px 12px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, borderBottom: `1px solid ${c.border}` }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: c.text, fontWeight: 700, fontSize: 17, lineHeight: 1.3 }}>{selected.goal.title}</div>
                {selected.goal.description && (
                  <div style={{ color: c.muted, fontSize: 13, marginTop: 4, lineHeight: 1.5 }}>{selected.goal.description}</div>
                )}
                <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 99, background: STATUS_COLOR[selected.goal.status] + '22', color: STATUS_COLOR[selected.goal.status] }}>
                    {STATUS_LABEL[selected.goal.status]}
                  </span>
                  <span style={{ color: deadlineColor(selected.goal.deadline, selected.goal.status), fontSize: 12, fontWeight: 500 }}>
                    📅 {formatDeadline(selected.goal.deadline)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => { setSelectedId(null); setShowAddMs(false) }}
                style={{ background: c.surface2, border: `1px solid ${c.border}`, borderRadius: 10, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: c.muted, fontSize: 16, flexShrink: 0 }}
              >
                ✕
              </button>
            </div>

            {/* Progress */}
            <div style={{ padding: '14px 20px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1, background: c.surface2, borderRadius: 99, height: 8, overflow: 'hidden' }}>
                <div style={{ width: `${Math.round(selected.completionPercentage)}%`, height: '100%', background: `linear-gradient(90deg, ${c.primary}, #9333EA)`, borderRadius: 99, transition: 'width 0.4s ease' }} />
              </div>
              <span style={{ color: c.primary, fontWeight: 700, fontSize: 15, flexShrink: 0 }}>{Math.round(selected.completionPercentage)}%</span>
            </div>

            {/* Scrollable milestone list */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>

              <div style={{ color: c.muted, fontSize: 12, fontWeight: 600, letterSpacing: 0.5 }}>
                MILESTONES · {selected.milestones.filter(m => m.status === 'COMPLETED').length}/{selected.milestones.length} done
              </div>

              {selected.milestones.length === 0 && !showAddMs && (
                <div style={{ color: c.muted, fontSize: 13, padding: '8px 0' }}>No milestones yet. Add one below.</div>
              )}

              {selected.milestones.map(ms => {
                const done = ms.status === 'COMPLETED'
                const msDays = daysUntil(ms.dueDate)
                return (
                  <div key={ms.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: c.surface2, borderRadius: 13 }}>
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleMs(selected.goal.id, ms.id)}
                      style={{ width: 24, height: 24, borderRadius: 7, flexShrink: 0, border: `2px solid ${done ? c.primary : c.border}`, background: done ? c.primary : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                    >
                      {done && (
                        <svg viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" style={{ width: 10, height: 10 }}>
                          <path d="M2 6l3 3 5-5" />
                        </svg>
                      )}
                    </button>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: done ? c.muted : c.text, fontSize: 14, fontWeight: 500, textDecoration: done ? 'line-through' : 'none', lineHeight: 1.3 }}>
                        {ms.title}
                      </div>
                      <div style={{ color: done ? c.muted : msDays < 0 ? '#EF4444' : msDays <= 5 ? '#F59E0B' : c.muted, fontSize: 12, marginTop: 2 }}>
                        Due {formatDeadline(ms.dueDate)}{!done && msDays < 0 ? ` · ${Math.abs(msDays)}d overdue` : ''}
                      </div>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 7px', borderRadius: 99, background: done ? '#10B98120' : '#F59E0B20', color: done ? '#10B981' : '#F59E0B', flexShrink: 0 }}>
                      {done ? 'DONE' : 'PENDING'}
                    </span>
                  </div>
                )
              })}

              {/* Add milestone form */}
              {showAddMs ? (
                <div style={{ background: c.surface2, borderRadius: 13, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ color: c.text, fontWeight: 600, fontSize: 14 }}>New milestone</div>
                  <input placeholder="Title *" value={msForm.title} onChange={e => setMsForm(f => ({ ...f, title: e.target.value }))} style={inp(c)} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ color: c.muted, fontSize: 12 }}>Due date *</label>
                    <input type="date" value={msForm.dueDate} onChange={e => setMsForm(f => ({ ...f, dueDate: e.target.value }))} style={inp(c)} />
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => { setShowAddMs(false); setMsForm({ title: '', dueDate: '' }) }} style={btnCancel(c)}>Cancel</button>
                    <button onClick={() => addMilestone(selected.goal.id)} disabled={!msForm.title.trim() || !msForm.dueDate} style={{ ...btnPrimary(c.primary), opacity: !msForm.title.trim() || !msForm.dueDate ? 0.5 : 1 }}>Add</button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddMs(true)}
                  style={{ background: 'none', border: `1.5px dashed ${c.border}`, borderRadius: 13, padding: '10px', color: c.muted, fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  <span style={{ fontSize: 17 }}>+</span> Add milestone
                </button>
              )}

              {/* Status actions */}
              <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
                {selected.goal.status === 'ACTIVE' ? (
                  <>
                    <button onClick={() => updateStatus(selected.goal.id, 'COMPLETED')} style={{ flex: 1, background: '#10B98118', border: '1px solid #10B98155', borderRadius: 11, padding: '10px', color: '#10B981', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                      ✓ Mark complete
                    </button>
                    <button onClick={() => updateStatus(selected.goal.id, 'ABANDONED')} style={{ flex: 1, background: '#EF444418', border: '1px solid #EF444455', borderRadius: 11, padding: '10px', color: '#EF4444', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                      Abandon
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => updateStatus(selected.goal.id, 'ACTIVE')} style={{ flex: 1, background: c.primaryDim, border: `1px solid ${c.border}`, borderRadius: 11, padding: '10px', color: c.primary, fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                      Reactivate
                    </button>
                    <button onClick={() => deleteGoal(selected.goal.id)} style={{ background: '#EF444418', border: '1px solid #EF444455', borderRadius: 11, padding: '10px 16px', color: '#EF4444', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}




-------------------------
GOAL.TS

export type GoalStatus = 'ACTIVE' | 'COMPLETED' | 'ABANDONED'
export type MilestoneStatus = 'PENDING' | 'COMPLETED'

export interface GoalResponse {
  id: string
  userId: string
  title: string
  description: string
  deadline: string
  status: GoalStatus
  createdAt: string
}

export interface MilestoneResponse {
  id: string
  goalId: string
  title: string
  dueDate: string
  status: MilestoneStatus
  createdAt: string
}

export interface GoalProgressResponse {
  goal: GoalResponse
  milestones: MilestoneResponse[]
  completionPercentage: number
}

export interface GoalRequest {
  title: string
  description: string
  deadline: string
  userId: string
}

export interface MilestoneRequest {
  title: string
  dueDate: string
  goalId: string
}


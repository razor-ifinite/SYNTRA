
import { useState, useEffect } from "react"

// ─── Types (mirrored from backend DTOs) ───────────────────────────────────────
// Replace all useState(MOCK_*) calls with real API fetches against:
//   GET  /api/notifications/user/{userId}          → NotificationItem[]
//   GET  /api/notifications/user/{userId}/unread   → NotificationItem[]
//   PATCH /api/notifications/{notificationId}/read → NotificationItem
//   GET  /api/notifications/config?goalId={id}     → ReminderConfig
//   POST /api/notifications/config                 → ReminderConfig
//   PUT  /api/notifications/config                 → ReminderConfig
//   GET  /api/notifications/logs?userId={id}       → NotificationLog[]
// ─────────────────────────────────────────────────────────────────────────────

type FrequencyType = "DAILY" | "INTERVAL" | "WEEKDAYS"
type NotificationType = "INFO" | "GOAL_DUE" | "MILESTONE_COMPLETED" | "MOTIVATIONAL"

interface NotificationItem {
  id: string
  title: string
  message: string
  type: NotificationType
  isRead: boolean
  createdAt: string
}

interface NotificationLog {
  id: string
  goalTitle: string  // join from goal service — backend returns goalId, resolve title client-side
  message: string
  sentAt: string
  status: "SENT" | "FAILED"
}

interface Goal {
  id: string
  title: string
  emoji: string        // stored on the goal entity in the goals service
  hasReminder: boolean // derived: true if a NotificationConfig exists for this goalId
}

interface ReminderConfig {
  goalId: string
  frequency: FrequencyType
  timeOfDay: string  // "HH:mm" — matches backend NotificationConfigRequest.timeOfDay
  message: string
  enabled: boolean   // local toggle; pass enabled=false by omitting the config or adding a flag server-side
}

// ─── Minimal seed data — swap these out with real API responses ───────────────
const MOCK_GOALS: Goal[] = [
  { id: "g1", title: "Morning Run",   emoji: "🏃", hasReminder: true  },
  { id: "g2", title: "Read 20 Pages", emoji: "📖", hasReminder: false },
]

const INITIAL_CONFIGS: Record<string, ReminderConfig> = {
  g1: { goalId: "g1", frequency: "DAILY", timeOfDay: "06:30", message: "Time to lace up!", enabled: true },
}

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  { id: "1", title: "You're on fire!", message: "3 days in a row on Morning Run. Keep it up!", type: "MOTIVATIONAL", isRead: false, createdAt: new Date(Date.now() - 30 * 60000).toISOString() },
  { id: "2", title: "Goal due today",  message: "Read 20 pages is due by end of day.",          type: "GOAL_DUE",     isRead: true,  createdAt: new Date(Date.now() - 3 * 3600000).toISOString() },
]

const MOCK_LOGS: NotificationLog[] = [
  { id: "l1", goalTitle: "Morning Run",   message: "Time to lace up!", sentAt: new Date(Date.now() - 3600000).toISOString(),  status: "SENT"   },
  { id: "l2", goalTitle: "Read 20 Pages", message: "Pick up your book.", sentAt: new Date(Date.now() - 86400000).toISOString(), status: "FAILED" },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function typeConfig(type: NotificationType, dark: boolean) {
  const map = {
    MOTIVATIONAL:        { icon: "✦", label: "Motivational", bg: dark ? "bg-violet-900/50" : "bg-violet-100",  text: dark ? "text-violet-300"  : "text-violet-700",  dot: "bg-violet-500"  },
    GOAL_DUE:            { icon: "◎", label: "Due",          bg: dark ? "bg-amber-900/40"  : "bg-amber-100",   text: dark ? "text-amber-300"   : "text-amber-700",   dot: "bg-amber-500"   },
    MILESTONE_COMPLETED: { icon: "★", label: "Milestone",    bg: dark ? "bg-emerald-900/40": "bg-emerald-100", text: dark ? "text-emerald-300" : "text-emerald-700", dot: "bg-emerald-500" },
    INFO:                { icon: "○", label: "Info",         bg: dark ? "bg-slate-700/50"  : "bg-slate-100",   text: dark ? "text-slate-300"   : "text-slate-500",   dot: "bg-slate-400"   },
  }
  return map[type]
}

const FREQ_LABELS: Record<FrequencyType, string> = { DAILY: "Daily", INTERVAL: "Interval", WEEKDAYS: "Weekdays" }
const FREQ_DESC:   Record<FrequencyType, string> = { DAILY: "Every day", INTERVAL: "Set interval", WEEKDAYS: "Mon – Fri" }

type Screen = "inbox" | "reminders" | "logs"

// ─── Screen: Notifications Inbox ─────────────────────────────────────────────
function NotificationsInbox({ dark }: { dark: boolean }) {
  const [items, setItems] = useState(MOCK_NOTIFICATIONS)
  const unread = items.filter((n) => !n.isRead).length

  // Wire: PATCH /api/notifications/{id}/read
  const markRead    = (id: string) => setItems((p) => p.map((n) => n.id === id ? { ...n, isRead: true } : n))
  // Wire: PATCH all unread ids
  const markAllRead = () => setItems((p) => p.map((n) => ({ ...n, isRead: true })))

  return (
    <div className="flex flex-col h-full">
      <div className={`flex items-end justify-between px-5 sm:px-6 pt-5 pb-3 flex-shrink-0 border-b ${dark ? "border-white/8" : "border-black/6"}`}>
        <div>
          <h2 className={`text-xl sm:text-2xl font-semibold tracking-tight leading-none ${dark ? "text-white" : "text-slate-900"}`} style={{ fontFamily: "Outfit, sans-serif" }}>
            Notifications
          </h2>
          <p className={`text-xs mt-1 ${dark ? "text-violet-400" : "text-violet-600"}`} style={{ fontFamily: "Inter, sans-serif" }}>
            {unread > 0 ? `${unread} unread` : "All caught up"}
          </p>
        </div>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all mb-0.5 ${dark ? "bg-violet-800/60 text-violet-300 hover:bg-violet-700/70" : "bg-violet-100 text-violet-700 hover:bg-violet-200"}`}
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {items.map((notif, i) => {
          const cfg = typeConfig(notif.type, dark)
          return (
            <div
              key={notif.id}
              onClick={() => markRead(notif.id)}
              className={`relative px-5 sm:px-6 py-4 cursor-pointer transition-colors ${
                i < items.length - 1 ? (dark ? "border-b border-white/5" : "border-b border-black/5") : ""
              } ${!notif.isRead ? (dark ? "bg-violet-950/30" : "bg-violet-50/70") : ""} ${dark ? "hover:bg-white/4" : "hover:bg-black/3"}`}
            >
              {!notif.isRead && (
                <span className={`absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              )}
              <div className="flex gap-3 items-start">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 text-base ${cfg.bg} ${cfg.text}`}>
                  {cfg.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-semibold leading-snug ${notif.isRead ? (dark ? "text-white/55" : "text-slate-500") : (dark ? "text-white" : "text-slate-900")}`} style={{ fontFamily: "Outfit, sans-serif" }}>
                      {notif.title}
                    </p>
                    <span className={`text-[11px] flex-shrink-0 mt-0.5 ${dark ? "text-white/30" : "text-slate-400"}`} style={{ fontFamily: "Inter, sans-serif" }}>
                      {relativeTime(notif.createdAt)}
                    </span>
                  </div>
                  <p className={`text-xs mt-1 leading-relaxed line-clamp-2 ${notif.isRead ? (dark ? "text-white/30" : "text-slate-400") : (dark ? "text-white/60" : "text-slate-600")}`} style={{ fontFamily: "Inter, sans-serif" }}>
                    {notif.message}
                  </p>
                  <span className={`inline-block mt-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`} style={{ fontFamily: "Inter, sans-serif" }}>
                    {cfg.label}
                  </span>
                </div>
              </div>
            </div>
          )
        })}

        {items.every((n) => n.isRead) && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${dark ? "bg-white/6" : "bg-black/5"}`}>✓</div>
            <p className={`text-sm font-medium ${dark ? "text-white/40" : "text-slate-400"}`} style={{ fontFamily: "Outfit, sans-serif" }}>
              All caught up
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Screen: Reminders Config ─────────────────────────────────────────────────
// Reminders are goal-bound — a NotificationConfig only exists after a goal exists.
// Goals come from the goals service; wire MOCK_GOALS with GET /api/goals?userId={id}
function RemindersConfig({ dark }: { dark: boolean }) {
  const [goals, setGoals]     = useState(MOCK_GOALS)
  const [configs, setConfigs] = useState<Record<string, ReminderConfig>>(INITIAL_CONFIGS)
  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft]     = useState<Partial<ReminderConfig>>({})

  const openEdit = (goalId: string) => {
    setEditing(goalId)
    setDraft(configs[goalId] ?? { goalId, frequency: "DAILY", timeOfDay: "08:00", message: "", enabled: true })
  }

  // Wire: POST /api/notifications/config (new) or PUT /api/notifications/config (update)
  const saveEdit = (goalId: string) => {
    const saved: ReminderConfig = {
      goalId,
      frequency: draft.frequency ?? "DAILY",
      timeOfDay: draft.timeOfDay ?? "08:00",
      message:   draft.message   ?? "",
      enabled:   draft.enabled   ?? true,
    }
    setConfigs((p) => ({ ...p, [goalId]: saved }))
    setGoals((p) => p.map((g) => g.id === goalId ? { ...g, hasReminder: true } : g))
    setEditing(null)
  }

  // Wire: DELETE config or PUT with enabled=false depending on backend design
  const removeReminder = (goalId: string) => {
    setConfigs((p) => { const next = { ...p }; delete next[goalId]; return next })
    setGoals((p) => p.map((g) => g.id === goalId ? { ...g, hasReminder: false } : g))
    setEditing(null)
  }

  const toggleEnabled = (goalId: string) =>
    setConfigs((p) => ({ ...p, [goalId]: { ...p[goalId], enabled: !p[goalId].enabled } }))

  const inputCls = `w-full text-sm px-3 py-2.5 rounded-xl border outline-none transition-all ${
    dark
      ? "bg-white/6 border-white/10 text-white placeholder-white/30 focus:border-violet-500"
      : "bg-black/4 border-black/10 text-slate-900 placeholder-slate-400 focus:border-violet-500"
  }`

  const withReminder = goals.filter((g) => g.hasReminder)
  const without      = goals.filter((g) => !g.hasReminder)

  const EditForm = ({ goalId, isNew }: { goalId: string; isNew: boolean }) => (
    <div className="px-4 pb-4 flex flex-col gap-3">
      <div>
        <p className={`text-[10px] uppercase tracking-widest mb-1.5 font-medium ${dark ? "text-white/40" : "text-slate-400"}`} style={{ fontFamily: "Inter, sans-serif" }}>Frequency</p>
        <div className="flex gap-1.5">
          {(["DAILY", "INTERVAL", "WEEKDAYS"] as FrequencyType[]).map((f) => (
            <button
              key={f}
              onClick={() => setDraft((d) => ({ ...d, frequency: f }))}
              className={`flex-1 flex flex-col items-center py-2 rounded-xl text-[10px] font-medium transition-all ${
                (draft.frequency ?? "DAILY") === f
                  ? "bg-violet-600 text-white"
                  : dark ? "bg-white/8 text-white/50 hover:bg-white/12" : "bg-black/5 text-slate-500 hover:bg-black/8"
              }`}
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              <span className="text-sm mb-0.5">{f === "DAILY" ? "◷" : f === "INTERVAL" ? "↻" : "≡"}</span>
              {FREQ_LABELS[f]}
              <span className="text-[8px] mt-0.5 opacity-70">{FREQ_DESC[f]}</span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className={`text-[10px] uppercase tracking-widest mb-1.5 font-medium ${dark ? "text-white/40" : "text-slate-400"}`} style={{ fontFamily: "Inter, sans-serif" }}>Time of day</p>
        <input
          type="time"
          value={draft.timeOfDay ?? "08:00"}
          onChange={(e) => setDraft((d) => ({ ...d, timeOfDay: e.target.value }))}
          className={inputCls}
          style={{ fontFamily: "Inter, sans-serif", colorScheme: dark ? "dark" : "light" }}
        />
      </div>
      <div>
        <p className={`text-[10px] uppercase tracking-widest mb-1.5 font-medium ${dark ? "text-white/40" : "text-slate-400"}`} style={{ fontFamily: "Inter, sans-serif" }}>Message</p>
        <textarea
          rows={2}
          value={draft.message ?? ""}
          onChange={(e) => setDraft((d) => ({ ...d, message: e.target.value }))}
          placeholder="What should remind you?"
          className={`${inputCls} resize-none`}
          style={{ fontFamily: "Inter, sans-serif" }}
        />
      </div>
      <div className="flex gap-2 pt-0.5">
        {!isNew && (
          <button
            onClick={() => removeReminder(goalId)}
            className={`text-xs py-2 px-3 rounded-xl font-medium transition-all ${dark ? "bg-rose-900/40 text-rose-400 hover:bg-rose-900/60" : "bg-rose-100 text-rose-600 hover:bg-rose-200"}`}
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Remove
          </button>
        )}
        <button
          onClick={() => setEditing(null)}
          className={`flex-1 text-xs py-2 rounded-xl font-medium transition-all ${dark ? "bg-white/8 text-white/60 hover:bg-white/12" : "bg-black/6 text-slate-500 hover:bg-black/10"}`}
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          Cancel
        </button>
        <button
          onClick={() => saveEdit(goalId)}
          className="flex-1 text-xs py-2 rounded-xl font-medium bg-violet-600 text-white hover:bg-violet-500 transition-all"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          {isNew ? "Save reminder" : "Save"}
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col h-full">
      <div className={`px-5 sm:px-6 pt-5 pb-3 flex-shrink-0 border-b ${dark ? "border-white/8" : "border-black/6"}`}>
        <h2 className={`text-xl sm:text-2xl font-semibold tracking-tight leading-none ${dark ? "text-white" : "text-slate-900"}`} style={{ fontFamily: "Outfit, sans-serif" }}>
          Reminders
        </h2>
        <p className={`text-xs mt-1 ${dark ? "text-white/40" : "text-slate-400"}`} style={{ fontFamily: "Inter, sans-serif" }}>
          Set per goal — create a goal first
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 flex flex-col gap-2.5">

        {/* Goals with reminders */}
        {withReminder.map((goal) => {
          const cfg = configs[goal.id]
          const isEditing = editing === goal.id
          if (!cfg) return null
          return (
            <div
              key={goal.id}
              className={`rounded-2xl overflow-hidden border transition-all ${
                dark
                  ? isEditing ? "border-violet-500/50 bg-violet-950/40" : "border-white/8 bg-white/4"
                  : isEditing ? "border-violet-400/50 bg-violet-50/80" : "border-black/6 bg-white"
              }`}
            >
              <div className="px-4 pt-3.5 pb-0 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">{goal.emoji}</span>
                  <span className={`text-sm font-semibold ${dark ? "text-white" : "text-slate-900"}`} style={{ fontFamily: "Outfit, sans-serif" }}>
                    {goal.title}
                  </span>
                </div>
                <button
                  onClick={() => toggleEnabled(goal.id)}
                  className={`relative w-10 h-5.5 rounded-full transition-all flex items-center flex-shrink-0 ${cfg.enabled ? "bg-violet-600" : (dark ? "bg-white/15" : "bg-black/15")}`}
                  aria-label="Toggle reminder"
                >
                  <span className={`absolute w-4 h-4 rounded-full bg-white shadow transition-all ${cfg.enabled ? "left-5.5" : "left-0.5"}`} />
                </button>
              </div>

              {!isEditing && (
                <div
                  className={`px-4 pt-2 pb-3.5 flex items-center justify-between ${cfg.enabled ? "cursor-pointer" : "opacity-40"}`}
                  onClick={() => cfg.enabled && openEdit(goal.id)}
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-lg font-medium ${dark ? "bg-violet-900/60 text-violet-300" : "bg-violet-100 text-violet-700"}`} style={{ fontFamily: "Inter, sans-serif" }}>
                      {FREQ_LABELS[cfg.frequency]}
                    </span>
                    <span className={`text-xs font-medium tabular-nums ${dark ? "text-white/50" : "text-slate-500"}`} style={{ fontFamily: "Inter, sans-serif" }}>
                      {cfg.timeOfDay}
                    </span>
                    {cfg.message && (
                      <span className={`text-xs truncate max-w-28 ${dark ? "text-white/30" : "text-slate-400"}`} style={{ fontFamily: "Inter, sans-serif" }}>
                        "{cfg.message}"
                      </span>
                    )}
                  </div>
                  {cfg.enabled && (
                    <span className={`text-xs flex-shrink-0 ${dark ? "text-violet-400" : "text-violet-600"}`}>Edit →</span>
                  )}
                </div>
              )}

              {isEditing && <EditForm goalId={goal.id} isNew={false} />}
            </div>
          )
        })}

        {/* Goals without reminders */}
        {without.length > 0 && (
          <>
            <p className={`text-[10px] uppercase tracking-widest font-medium mt-2 px-1 ${dark ? "text-white/30" : "text-slate-400"}`} style={{ fontFamily: "Inter, sans-serif" }}>
              No reminder set
            </p>
            {without.map((goal) => (
              <div key={goal.id}>
                <div
                  className={`rounded-2xl border px-4 py-3.5 flex items-center justify-between cursor-pointer transition-all ${
                    editing === goal.id
                      ? dark ? "border-violet-500/50 bg-violet-950/40 rounded-b-none border-b-0" : "border-violet-400/50 bg-violet-50/80 rounded-b-none border-b-0"
                      : dark ? "border-white/6 bg-white/2 hover:bg-white/5" : "border-black/5 bg-white hover:bg-violet-50/60"
                  }`}
                  onClick={() => editing !== goal.id && openEdit(goal.id)}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg opacity-60">{goal.emoji}</span>
                    <span className={`text-sm font-medium ${dark ? "text-white/50" : "text-slate-500"}`} style={{ fontFamily: "Outfit, sans-serif" }}>
                      {goal.title}
                    </span>
                  </div>
                  {editing !== goal.id && (
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${dark ? "bg-violet-800/50 text-violet-300" : "bg-violet-100 text-violet-600"}`} style={{ fontFamily: "Inter, sans-serif" }}>
                      + Add reminder
                    </span>
                  )}
                </div>
                {editing === goal.id && (
                  <div className={`rounded-2xl rounded-t-none border border-t-0 overflow-hidden ${dark ? "border-violet-500/50 bg-violet-950/40" : "border-violet-400/50 bg-violet-50/80"}`}>
                    <EditForm goalId={goal.id} isNew={true} />
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {goals.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${dark ? "bg-white/6" : "bg-black/5"}`}>◎</div>
            <p className={`text-sm font-medium text-center ${dark ? "text-white/40" : "text-slate-400"}`} style={{ fontFamily: "Outfit, sans-serif" }}>
              No goals yet.<br />Create a goal to set reminders.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Screen: Notification Logs ────────────────────────────────────────────────
// Wire: GET /api/notifications/logs?userId={id} → NotificationLog[]
function NotificationLogs({ dark }: { dark: boolean }) {
  const sent   = MOCK_LOGS.filter((l) => l.status === "SENT").length
  const failed = MOCK_LOGS.filter((l) => l.status === "FAILED").length
  const total  = MOCK_LOGS.length

  return (
    <div className="flex flex-col h-full">
      <div className={`px-5 sm:px-6 pt-5 pb-3 flex-shrink-0 border-b ${dark ? "border-white/8" : "border-black/6"}`}>
        <h2 className={`text-xl sm:text-2xl font-semibold tracking-tight leading-none ${dark ? "text-white" : "text-slate-900"}`} style={{ fontFamily: "Outfit, sans-serif" }}>
          Delivery Log
        </h2>
        <p className={`text-xs mt-1 ${dark ? "text-white/40" : "text-slate-400"}`} style={{ fontFamily: "Inter, sans-serif" }}>
          Push notification history
        </p>
      </div>

      {total > 0 && (
        <div className={`mx-4 sm:mx-5 mt-3 mb-2 rounded-2xl flex border ${dark ? "border-white/8 bg-white/4" : "border-black/6 bg-white"}`}>
          {[
            { label: "Sent",    value: sent,                                    color: dark ? "text-emerald-400" : "text-emerald-600" },
            { label: "Failed",  value: failed,                                  color: dark ? "text-rose-400"    : "text-rose-600"    },
            { label: "Success", value: `${Math.round((sent / total) * 100)}%`,  color: dark ? "text-violet-400"  : "text-violet-600"  },
          ].map((stat, i) => (
            <div key={stat.label} className={`flex-1 flex flex-col items-center py-3 ${i > 0 ? (dark ? "border-l border-white/10" : "border-l border-black/8") : ""}`}>
              <span className={`text-2xl font-bold ${stat.color}`} style={{ fontFamily: "Outfit, sans-serif" }}>{stat.value}</span>
              <span className={`text-[10px] uppercase tracking-widest font-medium mt-0.5 ${dark ? "text-white/35" : "text-slate-400"}`} style={{ fontFamily: "Inter, sans-serif" }}>{stat.label}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-2 flex flex-col gap-2">
        {MOCK_LOGS.map((log) => (
          <div key={log.id} className={`flex items-start gap-3 px-4 py-3 rounded-2xl border ${dark ? "border-white/6 bg-white/3" : "border-black/5 bg-white"}`}>
            <div className={`mt-0.5 w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${
              log.status === "SENT"
                ? dark ? "bg-emerald-900/60 text-emerald-400" : "bg-emerald-100 text-emerald-600"
                : dark ? "bg-rose-900/60 text-rose-400"       : "bg-rose-100 text-rose-600"
            }`}>
              {log.status === "SENT" ? "✓" : "✕"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className={`text-xs font-semibold ${dark ? "text-white/80" : "text-slate-800"}`} style={{ fontFamily: "Outfit, sans-serif" }}>
                  {log.goalTitle}
                </p>
                <span className={`text-[10px] flex-shrink-0 ${dark ? "text-white/25" : "text-slate-400"}`} style={{ fontFamily: "Inter, sans-serif" }}>
                  {relativeTime(log.sentAt)}
                </span>
              </div>
              <p className={`text-xs mt-0.5 line-clamp-1 ${dark ? "text-white/35" : "text-slate-400"}`} style={{ fontFamily: "Inter, sans-serif" }}>
                {log.message}
              </p>
              <span className={`inline-block mt-1.5 text-[9px] px-1.5 py-0.5 rounded-md font-semibold uppercase tracking-wider ${
                log.status === "SENT"
                  ? dark ? "bg-emerald-900/50 text-emerald-400" : "bg-emerald-100 text-emerald-600"
                  : dark ? "bg-rose-900/50 text-rose-400"       : "bg-rose-100 text-rose-600"
              }`} style={{ fontFamily: "Inter, sans-serif" }}>
                {log.status}
              </span>
            </div>
          </div>
        ))}

        {total === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${dark ? "bg-white/6" : "bg-black/5"}`}>≡</div>
            <p className={`text-sm font-medium ${dark ? "text-white/40" : "text-slate-400"}`} style={{ fontFamily: "Outfit, sans-serif" }}>No logs yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "inbox",     label: "Inbox",     icon: "◉" },
  { id: "reminders", label: "Reminders", icon: "◷" },
  { id: "logs",      label: "Logs",      icon: "≡" },
] as const

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [dark, setDark]       = useState(true)
  const [screen, setScreen]   = useState<Screen>("inbox")
  const [isPhone, setIsPhone] = useState(false)
  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.isRead).length

  useEffect(() => {
    const check = () => setIsPhone(window.innerWidth < 640)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  const outerStyle = isPhone
    ? { width: "100vw", height: "100dvh", background: dark ? "#0e0a1a" : "#fafafa" }
    : {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        background: dark
          ? "radial-gradient(ellipse at 30% 20%, #3b0764 0%, #0f0a1a 55%, #09040f 100%)"
          : "radial-gradient(ellipse at 30% 20%, #ede9fe 0%, #f5f3ff 45%, #faf9ff 100%)",
      }

  const frameStyle = isPhone
    ? { width: "100%", height: "100%", background: dark ? "#0e0a1a" : "#fafafa" }
    : {
        width: 375, height: 780,
        borderRadius: 44,
        overflow: "hidden" as const,
        background: dark ? "#0e0a1a" : "#fafafa",
        boxShadow: dark
          ? "0 0 0 1px rgba(255,255,255,0.08), 0 40px 80px rgba(0,0,0,0.8)"
          : "0 0 0 1px rgba(0,0,0,0.08), 0 40px 80px rgba(0,0,0,0.18)",
        flexShrink: 0,
      }

  return (
    <div style={outerStyle}>
      <div style={{ ...frameStyle, display: "flex", flexDirection: "column" }}>

        {!isPhone && (
          <div className={`flex items-center justify-between px-8 pt-4 pb-1 flex-shrink-0 ${dark ? "text-white/40" : "text-slate-400"}`}>
            <span className="text-xs font-medium" style={{ fontFamily: "Inter, sans-serif" }}>9:41</span>
            <span className="text-xs">●●●</span>
          </div>
        )}

        {/* App bar */}
        <div className="flex items-center justify-between px-5 sm:px-6 pt-4 pb-2 flex-shrink-0">
          <span style={{ fontFamily: "Bungee, cursive", fontSize: isPhone ? 20 : 22, letterSpacing: 1 }} className={dark ? "text-white" : "text-slate-900"}>
            SYNTRA<span style={{ color: "#7C3AED" }}>.</span>
          </span>
          <button
            onClick={() => setDark((d) => !d)}
            className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-all ${dark ? "bg-white/8 text-white/60 hover:bg-white/14" : "bg-black/6 text-slate-500 hover:bg-black/10"}`}
            title="Toggle theme"
          >
            {dark ? "○" : "●"}
          </button>
        </div>

        {/* Active screen */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {screen === "inbox"     && <NotificationsInbox dark={dark} />}
          {screen === "reminders" && <RemindersConfig    dark={dark} />}
          {screen === "logs"      && <NotificationLogs   dark={dark} />}
        </div>

        {/* Bottom nav */}
        <div className={`flex-shrink-0 flex items-center justify-around px-4 py-2 border-t ${dark ? "border-white/8 bg-[#0e0a1a]" : "border-black/6 bg-white"}`}>
          {NAV_ITEMS.map((item) => {
            const active    = screen === item.id
            const showBadge = item.id === "inbox" && unreadCount > 0
            return (
              <button
                key={item.id}
                onClick={() => setScreen(item.id)}
                className={`relative flex flex-col items-center gap-0.5 px-6 py-1.5 rounded-2xl transition-all ${
                  active
                    ? dark ? "bg-violet-900/50 text-violet-300" : "bg-violet-100 text-violet-700"
                    : dark ? "text-white/30 hover:text-white/60" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {showBadge && <span className="absolute -top-0.5 right-3 w-2 h-2 rounded-full bg-violet-500" />}
                <span className="text-base leading-none">{item.icon}</span>
                <span className="text-[10px] font-medium leading-none" style={{ fontFamily: "Inter, sans-serif" }}>{item.label}</span>
              </button>
            )
          })}
        </div>

        {!isPhone && (
          <div className="flex-shrink-0 flex justify-center pb-3 pt-1">
            <div className={`w-28 h-1 rounded-full ${dark ? "bg-white/20" : "bg-black/15"}`} />
          </div>
        )}
      </div>
    </div>
  )
}

import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput, RefreshControl } from 'react-native'
import * as Haptics from '../utils/haptics'
import type { NotificationItem, NotificationLog, ReminderConfig, Goal, FrequencyType, NotificationType } from '../types/notification'
import { SwipeableRow } from '../components/SwipeableRow'
import { apiGet, apiPost, apiPut, apiPatch, apiDelete, SERVICES } from '../api/client'
import { useAuth } from '../context/AuthContext'
import DateTimePicker from '@react-native-community/datetimepicker'
import { SkeletonLoader } from '../components/SkeletonLoader'
import { Feather } from '@expo/vector-icons'

interface Colors {
  bg: string; surface: string; surface2: string; border: string
  text: string; muted: string; primary: string; primaryLight: string
  primaryDim: string; navBg: string; dark: boolean
}

type Tab = "inbox" | "reminders" | "logs"

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_GOALS: Goal[] = []

const INITIAL_CONFIGS: Record<string, ReminderConfig> = {}

const MOCK_NOTIFICATIONS: NotificationItem[] = []

const MOCK_LOGS: NotificationLog[] = []

// ─── Helpers ──────────────────────────────────────────────────────────────────
function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const FREQ_LABELS: Record<FrequencyType, string> = { DAILY: "Daily", INTERVAL: "Interval", WEEKDAYS: "Weekdays" }
const FREQ_DESC:   Record<FrequencyType, string> = { DAILY: "Every day", INTERVAL: "Set interval", WEEKDAYS: "Mon – Fri" }

function typeConfig(type: NotificationType, dark: boolean) {
  const map = {
    MOTIVATIONAL:        { icon: "star", label: "Motivational", bg: dark ? "rgba(139, 92, 246, 0.2)" : "#ede9fe", text: dark ? "#c4b5fd" : "#6d28d9", dot: "#8b5cf6" },
    GOAL_DUE:            { icon: "clock", label: "Due",          bg: dark ? "rgba(245, 158, 11, 0.2)" : "#fef3c7", text: dark ? "#fcd34d" : "#b45309", dot: "#f59e0b" },
    GOAL_OVERDUE:        { icon: "alert-triangle", label: "Overdue",     bg: dark ? "rgba(239, 68, 68, 0.2)" : "#fee2e2", text: dark ? "#fca5a5" : "#b91c1c", dot: "#ef4444" },
    MILESTONE_COMPLETED: { icon: "check-circle", label: "Milestone",    bg: dark ? "rgba(16, 185, 129, 0.2)" : "#d1fae5", text: dark ? "#6ee7b7" : "#047857", dot: "#10b981" },
    INFO:                { icon: "info", label: "Info",         bg: dark ? "rgba(100, 116, 139, 0.2)" : "#f1f5f9", text: dark ? "#cbd5e1" : "#64748b", dot: "#94a3b8" },
  }
  return map[type]
}

// ─── Sub-screens ──────────────────────────────────────────────────────────────

function NotificationsInbox({ c }: { c: Colors }) {
  const { user } = useAuth()
  const [items, setItems] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)

  const [refreshing, setRefreshing] = useState(false)

  const loadNotifs = useCallback(async () => {
    if (!user) return
    try {
      const res = await apiGet<NotificationItem[]>(SERVICES.notification, `/api/notifications/user/${user.id}`)
      setItems(res)
    } catch (err) {
      console.warn("Failed to load notifications", err)
      setItems(MOCK_NOTIFICATIONS)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadNotifs()
  }, [loadNotifs])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    await loadNotifs()
    setRefreshing(false)
  }, [loadNotifs])

  const unread = items.filter((n) => !n.isRead).length
  
  const markRead = async (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setItems((p) => p.map((n) => n.id === id ? { ...n, isRead: true } : n))
    try {
      await apiPatch(SERVICES.notification, `/api/notifications/${id}/read`, {})
    } catch(e) { console.warn(e) }
  }

  const deleteNotif = async (id: string) => {
    setItems((p) => p.filter((n) => n.id !== id))
    try {
      await apiDelete(SERVICES.notification, `/api/notifications/${id}`)
    } catch(e) { console.warn(e) }
  }

  const markAllRead = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    const unreadIds = items.filter(n => !n.isRead).map(n => n.id)
    setItems((p) => p.map((n) => ({ ...n, isRead: true })))
    for (const id of unreadIds) {
      try {
        await apiPatch(SERVICES.notification, `/api/notifications/${id}/read`)
      } catch(e) { console.warn("Failed to mark read", e) }
    }
  }

  const s = styles(c)

  if (loading) {
    return (
      <View style={[s.subScreen, { paddingHorizontal: 24, paddingTop: 16, gap: 16 }]}>
        <SkeletonLoader width="40%" height={30} dark={c.dark} />
        <SkeletonLoader width="100%" height={80} borderRadius={16} dark={c.dark} />
        <SkeletonLoader width="100%" height={80} borderRadius={16} dark={c.dark} />
        <SkeletonLoader width="100%" height={80} borderRadius={16} dark={c.dark} />
      </View>
    )
  }

  return (
    <View style={s.subScreen}>
      <View style={s.subHeader}>
        <View>
          <Text style={s.subHeaderTitle}>Notifications</Text>
          <Text style={s.subHeaderSubtitle}>{unread > 0 ? `${unread} unread` : "All caught up"}</Text>
        </View>
        {unread > 0 && (
          <TouchableOpacity style={s.markReadBtn} onPress={markAllRead}>
            <Text style={s.markReadBtnText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView 
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.primary} colors={[c.primary]} />}
      >
        {items.map((notif, i) => {
          const cfg = typeConfig(notif.type, c.dark)
          const isLast = i === items.length - 1
          
          return (
            <SwipeableRow 
              key={notif.id}
              onDelete={() => deleteNotif(notif.id)}
              onRead={() => markRead(notif.id)}
              isRead={notif.isRead}
            >
              <TouchableOpacity 
                activeOpacity={1}
                onPress={() => markRead(notif.id)}
                style={[
                  s.notifRow, 
                  { marginBottom: 0 },
                  !isLast && { borderBottomWidth: 1, borderBottomColor: c.border },
                  !notif.isRead && { backgroundColor: c.dark ? 'rgba(124, 58, 237, 0.15)' : 'rgba(124, 58, 237, 0.05)' }
                ]}
              >
                {!notif.isRead && <View style={[s.unreadDot, { backgroundColor: cfg.dot }]} />}
                <View style={s.notifContent}>
                  <View style={[s.notifIconWrap, { backgroundColor: cfg.bg }]}>
                    <Feather name={cfg.icon as any} size={16} color={cfg.text} />
                  </View>
                  <View style={s.notifTextWrap}>
                    <View style={s.notifTitleRow}>
                      <Text style={[s.notifTitle, notif.isRead && { color: c.muted }]}>{notif.title}</Text>
                      <Text style={s.notifTime}>{relativeTime(notif.createdAt)}</Text>
                    </View>
                    <Text style={[s.notifMessage, notif.isRead && { color: c.muted, opacity: 0.8 }]} numberOfLines={2}>
                      {notif.message}
                    </Text>
                    <View style={[s.notifBadge, { backgroundColor: cfg.bg }]}>
                      <Text style={[s.notifBadgeText, { color: cfg.text }]}>{cfg.label}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </SwipeableRow>
          )
        })}

        {items.length === 0 ? (
          <View style={s.emptyState}>
            <View style={[s.emptyIconWrap, { backgroundColor: c.surface2 }]}>
              <Feather name="mail" size={24} color={c.text} />
            </View>
            <Text style={s.emptyTitle}>Your inbox is empty</Text>
            <Text style={s.emptyDesc}>We'll notify you when reminders trigger.</Text>
          </View>
        ) : items.every(n => n.isRead) ? (
          <View style={s.emptyState}>
            <View style={[s.emptyIconWrap, { backgroundColor: c.surface2 }]}>
              <Feather name="check" size={24} color={c.text} />
            </View>
            <Text style={s.emptyTitle}>All caught up</Text>
            <Text style={s.emptyDesc}>No unread notifications.</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  )
}

function RemindersConfigView({ c }: { c: Colors }) {
  const { user } = useAuth()
  const [goals, setGoals] = useState<Goal[]>([])
  const [configs, setConfigs] = useState<Record<string, ReminderConfig>>({})
  const [loading, setLoading] = useState(true)


  const [refreshing, setRefreshing] = useState(false)

  const loadData = useCallback(async () => {
    if (!user) return
    try {
      const goalsData = await apiGet<any[]>(SERVICES.goal, `/api/goals/user/${user.id}`)
      const mappedGoals: Goal[] = goalsData.map(g => ({
        id: g.id,
        title: g.title,
        emoji: "target",
        hasReminder: false
      }))
      
      const newConfigs: Record<string, ReminderConfig> = {}
      for (const g of mappedGoals) {
        try {
          const cfg = await apiGet<ReminderConfig>(SERVICES.notification, `/api/notifications/config?goalId=${g.id}`)
          if (cfg && cfg.goalId) {
            newConfigs[g.id] = cfg
            g.hasReminder = true
          }
        } catch(e) { }
      }
      
      setConfigs(newConfigs)
      setGoals(mappedGoals)
    } catch (err) {
      console.warn("Failed to load configs", err)
      setGoals(MOCK_GOALS)
      setConfigs(INITIAL_CONFIGS)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadData()
  }, [loadData])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    await loadData()
    setRefreshing(false)
  }, [loadData])

  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft] = useState<Partial<ReminderConfig>>({})
  const [showTimePicker, setShowTimePicker] = useState(false)

  const openEdit = (goalId: string) => {
    setEditing(goalId)
    setDraft(configs[goalId] ?? { goalId, frequency: "DAILY", timeOfDay: "08:00", message: "", enabled: true })
  }

  const saveEdit = async (goalId: string) => {
    const isNew = !configs[goalId]
    const saved = {
      userId: user?.id ?? "",
      goalId,
      frequency: draft.frequency ?? "DAILY",
      timeOfDay: draft.timeOfDay ?? "08:00",
      message: draft.message ?? "",
      enabled: draft.enabled ?? true,
    }
    
    // Optimistic Update
    setConfigs(p => ({ ...p, [goalId]: saved }))
    setGoals(p => p.map(g => g.id === goalId ? { ...g, hasReminder: true } : g))
    setEditing(null)

    try {
      if (isNew) {
        await apiPost(SERVICES.notification, '/api/notifications/config', saved)
      } else {
        await apiPut(SERVICES.notification, '/api/notifications/config', saved)
      }
    } catch(e) { console.warn("Failed to save config", e) }
  }

  const removeReminder = async (goalId: string) => {
    setConfigs(p => { const next = { ...p }; delete next[goalId]; return next })
    setGoals(p => p.map(g => g.id === goalId ? { ...g, hasReminder: false } : g))
    setEditing(null)
    
    try {
      // Deleting by updating with enabled = false since backend might not have a DELETE route based on instructions
      await apiPut(SERVICES.notification, '/api/notifications/config', { userId: user?.id || '', goalId, enabled: false, frequency: "DAILY", timeOfDay: "08:00" })
    } catch(e) { console.warn("Failed to disable config", e) }
  }

  const toggleEnabled = async (goalId: string) => {
    const current = configs[goalId]
    if (!current) return
    const nextEnabled = !current.enabled
    setConfigs(p => ({ ...p, [goalId]: { ...p[goalId], enabled: nextEnabled } }))
    try {
      await apiPut(SERVICES.notification, '/api/notifications/config', { ...current, userId: user?.id || '', enabled: nextEnabled })
    } catch(e) { console.warn("Failed to toggle config", e) }
  }

  const withReminder = goals.filter(g => g.hasReminder)
  const without = goals.filter(g => !g.hasReminder)

  const s = styles(c)

  if (loading) {
    return (
      <View style={[s.subScreen, { paddingHorizontal: 20, paddingTop: 16, gap: 16 }]}>
        <SkeletonLoader width="50%" height={30} dark={c.dark} />
        <SkeletonLoader width="100%" height={120} borderRadius={16} dark={c.dark} />
        <SkeletonLoader width="100%" height={60} borderRadius={16} dark={c.dark} />
        <SkeletonLoader width="100%" height={60} borderRadius={16} dark={c.dark} />
      </View>
    )
  }

  const EditForm = ({ goalId, isNew }: { goalId: string; isNew: boolean }) => (
    <View style={s.editForm}>
      <View style={s.formGroup}>
        <Text style={s.formLabel}>FREQUENCY</Text>
        <View style={s.freqRow}>
          {(["DAILY", "INTERVAL", "WEEKDAYS"] as FrequencyType[]).map((f) => {
            const active = (draft.frequency ?? "DAILY") === f
            return (
              <TouchableOpacity
                key={f}
                onPress={() => setDraft(d => ({ ...d, frequency: f }))}
                style={[s.freqBtn, active ? { backgroundColor: c.primary } : { backgroundColor: c.surface2 }]}
              >
                <Text style={[s.freqIcon, { color: active ? '#fff' : c.muted }]}>
                  {f === "DAILY" ? "◷" : f === "INTERVAL" ? "↻" : "≡"}
                </Text>
                <Text style={[s.freqTitle, { color: active ? '#fff' : c.text }]}>{FREQ_LABELS[f]}</Text>
                <Text style={[s.freqDesc, { color: active ? 'rgba(255,255,255,0.7)' : c.muted }]}>{FREQ_DESC[f]}</Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </View>
      
      <View style={s.formGroup}>
        <Text style={s.formLabel}>TIME OF DAY</Text>
        <TouchableOpacity
          style={[s.input, { justifyContent: 'center' }]}
          onPress={() => setShowTimePicker(true)}
        >
          <Text style={{ color: c.text }}>{draft.timeOfDay ?? "08:00"}</Text>
        </TouchableOpacity>
        {showTimePicker && (
          <DateTimePicker
            value={(() => {
              const [h, m] = (draft.timeOfDay ?? "08:00").split(':').map(Number);
              const d = new Date();
              d.setHours(h);
              d.setMinutes(m);
              return d;
            })()}
            mode="time"
            display="default"
            onValueChange={(event, date) => {
              setShowTimePicker(false)
              if (date) {
                const hh = date.getHours().toString().padStart(2, '0')
                const mm = date.getMinutes().toString().padStart(2, '0')
                setDraft(d => ({ ...d, timeOfDay: `${hh}:${mm}` }))
              }
            }}
            onDismiss={() => setShowTimePicker(false)}
          />
        )}
      </View>

      <View style={s.formGroup}>
        <Text style={s.formLabel}>MESSAGE</Text>
        <TextInput
          value={draft.message ?? ""}
          onChangeText={t => setDraft(d => ({ ...d, message: t }))}
          style={[s.input, { height: 60, textAlignVertical: 'top' }]}
          placeholder="What should remind you?"
          placeholderTextColor={c.muted}
          multiline
        />
      </View>

      <View style={s.formActions}>
        {!isNew && (
          <TouchableOpacity onPress={() => removeReminder(goalId)} style={s.removeBtn}>
            <Text style={s.removeBtnText}>Remove</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => setEditing(null)} style={s.cancelBtn}>
          <Text style={s.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => saveEdit(goalId)} style={s.saveBtn}>
          <Text style={s.saveBtnText}>{isNew ? "Save reminder" : "Save"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <View style={s.subScreen}>
      <View style={s.subHeader}>
        <View>
          <Text style={s.subHeaderTitle}>Reminders</Text>
          <Text style={s.subHeaderSubtitle}>Set per goal — create a goal first</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.remindersScroll}>
        {/* Goals with reminders */}
        {withReminder.map(goal => {
          const cfg = configs[goal.id]
          const isEditing = editing === goal.id
          if (!cfg) return null

          return (
            <View key={goal.id} style={[s.reminderCard, isEditing && { borderColor: c.primary, backgroundColor: c.primaryDim }]}>
              <View style={s.reminderCardTop}>
                <View style={s.reminderTitleRow}>
                  <Feather name={goal.emoji as any} size={20} color={c.text} />
                  <Text style={s.reminderCardTitle}>{goal.title}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => toggleEnabled(goal.id)}
                  style={[s.toggleSwitch, { backgroundColor: cfg.enabled ? c.primary : c.surface2 }]}
                >
                  <View style={[s.toggleKnob, { left: cfg.enabled ? 22 : 2 }]} />
                </TouchableOpacity>
              </View>

              {!isEditing && (
                <TouchableOpacity
                  style={[s.reminderCardBody, !cfg.enabled && { opacity: 0.4 }]}
                  onPress={() => cfg.enabled && openEdit(goal.id)}
                  disabled={!cfg.enabled}
                >
                  <View style={s.reminderInfoRow}>
                    <View style={s.freqBadge}>
                      <Text style={s.freqBadgeText}>{FREQ_LABELS[cfg.frequency]}</Text>
                    </View>
                    <Text style={s.timeText}>{cfg.timeOfDay}</Text>
                    {!!cfg.message && (
                      <Text style={s.msgText} numberOfLines={1}>"{cfg.message}"</Text>
                    )}
                  </View>
                  {cfg.enabled && <Text style={s.editText}>Edit →</Text>}
                </TouchableOpacity>
              )}

              {isEditing && <EditForm goalId={goal.id} isNew={false} />}
            </View>
          )
        })}

        {/* Goals without reminders */}
        {without.length > 0 && (
          <View style={{ marginTop: 8 }}>
            <Text style={s.sectionTitle}>NO REMINDER SET</Text>
            {without.map(goal => (
              <View key={goal.id} style={{ marginBottom: 10 }}>
                <TouchableOpacity
                  style={[s.reminderCard, editing === goal.id && { borderBottomWidth: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderColor: c.primary, backgroundColor: c.primaryDim }]}
                  onPress={() => editing !== goal.id && openEdit(goal.id)}
                >
                  <View style={s.reminderCardTop}>
                    <View style={s.reminderTitleRow}>
                      <Feather name={goal.emoji as any} size={20} color={c.muted} />
                      <Text style={[s.reminderCardTitle, { color: c.muted }]}>{goal.title}</Text>
                    </View>
                    {editing !== goal.id && (
                      <View style={s.addBadge}>
                        <Text style={s.addBadgeText}>+ Add reminder</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
                {editing === goal.id && (
                  <View style={[s.reminderCard, { borderTopWidth: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0, borderColor: c.primary, backgroundColor: c.primaryDim, marginTop: 0 }]}>
                    <EditForm goalId={goal.id} isNew={true} />
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {goals.length === 0 && (
          <View style={s.emptyState}>
            <View style={[s.emptyIconWrap, { backgroundColor: c.surface2 }]}>
              <Feather name="target" size={24} color={c.text} />
            </View>
            <Text style={s.emptyTitle}>No goals yet.{"\n"}Create a goal to set reminders.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

function NotificationLogsView({ c }: { c: Colors }) {
  const { user } = useAuth()
  const [logs, setLogs] = useState<NotificationLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadLogs() {
      if (!user) return
      try {
        const res = await apiGet<NotificationLog[]>(SERVICES.notification, `/api/notifications/logs?userId=${user.id}`)
        setLogs(res)
      } catch (err) {
        console.warn("Failed to load logs", err)
        setLogs(MOCK_LOGS)
      } finally {
        setLoading(false)
      }
    }
    loadLogs()
  }, [user])

  const sent = logs.filter((l) => l.status === "SENT").length
  const failed = logs.filter((l) => l.status === "FAILED").length
  const total = logs.length
  
  const s = styles(c)

  if (loading) {
    return (
      <View style={[s.subScreen, { paddingHorizontal: 20, paddingTop: 16, gap: 16 }]}>
        <SkeletonLoader width="60%" height={30} dark={c.dark} />
        <SkeletonLoader width="100%" height={80} borderRadius={16} dark={c.dark} />
        <SkeletonLoader width="100%" height={70} borderRadius={16} dark={c.dark} />
        <SkeletonLoader width="100%" height={70} borderRadius={16} dark={c.dark} />
      </View>
    )
  }

  return (
    <View style={s.subScreen}>
      <View style={s.subHeader}>
        <View>
          <Text style={s.subHeaderTitle}>Delivery Log</Text>
          <Text style={s.subHeaderSubtitle}>Push notification history</Text>
        </View>
      </View>

      {total > 0 && (
        <View style={s.statsCard}>
          <View style={s.statCol}>
            <Text style={[s.statVal, { color: '#10B981' }]}>{sent}</Text>
            <Text style={s.statLabel}>SENT</Text>
          </View>
          <View style={[s.statCol, { borderLeftWidth: 1, borderLeftColor: c.border }]}>
            <Text style={[s.statVal, { color: '#EF4444' }]}>{failed}</Text>
            <Text style={s.statLabel}>FAILED</Text>
          </View>
          <View style={[s.statCol, { borderLeftWidth: 1, borderLeftColor: c.border }]}>
            <Text style={[s.statVal, { color: c.primaryLight }]}>{Math.round((sent / total) * 100)}%</Text>
            <Text style={s.statLabel}>SUCCESS</Text>
          </View>
        </View>
      )}

      <ScrollView contentContainerStyle={s.logsScroll}>
        {logs.map(log => {
          const isSent = log.status === "SENT"
          return (
            <View key={log.id} style={s.logCard}>
              <View style={[s.logIconWrap, { backgroundColor: isSent ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)' }]}>
                <Feather name={isSent ? "check" : "x"} size={14} color={isSent ? '#10B981' : '#EF4444'} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={s.notifTitleRow}>
                  <Text style={s.logGoalTitle}>{log.goalTitle}</Text>
                  <Text style={s.notifTime}>{relativeTime(log.sentAt)}</Text>
                </View>
                <Text style={s.logMsg} numberOfLines={1}>{log.message}</Text>
                <View style={{ alignSelf: 'flex-start', marginTop: 6, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, backgroundColor: isSent ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)' }}>
                  <Text style={{ fontSize: 9, fontWeight: '700', color: isSent ? '#10B981' : '#EF4444' }}>{log.status}</Text>
                </View>
              </View>
            </View>
          )
        })}

        {total === 0 && (
          <View style={s.emptyState}>
             <View style={[s.emptyIconWrap, { backgroundColor: c.surface2 }]}>
              <Feather name="list" size={24} color={c.text} />
            </View>
            <Text style={s.emptyTitle}>No logs yet</Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}


export default function RemindersScreen({ colors: c }: { colors: Colors }) {
  const [tab, setTab] = useState<Tab>("inbox")
  const s = styles(c)

  return (
    <View style={s.container}>
      {/* Top Tab Bar for Reminders Screen */}
      <View style={s.topTabBar}>
        <TouchableOpacity style={[s.topTab, tab === 'inbox' && s.topTabActive]} onPress={() => setTab('inbox')}>
          <Text style={[s.topTabText, tab === 'inbox' && { color: c.text, fontWeight: '700' }]}>Inbox</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.topTab, tab === 'reminders' && s.topTabActive]} onPress={() => setTab('reminders')}>
          <Text style={[s.topTabText, tab === 'reminders' && { color: c.text, fontWeight: '700' }]}>Reminders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.topTab, tab === 'logs' && s.topTabActive]} onPress={() => setTab('logs')}>
          <Text style={[s.topTabText, tab === 'logs' && { color: c.text, fontWeight: '700' }]}>Logs</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }}>
        {tab === 'inbox' && <NotificationsInbox c={c} />}
        {tab === 'reminders' && <RemindersConfigView c={c} />}
        {tab === 'logs' && <NotificationLogsView c={c} />}
      </View>
    </View>
  )
}

const styles = (c: Colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.bg },
  topTabBar: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: c.border },
  topTab: { flex: 1, alignItems: 'center', paddingVertical: 8, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  topTabActive: { borderBottomColor: c.primary },
  topTabText: { color: c.muted, fontSize: 14, fontWeight: '600' },
  
  subScreen: { flex: 1 },
  subHeader: { paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: c.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  subHeaderTitle: { fontSize: 22, fontWeight: '700', color: c.text },
  subHeaderSubtitle: { fontSize: 12, color: c.primaryLight, marginTop: 4 },
  markReadBtn: { backgroundColor: c.primaryDim, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99 },
  markReadBtnText: { color: c.primary, fontSize: 12, fontWeight: '600' },

  notifRow: { flexDirection: 'row', paddingHorizontal: 24, paddingVertical: 16, position: 'relative' },
  unreadDot: { position: 'absolute', left: 8, top: '50%', width: 6, height: 6, borderRadius: 3, marginTop: -3 },
  notifContent: { flexDirection: 'row', gap: 12, flex: 1 },
  notifIconWrap: { width: 40, height: 40, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  notifIcon: { fontSize: 16 },
  notifTextWrap: { flex: 1 },
  notifTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  notifTitle: { fontSize: 14, fontWeight: '600', color: c.text, flex: 1 },
  notifTime: { fontSize: 11, color: c.muted, marginLeft: 8 },
  notifMessage: { fontSize: 12, color: c.text, marginTop: 4, lineHeight: 18 },
  notifBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99, marginTop: 6 },
  notifBadgeText: { fontSize: 10, fontWeight: '600' },

  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
  emptyIconWrap: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 14, fontWeight: '500', color: c.muted, textAlign: 'center' },
  emptyDesc: { fontSize: 12, color: c.muted, textAlign: 'center' },

  remindersScroll: { paddingHorizontal: 20, paddingVertical: 16, gap: 10 },
  reminderCard: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 16, overflow: 'hidden' },
  reminderCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 14 },
  reminderTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  emojiLarge: { fontSize: 20 },
  reminderCardTitle: { fontSize: 14, fontWeight: '600', color: c.text },
  toggleSwitch: { width: 40, height: 22, borderRadius: 99, justifyContent: 'center' },
  toggleKnob: { position: 'absolute', width: 16, height: 16, borderRadius: 8, backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, shadowOffset: { width: 0, height: 2 } },
  reminderCardBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 14 },
  reminderInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  freqBadge: { backgroundColor: c.primaryDim, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  freqBadgeText: { fontSize: 12, fontWeight: '600', color: c.primary },
  timeText: { fontSize: 12, fontWeight: '500', color: c.muted },
  msgText: { fontSize: 12, color: c.muted, flex: 1 },
  editText: { fontSize: 12, color: c.primary, fontWeight: '500' },

  sectionTitle: { fontSize: 10, fontWeight: '600', color: c.muted, letterSpacing: 1, marginBottom: 8, marginTop: 4 },
  addBadge: { backgroundColor: c.primaryDim, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 },
  addBadgeText: { color: c.primary, fontSize: 12, fontWeight: '600' },

  editForm: { paddingHorizontal: 16, paddingBottom: 16, gap: 12 },
  formGroup: { gap: 6 },
  formLabel: { fontSize: 10, fontWeight: '600', color: c.muted, letterSpacing: 1 },
  freqRow: { flexDirection: 'row', gap: 6 },
  freqBtn: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 12 },
  freqIcon: { fontSize: 14, marginBottom: 2 },
  freqTitle: { fontSize: 10, fontWeight: '600' },
  freqDesc: { fontSize: 8, marginTop: 2 },
  input: { backgroundColor: c.surface2, borderWidth: 1, borderColor: c.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: c.text },
  formActions: { flexDirection: 'row', gap: 8, paddingTop: 4 },
  removeBtn: { backgroundColor: 'rgba(225, 29, 72, 0.1)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, justifyContent: 'center' },
  removeBtnText: { color: '#E11D48', fontSize: 12, fontWeight: '600' },
  cancelBtn: { flex: 1, backgroundColor: c.surface2, paddingVertical: 8, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cancelBtnText: { color: c.muted, fontSize: 12, fontWeight: '600' },
  saveBtn: { flex: 1, backgroundColor: c.primary, paddingVertical: 8, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },

  statsCard: { marginHorizontal: 20, marginTop: 12, marginBottom: 8, borderRadius: 16, borderWidth: 1, borderColor: c.border, backgroundColor: c.surface, flexDirection: 'row' },
  statCol: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  statVal: { fontSize: 24, fontWeight: 'bold' },
  statLabel: { fontSize: 10, fontWeight: '600', color: c.muted, letterSpacing: 1, marginTop: 2 },
  
  logsScroll: { paddingHorizontal: 20, paddingVertical: 8, gap: 8 },
  logCard: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, borderWidth: 1, borderColor: c.border, backgroundColor: c.surface },
  logIconWrap: { width: 28, height: 28, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  logGoalTitle: { fontSize: 12, fontWeight: '600', color: c.text },
  logMsg: { fontSize: 12, color: c.muted, marginTop: 2 }
})

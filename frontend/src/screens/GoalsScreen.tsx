import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Modal, Pressable, RefreshControl } from 'react-native'
import type { GoalProgressResponse, GoalStatus, MilestoneStatus } from '../types/goal'
import * as Haptics from '../utils/haptics'
import { SkeletonLoader } from '../components/SkeletonLoader'
import Svg, { Rect, Path } from 'react-native-svg'
import { Feather } from '@expo/vector-icons'
import { apiGet, apiPost, apiPut, apiDelete, apiPatch, SERVICES } from '../api/client'
import { useAuth } from '../context/AuthContext'
import DateTimePicker from '@react-native-community/datetimepicker'

interface Colors {
  bg: string; surface: string; surface2: string; border: string
  text: string; muted: string; primary: string; primaryLight: string
  primaryDim: string; navBg: string; dark: boolean
}

const MOCK_USER_ID = '00000000-0000-0000-0000-000000000001'
function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

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
]

export default function GoalsScreen({ colors: c }: { colors: Colors }) {
  const { user } = useAuth()
  const [data, setData] = useState<GoalProgressResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadGoals = useCallback(async () => {
    if (!user) return
    try {
      const goals = await apiGet<any[]>(SERVICES.goal, `/api/goals/user/${user.id}`)
      
      // Fetch progress (milestones + completion %) for each goal
      const progresses = await Promise.all(
        goals.map(async (g) => {
          try {
            return await apiGet<GoalProgressResponse>(SERVICES.goal, `/api/goals/${g.id}/progress`)
          } catch (err) {
            console.warn(`Failed to load progress for goal ${g.id}`)
            return { goal: g, milestones: [], completionPercentage: 0 }
          }
        })
      )
      setData(progresses)
    } catch (err) {
      console.warn("Failed to load real goals, using mock fallback", err)
      setData(INITIAL_DATA)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadGoals()
  }, [loadGoals])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    await loadGoals()
    setRefreshing(false)
  }, [loadGoals])

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [showAddMs, setShowAddMs] = useState(false)
  const [goalForm, setGoalForm] = useState({ title: '', description: '', deadline: '' })
  const [showGoalDatePicker, setShowGoalDatePicker] = useState(false)
  const [msForm, setMsForm] = useState({ title: '', dueDate: '' })
  const [showMsDatePicker, setShowMsDatePicker] = useState(false)

  const selected = data.find(d => d.goal.id === selectedId) ?? null

  const recalcPct = (ms: GoalProgressResponse['milestones']) =>
    ms.length ? Math.round((ms.filter(m => m.status === 'COMPLETED').length / ms.length) * 100) : 0

  const toggleMs = async (goalId: string, msId: string) => {
    // Optimistic UI
    let newStatus: MilestoneStatus = 'COMPLETED'
    setData(prev => prev.map(d => {
      if (d.goal.id !== goalId) return d
      const milestones = d.milestones.map(m => {
        if (m.id === msId) {
          newStatus = m.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED'
          return { ...m, status: newStatus }
        }
        return m
      })
      return { ...d, milestones, completionPercentage: recalcPct(milestones) }
    }))
    try {
      await apiPatch(SERVICES.goal, `/api/milestones/${msId}/status`, newStatus)
    } catch(e) { console.warn('Failed to toggle milestone', e) }
  }

  const updateStatus = async (goalId: string, status: GoalStatus) => {
    setData(prev => prev.map(d => d.goal.id === goalId ? { ...d, goal: { ...d.goal, status } } : d))
    try {
      await apiPatch(SERVICES.goal, `/api/goals/${goalId}/status`, status)
    } catch(e) { console.warn('Failed to update status', e) }
  }

  const deleteGoal = async (goalId: string) => {
    setData(prev => prev.filter(d => d.goal.id !== goalId))
    setSelectedId(null)
    try {
      await apiDelete(SERVICES.goal, `/api/goals/${goalId}`)
    } catch(e) { console.warn('Failed to delete goal', e) }
  }

  const addGoal = async () => {
    if (!goalForm.title.trim() || !goalForm.deadline) return
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    const newGoalPayload = { title: goalForm.title, description: goalForm.description, deadline: new Date(goalForm.deadline).toISOString(), userId: user?.id }
    
    // Optimistic
    const tempId = uuid()
    setData(prev => [{
      goal: { ...newGoalPayload, id: tempId, userId: user?.id || MOCK_USER_ID, status: 'ACTIVE', createdAt: new Date().toISOString() },
      milestones: [],
      completionPercentage: 0,
    }, ...prev])
    setGoalForm({ title: '', description: '', deadline: '' })
    setShowAddGoal(false)

    try {
      await apiPost<{goal: any}>(SERVICES.goal, '/api/goals', newGoalPayload)
    } catch(e) { console.warn('Failed to add goal', e) }
  }

  const addMilestone = async (goalId: string) => {
    if (!msForm.title.trim() || !msForm.dueDate) return
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    const payload = { title: msForm.title, dueDate: new Date(msForm.dueDate).toISOString(), goalId }
    
    setData(prev => prev.map(d => {
      if (d.goal.id !== goalId) return d
      const milestones = [...d.milestones, { id: uuid(), ...payload, status: 'PENDING' as MilestoneStatus, createdAt: new Date().toISOString() }]
      return { ...d, milestones, completionPercentage: recalcPct(milestones) }
    }))
    setMsForm({ title: '', dueDate: '' })
    setShowAddMs(false)

    try {
      await apiPost(SERVICES.goal, `/api/milestones`, payload)
    } catch(e) { console.warn('Failed to add milestone', e) }
  }

  const active = data.filter(d => d.goal.status === 'ACTIVE').length
  const completed = data.filter(d => d.goal.status === 'COMPLETED').length

  const s = styles(c)

  if (loading) {
    return (
      <View style={[s.container, { paddingHorizontal: 20, paddingTop: 16, gap: 16 }]}>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <SkeletonLoader width="30%" height={80} borderRadius={16} dark={c.dark} />
          <SkeletonLoader width="30%" height={80} borderRadius={16} dark={c.dark} />
          <SkeletonLoader width="30%" height={80} borderRadius={16} dark={c.dark} />
        </View>
        <SkeletonLoader width="40%" height={24} dark={c.dark} style={{ marginTop: 12 }} />
        <SkeletonLoader width="100%" height={100} borderRadius={16} dark={c.dark} />
        <SkeletonLoader width="100%" height={100} borderRadius={16} dark={c.dark} />
      </View>
    )
  }

  return (
    <View style={s.container}>
      <ScrollView 
        contentContainerStyle={s.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.primary} colors={[c.primary]} />}
      >
        {/* Summary */}
        <View style={s.summaryGrid}>
          <View style={s.activeBox}>
            <Text style={s.activeLabel}>ACTIVE</Text>
            <Text style={s.activeValue}>{active}</Text>
          </View>
          <View style={s.completedBox}>
            <Text style={s.completedLabel}>COMPLETED</Text>
            <Text style={s.completedValue}>{completed}</Text>
          </View>
        </View>

        {/* Header + add button */}
        <View style={s.headerRow}>
          <Text style={s.headerTitle}>Your Goals</Text>
          <TouchableOpacity style={s.addGoalBtn} onPress={() => setShowAddGoal(v => !v)}>
            <Text style={s.addGoalText}>+ New goal</Text>
          </TouchableOpacity>
        </View>

        {/* Add goal form */}
        {showAddGoal && (
          <View style={s.formBox}>
            <Text style={s.formTitle}>New Goal</Text>
            <TextInput
              placeholder="Title *"
              placeholderTextColor={c.muted}
              value={goalForm.title}
              onChangeText={t => setGoalForm(f => ({ ...f, title: t }))}
              style={s.input}
            />
            <TextInput
              placeholder="Description (optional)"
              placeholderTextColor={c.muted}
              value={goalForm.description}
              onChangeText={t => setGoalForm(f => ({ ...f, description: t }))}
              multiline
              numberOfLines={2}
              style={[s.input, { height: 60, textAlignVertical: 'top' }]}
            />
            <View style={{ gap: 4 }}>
              <Text style={s.inputLabel}>Deadline *</Text>
              <TouchableOpacity
                style={[s.input, { justifyContent: 'center' }]}
                onPress={() => setShowGoalDatePicker(true)}
              >
                <Text style={{ color: goalForm.deadline ? c.text : c.muted }}>
                  {goalForm.deadline ? formatDeadline(goalForm.deadline) : 'Select a date'}
                </Text>
              </TouchableOpacity>
              {showGoalDatePicker && (
                <DateTimePicker
                  value={goalForm.deadline ? new Date(goalForm.deadline) : new Date()}
                  mode="date"
                  display="default"
                  onValueChange={(event, date) => {
                    setShowGoalDatePicker(false)
                    if (date) {
                      setGoalForm(f => ({ ...f, deadline: date.toISOString() }))
                    }
                  }}
                  onDismiss={() => setShowGoalDatePicker(false)}
                />
              )}
            </View>
            <View style={s.formActions}>
              <TouchableOpacity style={s.btnCancel} onPress={() => setShowAddGoal(false)}>
                <Text style={s.btnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.btnPrimary, (!goalForm.title.trim() || !goalForm.deadline) && { opacity: 0.5 }]}
                onPress={addGoal}
                disabled={!goalForm.title.trim() || !goalForm.deadline}
              >
                <Text style={s.btnPrimaryText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Goal cards */}
        {data.map(({ goal, milestones, completionPercentage }) => {
          const pct = Math.round(completionPercentage)
          const days = daysUntil(goal.deadline)
          const dlColor = deadlineColor(goal.deadline, goal.status)
          const isAct = goal.status === 'ACTIVE'

          return (
            <TouchableOpacity key={goal.id} style={s.goalCard} onPress={() => setSelectedId(goal.id)}>
              <View style={s.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={s.cardTitle}>{goal.title}</Text>
                  {!!goal.description && (
                    <Text style={s.cardDesc} numberOfLines={1}>{goal.description}</Text>
                  )}
                </View>
                <View style={s.cardTopRight}>
                  <View style={[s.statusBadge, { backgroundColor: STATUS_COLOR[goal.status] + '22' }]}>
                    <Text style={[s.statusBadgeText, { color: STATUS_COLOR[goal.status] }]}>{STATUS_LABEL[goal.status]}</Text>
                  </View>
                  <Text style={s.cardPct}>{pct}%</Text>
                </View>
              </View>

              <View style={s.progressTrack}>
                <View style={[s.progressFill, { width: `${pct}%`, backgroundColor: c.primary }]} />
              </View>

              <View style={s.cardBottom}>
                <View style={s.deadlineRow}>
                  <Svg viewBox="0 0 16 16" fill="none" stroke={dlColor} strokeWidth={1.5} width={12} height={12}>
                    <Rect x="1" y="2" width="14" height="13" rx="2" />
                    <Path d="M5 1v2M11 1v2M1 6h14" />
                  </Svg>
                  <Text style={[s.deadlineText, { color: dlColor }]}>
                    {isAct ? (days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? 'Due today' : `${days}d left`) : formatDeadline(goal.deadline)}
                  </Text>
                </View>
                <Text style={s.msCountText}>
                  {milestones.filter(m => m.status === 'COMPLETED').length}/{milestones.length} milestones →
                </Text>
              </View>
            </TouchableOpacity>
          )
        })}

        {data.length === 0 && (
          <View style={s.emptyState}>
            <Feather name="target" size={40} color={c.primary} style={{ marginBottom: 10 }} />
            <Text style={s.emptyTitle}>No goals yet</Text>
            <Text style={s.emptySub}>Tap "New goal" to get started.</Text>
          </View>
        )}
      </ScrollView>

      {/* Sheet Modal */}
      <Modal visible={!!selected} animationType="slide" transparent>
        <Pressable style={s.modalOverlay} onPress={() => { setSelectedId(null); setShowAddMs(false) }} />
        {selected && (
          <View style={s.sheet}>
            <View style={s.handleBarContainer}>
              <View style={s.handleBar} />
            </View>

            <View style={s.sheetHeader}>
              <View style={{ flex: 1 }}>
                <Text style={s.sheetTitle}>{selected.goal.title}</Text>
                {!!selected.goal.description && <Text style={s.sheetDesc}>{selected.goal.description}</Text>}
                <View style={s.sheetTags}>
                  <View style={[s.statusBadge, { backgroundColor: STATUS_COLOR[selected.goal.status] + '22' }]}>
                    <Text style={[s.statusBadgeText, { color: STATUS_COLOR[selected.goal.status] }]}>{STATUS_LABEL[selected.goal.status]}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Feather name="calendar" size={12} color={deadlineColor(selected.goal.deadline, selected.goal.status)} />
                    <Text style={[s.sheetDeadlineText, { color: deadlineColor(selected.goal.deadline, selected.goal.status) }]}>
                      {formatDeadline(selected.goal.deadline)}
                    </Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity style={s.closeBtn} onPress={() => { setSelectedId(null); setShowAddMs(false) }}>
                <Feather name="x" size={16} color={c.muted} />
              </TouchableOpacity>
            </View>

            <View style={s.sheetProgressRow}>
              <View style={s.progressTrack}>
                <View style={[s.progressFill, { width: `${Math.round(selected.completionPercentage)}%`, backgroundColor: c.primary }]} />
              </View>
              <Text style={s.sheetPct}>{Math.round(selected.completionPercentage)}%</Text>
            </View>

            <ScrollView contentContainerStyle={s.msScroll}>
              <Text style={s.msHeader}>
                MILESTONES · {selected.milestones.filter(m => m.status === 'COMPLETED').length}/{selected.milestones.length} done
              </Text>

              {selected.milestones.length === 0 && !showAddMs && (
                <Text style={s.msEmpty}>No milestones yet. Add one below.</Text>
              )}

              {selected.milestones.map(ms => {
                const done = ms.status === 'COMPLETED'
                const msDays = daysUntil(ms.dueDate)
                return (
                  <View key={ms.id} style={s.msItem}>
                    <TouchableOpacity
                      style={[s.msCheck, done ? s.msCheckDone : null]}
                      onPress={() => toggleMs(selected.goal.id, ms.id)}
                    >
                      {done && (
                        <Svg viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" width={10} height={10}>
                          <Path d="M2 6l3 3 5-5" />
                        </Svg>
                      )}
                    </TouchableOpacity>
                    <View style={{ flex: 1 }}>
                      <Text style={[s.msItemTitle, done ? s.msItemTitleDone : null]}>{ms.title}</Text>
                      <Text style={[s.msItemDue, { color: done ? c.muted : (msDays < 0 ? '#EF4444' : msDays <= 5 ? '#F59E0B' : c.muted) }]}>
                        Due {formatDeadline(ms.dueDate)}{!done && msDays < 0 ? ` · ${Math.abs(msDays)}d overdue` : ''}
                      </Text>
                    </View>
                    <View style={[s.msStatusBadge, { backgroundColor: done ? '#10B98120' : '#F59E0B20' }]}>
                      <Text style={[s.msStatusText, { color: done ? '#10B981' : '#F59E0B' }]}>{done ? 'DONE' : 'PENDING'}</Text>
                    </View>
                  </View>
                )
              })}

              {showAddMs ? (
                <View style={s.msForm}>
                  <Text style={s.formTitle}>New milestone</Text>
                  <TextInput
                    placeholder="Title *"
                    placeholderTextColor={c.muted}
                    value={msForm.title}
                    onChangeText={t => setMsForm(f => ({ ...f, title: t }))}
                    style={s.input}
                  />
                  <View style={{ gap: 4 }}>
                    <Text style={s.inputLabel}>Due date *</Text>
                    <TouchableOpacity
                      style={[s.input, { justifyContent: 'center' }]}
                      onPress={() => setShowMsDatePicker(true)}
                    >
                      <Text style={{ color: msForm.dueDate ? c.text : c.muted }}>
                        {msForm.dueDate ? formatDeadline(msForm.dueDate) : 'Select a date'}
                      </Text>
                    </TouchableOpacity>
                    {showMsDatePicker && (
                      <DateTimePicker
                        value={msForm.dueDate ? new Date(msForm.dueDate) : new Date()}
                        mode="date"
                        display="default"
                        onValueChange={(event, date) => {
                          setShowMsDatePicker(false)
                          if (date) {
                            setMsForm(f => ({ ...f, dueDate: date.toISOString() }))
                          }
                        }}
                        onDismiss={() => setShowMsDatePicker(false)}
                      />
                    )}
                  </View>
                  <View style={s.formActions}>
                    <TouchableOpacity style={s.btnCancel} onPress={() => { setShowAddMs(false); setMsForm({ title: '', dueDate: '' }) }}>
                      <Text style={s.btnCancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[s.btnPrimary, (!msForm.title.trim() || !msForm.dueDate) && { opacity: 0.5 }]}
                      onPress={() => addMilestone(selected.goal.id)}
                      disabled={!msForm.title.trim() || !msForm.dueDate}
                    >
                      <Text style={s.btnPrimaryText}>Add</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity style={s.addMsBtn} onPress={() => setShowAddMs(true)}>
                  <Text style={s.addMsBtnText}>+ Add milestone</Text>
                </TouchableOpacity>
              )}

              {/* Status Actions */}
              <View style={s.actionRow}>
                {selected.goal.status === 'ACTIVE' ? (
                  <>
                    <TouchableOpacity style={s.markBtn} onPress={() => updateStatus(selected.goal.id, 'COMPLETED')}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><Feather name="check" size={14} color="#10B981" /><Text style={s.markBtnText}>Mark complete</Text></View>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.abandonBtn} onPress={() => updateStatus(selected.goal.id, 'ABANDONED')}>
                      <Text style={s.abandonBtnText}>Abandon</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity style={s.reactivateBtn} onPress={() => updateStatus(selected.goal.id, 'ACTIVE')}>
                      <Text style={s.reactivateBtnText}>Reactivate</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.deleteBtn} onPress={() => deleteGoal(selected.goal.id)}>
                      <Text style={s.deleteBtnText}>Delete</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  )
}

const styles = (c: Colors) => StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 24, paddingTop: 10, gap: 14 },
  summaryGrid: { flexDirection: 'row', gap: 10 },
  activeBox: { flex: 1, backgroundColor: c.primary, borderRadius: 16, padding: 16 },
  activeLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '600', letterSpacing: 0.5, marginBottom: 4 },
  activeValue: { color: '#fff', fontSize: 30, fontWeight: '700' },
  completedBox: { flex: 1, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 16, padding: 16 },
  completedLabel: { color: c.muted, fontSize: 11, fontWeight: '600', letterSpacing: 0.5, marginBottom: 4 },
  completedValue: { color: c.text, fontSize: 30, fontWeight: '700' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 8 },
  headerTitle: { color: c.text, fontSize: 17, fontWeight: '700' },
  addGoalBtn: { backgroundColor: c.primary, borderRadius: 20, paddingVertical: 6, paddingHorizontal: 14 },
  addGoalText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  formBox: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 16, padding: 16, gap: 10 },
  formTitle: { color: c.text, fontWeight: '600', fontSize: 14 },
  input: { backgroundColor: c.surface2, borderWidth: 1, borderColor: c.border, borderRadius: 10, paddingVertical: 9, paddingHorizontal: 12, fontSize: 14, color: c.text },
  inputLabel: { color: c.muted, fontSize: 12 },
  formActions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  btnCancel: { flex: 1, backgroundColor: c.surface2, borderWidth: 1, borderColor: c.border, borderRadius: 10, padding: 9, alignItems: 'center' },
  btnCancelText: { color: c.muted, fontWeight: '600', fontSize: 14 },
  btnPrimary: { flex: 1, backgroundColor: c.primary, borderRadius: 10, padding: 9, alignItems: 'center' },
  btnPrimaryText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  goalCard: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 18, padding: 16, gap: 10 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
  cardTitle: { color: c.text, fontWeight: '700', fontSize: 15, lineHeight: 20 },
  cardDesc: { color: c.muted, fontSize: 12, marginTop: 3 },
  cardTopRight: { alignItems: 'flex-end', gap: 5 },
  statusBadge: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: 99 },
  statusBadgeText: { fontSize: 11, fontWeight: '600' },
  cardPct: { color: c.text, fontWeight: '700', fontSize: 16 },
  progressTrack: { backgroundColor: c.surface2, borderRadius: 99, height: 6, flex: 1, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 99 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  deadlineRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  deadlineText: { fontSize: 12, fontWeight: '500' },
  msCountText: { color: c.muted, fontSize: 12 },
  emptyState: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 },
  emptyTitle: { fontWeight: '600', fontSize: 15, color: c.text, marginBottom: 4 },
  emptySub: { fontSize: 13, color: c.muted },
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: { position: 'absolute', bottom: 0, left: 0, right: 0, maxHeight: '82%', backgroundColor: c.surface, borderTopLeftRadius: 22, borderTopRightRadius: 22, shadowColor: '#000', shadowOffset: { width: 0, height: -8 }, shadowOpacity: 0.25, shadowRadius: 40, elevation: 10 },
  handleBarContainer: { alignItems: 'center', paddingVertical: 10 },
  handleBar: { width: 36, height: 4, borderRadius: 99, backgroundColor: c.border },
  sheetHeader: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: c.border, gap: 12 },
  sheetTitle: { color: c.text, fontWeight: '700', fontSize: 17, lineHeight: 22 },
  sheetDesc: { color: c.muted, fontSize: 13, marginTop: 4, lineHeight: 18 },
  sheetTags: { flexDirection: 'row', gap: 8, marginTop: 8, alignItems: 'center', flexWrap: 'wrap' },
  sheetDeadlineText: { fontSize: 12, fontWeight: '500' },
  closeBtn: { backgroundColor: c.surface2, borderWidth: 1, borderColor: c.border, borderRadius: 10, width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { color: c.muted, fontSize: 16 },
  sheetProgressRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 14, gap: 12 },
  sheetPct: { color: c.primary, fontWeight: '700', fontSize: 15 },
  msScroll: { padding: 20, gap: 10 },
  msHeader: { color: c.muted, fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },
  msEmpty: { color: c.muted, fontSize: 13, paddingVertical: 8 },
  msItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 14, backgroundColor: c.surface2, borderRadius: 13 },
  msCheck: { width: 24, height: 24, borderRadius: 7, borderWidth: 2, borderColor: c.border, alignItems: 'center', justifyContent: 'center' },
  msCheckDone: { borderColor: c.primary, backgroundColor: c.primary },
  msItemTitle: { color: c.text, fontSize: 14, fontWeight: '500' },
  msItemTitleDone: { color: c.muted, textDecorationLine: 'line-through' },
  msItemDue: { fontSize: 12, marginTop: 2 },
  msStatusBadge: { paddingVertical: 3, paddingHorizontal: 7, borderRadius: 99 },
  msStatusText: { fontSize: 10, fontWeight: '700' },
  msForm: { backgroundColor: c.surface2, borderRadius: 13, padding: 14, gap: 10 },
  addMsBtn: { borderWidth: 1.5, borderColor: c.border, borderStyle: 'dashed', borderRadius: 13, padding: 12, alignItems: 'center', justifyContent: 'center' },
  addMsBtnText: { color: c.muted, fontSize: 13, fontWeight: '600' },
  actionRow: { flexDirection: 'row', gap: 8, paddingTop: 10 },
  markBtn: { flex: 1, backgroundColor: '#10B98118', borderWidth: 1, borderColor: '#10B98155', borderRadius: 11, padding: 12, alignItems: 'center' },
  markBtnText: { color: '#10B981', fontWeight: '600', fontSize: 13 },
  abandonBtn: { flex: 1, backgroundColor: '#EF444418', borderWidth: 1, borderColor: '#EF444455', borderRadius: 11, padding: 12, alignItems: 'center' },
  abandonBtnText: { color: '#EF4444', fontWeight: '600', fontSize: 13 },
  reactivateBtn: { flex: 1, backgroundColor: c.primaryDim, borderWidth: 1, borderColor: c.border, borderRadius: 11, padding: 12, alignItems: 'center' },
  reactivateBtnText: { color: c.primary, fontWeight: '600', fontSize: 13 },
  deleteBtn: { backgroundColor: '#EF444418', borderWidth: 1, borderColor: '#EF444455', borderRadius: 11, paddingHorizontal: 16, paddingVertical: 12, alignItems: 'center' },
  deleteBtnText: { color: '#EF4444', fontSize: 13, fontWeight: '600' }
})

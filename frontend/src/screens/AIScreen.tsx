import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native'
import type { AiResponse, MotivateRequest, SuggestRequest } from '../types/ai'
import { SkeletonLoader } from '../components/SkeletonLoader'
import * as Haptics from '../utils/haptics'
import Svg, { Circle, Path } from 'react-native-svg'
import { Feather } from '@expo/vector-icons'
import { apiGet, apiPost, SERVICES } from '../api/client'
import { useAuth } from '../context/AuthContext'
import type { GoalProgressResponse } from '../types/goal'

interface Colors {
  bg: string; surface: string; surface2: string; border: string
  text: string; muted: string; primary: string; primaryLight: string
  primaryDim: string; navBg: string; dark: boolean
}

type ActiveTab = 'motivate' | 'suggest'
type PreferredStyle = 'structured' | 'flexible' | 'aggressive'

// Mock goals (fallback only)
const MOCK_GOALS: GoalProgressResponse[] = [
  { goal: { id: '1', title: 'Complete AWS Certification', deadline: '2025-09-30T00:00:00Z' } as any, completionPercentage: 50, milestones: [] },
  { goal: { id: '2', title: 'Run a half marathon', deadline: '2025-11-01T00:00:00Z' } as any, completionPercentage: 33, milestones: [] },
  { goal: { id: '3', title: 'Launch freelance design portfolio', deadline: '2025-08-15T00:00:00Z' } as any, completionPercentage: 67, milestones: [] },
  { goal: { id: '4', title: 'Read 12 books this year', deadline: '2025-12-31T00:00:00Z' } as any, completionPercentage: 50, milestones: [] },
]

function daysUntil(iso: string) {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000))
}

async function callMotivate(req: MotivateRequest): Promise<AiResponse> {
  try {
    const res = await apiPost<AiResponse>(SERVICES.ai, '/api/ai/motivate', req)
    return res
  } catch (err: any) {
    console.warn("AI Motivate API failed, using fallback", err)
    const pct = Math.round(req.completionPercentage)
    const messages: Record<string, string> = {
      low: `You've kicked off "${req.goalTitle}" and that first step already puts you ahead of most. With ${req.daysRemaining} days on the clock, every small action you take today compounds. Keep showing up — momentum is building.`,
      mid: `You're ${pct}% through "${req.goalTitle}" — that's not nothing, that's real progress. With ${req.daysRemaining} days left, you're right in the zone where consistent effort pays off the most. Stay the course.`,
      high: `${pct}% done on "${req.goalTitle}" — you're in the final stretch with ${req.daysRemaining} days to go. The hardest part is behind you. Finish strong; this version of you will thank the one reading this right now.`,
    }
    const key = pct < 35 ? 'low' : pct < 70 ? 'mid' : 'high'
    return { content: messages[key], model: 'gemini-flash-latest', success: true }
  }
}

async function callSuggest(req: SuggestRequest): Promise<AiResponse> {
  try {
    const res = await apiPost<AiResponse>(SERVICES.ai, '/api/ai/suggest', req)
    return res
  } catch (err: any) {
    console.warn("AI Suggest API failed, using fallback", err)
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
}

function parseSuggestions(content: string): { title: string; body: string }[] {
  const blocks = content.split(/\*\*Goal \d+[^*]*\*\*/).filter(Boolean)
  const matches = [...content.matchAll(/\*\*Goal \d+ — ([^*]+)\*\*/g)]
  const titles = matches.map(m => m[1])
  return titles.map((title, i) => ({ title: title.trim(), body: (blocks[i] || '').trim() }))
}

const STYLE_OPTIONS: { value: PreferredStyle; label: string; desc: string }[] = [
  { value: 'structured', label: 'Structured', desc: 'Clear steps & schedules' },
  { value: 'flexible', label: 'Flexible', desc: 'Adaptable pace' },
  { value: 'aggressive', label: 'Aggressive', desc: 'Push hard & fast' },
]

export default function AIScreen({ colors: c }: { colors: Colors }) {
  const { user } = useAuth()
  const [goals, setGoals] = useState<GoalProgressResponse[]>([])
  const [loadingGoals, setLoadingGoals] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadGoals = useCallback(async () => {
    if (!user) return
    try {
      const res = await apiGet<any[]>(SERVICES.goal, `/api/goals/user/${user.id}`)
      
      const progresses = await Promise.all(
        res.map(async (g) => {
          try {
            return await apiGet<any>(SERVICES.goal, `/api/goals/${g.id}/progress`)
          } catch (err) {
            return { goal: g, milestones: [], completionPercentage: 0 }
          }
        })
      )
      setGoals(progresses)
    } catch (err) {
      console.warn("Failed to load goals for AI", err)
      setGoals(MOCK_GOALS) // fallback
    } finally {
      setLoadingGoals(false)
    }
  }, [user])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    await loadGoals()
    setRefreshing(false)
  }, [loadGoals])

  useEffect(() => {
    loadGoals()
  }, [loadGoals])
  const [tab, setTab] = useState<ActiveTab>('motivate')

  const [selectedGoalIdx, setSelectedGoalIdx] = useState(0)
  const [motivateResult, setMotivateResult] = useState<AiResponse | null>(null)
  const [motivateLoading, setMotivateLoading] = useState(false)

  const [userContext, setUserContext] = useState('')
  const [preferredStyle, setPreferredStyle] = useState<PreferredStyle>('structured')
  const [suggestResult, setSuggestResult] = useState<AiResponse | null>(null)
  const [suggestLoading, setSuggestLoading] = useState(false)
  const [parsedSuggestions, setParsedSuggestions] = useState<{ title: string; body: string }[]>([])
  const [expandedSuggestion, setExpandedSuggestion] = useState<number | null>(null)

  const selectedGoal = goals[selectedGoalIdx]

  const handleMotivate = async () => {
    setMotivateLoading(true)
    setMotivateResult(null)
    const req: MotivateRequest = {
      goalTitle: selectedGoal.goal.title,
      completionPercentage: selectedGoal.completionPercentage,
      daysRemaining: daysUntil(selectedGoal.goal.deadline),
    }
    const res = await callMotivate(req)
    setMotivateResult(res)
    setMotivateLoading(false)
  }

  const handleSuggest = async () => {
    if (!userContext.trim()) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setSuggestLoading(true)
    setSuggestResult(null)
    setParsedSuggestions([])
    setExpandedSuggestion(null)
    const req: SuggestRequest = {
      userContext: userContext.trim(),
      existingGoals: goals.map(g => g.goal.title),
      preferredStyle,
    }
    const res = await callSuggest(req)
    setSuggestResult(res)
    if (res.success) setParsedSuggestions(parseSuggestions(res.content))
    setSuggestLoading(false)
  }

  const s = styles(c)

  return (
    <View style={s.container}>
      {/* Tab bar */}
      <View style={s.tabBar}>
        {(['motivate', 'suggest'] as ActiveTab[]).map(t => {
          const active = tab === t
          return (
            <TouchableOpacity
              key={t}
              onPress={() => setTab(t)}
              style={[s.tabButton, { backgroundColor: active ? c.primary : c.surface2 }]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Feather name={t === 'motivate' ? 'message-circle' : 'star'} size={14} color={active ? '#fff' : c.muted} />
                <Text style={[s.tabButtonText, { color: active ? '#fff' : c.muted }]}>
                  {t === 'motivate' ? 'Motivate' : 'Suggest Goals'}
                </Text>
              </View>
            </TouchableOpacity>
          )
        })}
      </View>

      <ScrollView contentContainerStyle={s.scrollContent}>
        {/* ── MOTIVATE TAB ── */}
        {tab === 'motivate' && (
          <View style={s.tabContent}>
            {/* Explainer */}
            <View style={[s.explainer, { backgroundColor: c.primary }]}>
              <View style={s.explainerCircle1} />
              <Text style={s.explainerBadge}>AI COACH</Text>
              <Text style={s.explainerTitle}>Get a personal boost</Text>
              <Text style={s.explainerBody}>
                Pick a goal and your AI coach will write a motivational message tailored to your exact progress and deadline.
              </Text>
            </View>

            {/* Goal picker */}
            <View style={s.card}>
              <Text style={s.cardHeader}>SELECT GOAL</Text>
              <View style={{ gap: 7 }}>
                {loadingGoals ? (
                  <View style={{ gap: 8 }}>
                    <SkeletonLoader width="100%" height={60} borderRadius={12} dark={c.dark} />
                    <SkeletonLoader width="100%" height={60} borderRadius={12} dark={c.dark} />
                    <SkeletonLoader width="100%" height={60} borderRadius={12} dark={c.dark} />
                  </View>
                ) : goals.length === 0 ? (
                  <Text style={{ color: c.muted, fontSize: 13 }}>No active goals found.</Text>
                ) : goals.map((g, i) => {
                  const active = selectedGoalIdx === i
                  return (
                    <TouchableOpacity
                      key={i}
                      onPress={() => { setSelectedGoalIdx(i); setMotivateResult(null) }}
                      style={[
                        s.goalRow,
                        { backgroundColor: active ? c.primaryDim : c.surface2, borderColor: active ? c.primary : c.border }
                      ]}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[s.goalRowTitle, { color: c.text }]}>{g.goal.title}</Text>
                        <Text style={[s.goalRowMeta, { color: c.muted }]}>
                          {Math.round(g.completionPercentage)}% done · {daysUntil(g.goal.deadline)}d left
                        </Text>
                      </View>
                      <View style={[s.radioOuter, { borderColor: active ? c.primary : c.border, backgroundColor: active ? c.primary : 'transparent' }]}>
                        {active && <View style={s.radioInner} />}
                      </View>
                    </TouchableOpacity>
                  )
                })}
              </View>
            </View>

            {/* Progress summary for selected goal */}
            {selectedGoal && (
            <View style={[s.card, { flexDirection: 'row', gap: 16 }]}>
              <View style={{ flex: 1 }}>
                <Text style={s.cardHeader}>COMPLETION</Text>
                <Text style={[s.summaryValue, { color: c.primary }]}>{Math.round(selectedGoal.completionPercentage)}%</Text>
              </View>
              <View style={[s.divider, { backgroundColor: c.border }]} />
              <View style={{ flex: 1 }}>
                <Text style={s.cardHeader}>DAYS LEFT</Text>
                <Text style={[s.summaryValue, { color: c.text }]}>{daysUntil(selectedGoal.goal.deadline)}</Text>
              </View>
              <View style={[s.divider, { backgroundColor: c.border }]} />
              <View style={{ flex: 1 }}>
                <Text style={s.cardHeader}>MODEL</Text>
                <Text style={[s.summaryValue, { color: c.text, fontSize: 13 }]}>Gemini Flash</Text>
              </View>
            </View>
            )}

            {/* Generate button */}
            <TouchableOpacity
              onPress={handleMotivate}
              disabled={motivateLoading || !selectedGoal}
              style={[s.primaryBtn, { backgroundColor: motivateLoading || !selectedGoal ? c.primaryDim : c.primary }]}
            >
              {motivateLoading ? (
                <ActivityIndicator color={c.primary} style={{ marginRight: 8 }} />
              ) : null}
              {!motivateLoading && <Feather name="zap" size={16} color="#fff" style={{ marginRight: 8 }} />}
              <Text style={[s.primaryBtnText, { color: motivateLoading ? c.muted : '#fff' }]}>
                {motivateLoading ? 'Generating your message…' : 'Generate motivation'}
              </Text>
            </TouchableOpacity>

            {/* Result */}
            {motivateResult && (
              <View style={[s.card, { borderColor: c.primary + '55', borderWidth: 1.5 }]}>
                <View style={s.resultHeader}>
                  <View style={[s.robotIcon, { backgroundColor: c.primaryDim }]}>
                    <Feather name="cpu" size={16} color={c.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.resultTitle, { color: c.text }]}>Syntra Coach</Text>
                    <Text style={[s.resultMeta, { color: c.muted }]}>{motivateResult.model}</Text>
                  </View>
                  {motivateResult.success && (
                    <View style={s.successBadge}>
                      <Text style={s.successBadgeText}>SUCCESS</Text>
                    </View>
                  )}
                </View>
                <Text style={[s.resultBody, { color: c.text }]}>{motivateResult.content}</Text>
                <TouchableOpacity onPress={handleMotivate} style={[s.regenBtn, { borderColor: c.border }]}>
                  <Text style={[s.regenBtnText, { color: c.muted }]}>↺ Regenerate</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* ── SUGGEST TAB ── */}
        {tab === 'suggest' && (
          <View style={s.tabContent}>
            {/* Explainer */}
            <View style={[s.explainer, { backgroundColor: '#6D28D9' }]}>
              <View style={s.explainerCircle2} />
              <Text style={s.explainerBadge}>AI SUGGESTIONS</Text>
              <Text style={s.explainerTitle}>SMART goal ideas</Text>
              <Text style={s.explainerBody}>
                Describe what you want to achieve and your AI coach will suggest 3 actionable SMART goals with milestones.
              </Text>
            </View>

            {/* Context input */}
            <View style={s.card}>
              <Text style={s.cardHeader}>WHAT DO YOU WANT TO ACHIEVE?</Text>
              <TextInput
                placeholder='e.g. "I want to learn Spanish well enough to hold a conversation in 3 months"'
                placeholderTextColor={c.muted}
                value={userContext}
                onChangeText={setUserContext}
                multiline
                numberOfLines={3}
                style={[s.input, { backgroundColor: c.surface2, borderColor: c.border, color: c.text }]}
              />
            </View>

            {/* Style picker */}
            <View style={s.card}>
              <Text style={s.cardHeader}>PREFERRED STYLE</Text>
              <View style={s.styleRow}>
                {STYLE_OPTIONS.map(opt => {
                  const active = preferredStyle === opt.value
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      onPress={() => setPreferredStyle(opt.value)}
                      style={[s.styleBtn, { borderColor: active ? c.primary : c.border, backgroundColor: active ? c.primaryDim : c.surface2 }]}
                    >
                      <Text style={[s.styleBtnTitle, { color: active ? c.primary : c.text }]}>{opt.label}</Text>
                      <Text style={[s.styleBtnDesc, { color: c.muted }]} numberOfLines={1}>{opt.desc}</Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
            </View>

            {/* Generate button */}
            <TouchableOpacity
              onPress={handleSuggest}
              disabled={suggestLoading || !userContext.trim()}
              style={[s.primaryBtn, { backgroundColor: suggestLoading || !userContext.trim() ? c.primaryDim : c.primary }]}
            >
              {suggestLoading ? (
                <ActivityIndicator color={c.primary} style={{ marginRight: 8 }} />
              ) : null}
              {!suggestLoading && <Feather name="list" size={16} color={suggestLoading || !userContext.trim() ? c.muted : '#fff'} style={{ marginRight: 8 }} />}
              <Text style={[s.primaryBtnText, { color: suggestLoading || !userContext.trim() ? c.muted : '#fff' }]}>
                {suggestLoading ? 'Thinking…' : 'Suggest 3 goals'}
              </Text>
            </TouchableOpacity>

            {/* Suggestions */}
            {parsedSuggestions.length > 0 && (
              <View style={{ gap: 10 }}>
                <View style={s.suggestHeader}>
                  <Text style={s.cardHeader}>SUGGESTED GOALS</Text>
                  <View style={s.successBadge}>
                    <Text style={s.successBadgeText}>{suggestResult?.model}</Text>
                  </View>
                </View>

                {parsedSuggestions.map((sug, i) => {
                  const open = expandedSuggestion === i
                  return (
                    <View key={i} style={[s.card, { borderColor: open ? c.primary + '66' : c.border, padding: 0 }]}>
                      <TouchableOpacity
                        onPress={() => setExpandedSuggestion(open ? null : i)}
                        style={s.sugHeader}
                      >
                        <View style={[s.sugNumber, { backgroundColor: c.primaryDim }]}>
                          <Text style={[s.sugNumberText, { color: c.primary }]}>{i + 1}</Text>
                        </View>
                        <Text style={[s.sugTitle, { color: c.text }]}>{sug.title}</Text>
                        <View style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}>
                          <Svg viewBox="0 0 16 16" fill="none" stroke={c.muted} strokeWidth={1.5} width={14} height={14}>
                            <Path d="M3 6l5 5 5-5" />
                          </Svg>
                        </View>
                      </TouchableOpacity>
                      {open && (
                        <View style={s.sugBodyCont}>
                          <Text style={[s.sugBodyText, { color: c.muted }]}>{sug.body}</Text>
                          <TouchableOpacity style={[s.addSugBtn, { backgroundColor: c.primary }]}>
                            <Text style={s.addSugBtnText}>+ Add to my goals</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  )
                })}
              </View>
            )}

            {suggestResult && parsedSuggestions.length === 0 && (
              <View style={s.card}>
                <Text style={[s.resultBody, { color: c.text }]}>{suggestResult.content}</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = (c: Colors) => StyleSheet.create({
  container: { flex: 1 },
  tabBar: { flexDirection: 'row', paddingHorizontal: 20, paddingBottom: 12, gap: 8 },
  tabButton: { flex: 1, paddingVertical: 9, borderRadius: 12, alignItems: 'center' },
  tabButtonText: { fontWeight: '600', fontSize: 14 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 24, paddingTop: 4 },
  tabContent: { gap: 14 },
  explainer: { borderRadius: 18, paddingVertical: 18, paddingHorizontal: 20, overflow: 'hidden' },
  explainerCircle1: { position: 'absolute', top: -24, right: -24, width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(255,255,255,0.07)' },
  explainerCircle2: { position: 'absolute', bottom: -20, left: -20, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.07)' },
  explainerBadge: { color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: '600', letterSpacing: 0.8, marginBottom: 6 },
  explainerTitle: { color: '#fff', fontWeight: '700', fontSize: 16, marginBottom: 4 },
  explainerBody: { color: 'rgba(255,255,255,0.8)', fontSize: 13, lineHeight: 19 },
  card: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 16, padding: 16, gap: 10 },
  cardHeader: { color: c.muted, fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },
  goalRow: { borderWidth: 1.5, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  goalRowTitle: { fontWeight: '600', fontSize: 13 },
  goalRowMeta: { fontSize: 11, marginTop: 2 },
  radioOuter: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioInner: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#fff' },
  divider: { width: 1 },
  summaryValue: { fontSize: 22, fontWeight: '700', marginTop: 2 },
  primaryBtn: { borderRadius: 14, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { fontWeight: '700', fontSize: 15 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  robotIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  resultTitle: { fontWeight: '600', fontSize: 13 },
  resultMeta: { fontSize: 11 },
  successBadge: { backgroundColor: '#10B98120', paddingVertical: 2, paddingHorizontal: 7, borderRadius: 99 },
  successBadgeText: { color: '#10B981', fontSize: 10, fontWeight: '700' },
  resultBody: { fontSize: 14, lineHeight: 23 },
  regenBtn: { borderWidth: 1, borderRadius: 10, paddingVertical: 7, alignItems: 'center' },
  regenBtnText: { fontSize: 12 },
  input: { borderWidth: 1, borderRadius: 10, paddingVertical: 9, paddingHorizontal: 12, fontSize: 14, height: 70, textAlignVertical: 'top' },
  styleRow: { flexDirection: 'row', gap: 8 },
  styleBtn: { flex: 1, paddingVertical: 10, paddingHorizontal: 6, borderRadius: 12, borderWidth: 1.5, alignItems: 'center', gap: 3 },
  styleBtnTitle: { fontWeight: '700', fontSize: 12 },
  styleBtnDesc: { fontSize: 10, textAlign: 'center' },
  suggestHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sugHeader: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  sugNumber: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  sugNumberText: { fontWeight: '700', fontSize: 13 },
  sugTitle: { flex: 1, fontWeight: '600', fontSize: 14, lineHeight: 18 },
  sugBodyCont: { paddingHorizontal: 16, paddingBottom: 14, gap: 12 },
  sugBodyText: { fontSize: 13, lineHeight: 20 },
  addSugBtn: { borderRadius: 10, paddingVertical: 9, alignItems: 'center' },
  addSugBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 }
})

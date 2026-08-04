import React, { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native'
import { useAuth } from '../context/AuthContext'

interface Colors {
  bg: string; surface: string; surface2: string; border: string
  text: string; muted: string; primary: string; primaryLight: string
  primaryDim: string; navBg: string; dark: boolean
}

export default function ProfileScreen({ colors: c, toggleDarkTheme, hapticsEnabled, toggleHaptics }: { colors: Colors, toggleDarkTheme: () => void, hapticsEnabled: boolean, toggleHaptics: () => void }) {
  const { user, logout, deleteAccount } = useAuth()
  
  const s = styles(c)

  if (!user) return null

  const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()

  const SettingToggle = ({ label, value, onToggle }: { label: string, value: boolean, onToggle: () => void }) => (
    <View style={s.settingRow}>
      <Text style={s.settingLabel}>{label}</Text>
      <TouchableOpacity
        onPress={onToggle}
        style={[s.toggleSwitch, { backgroundColor: value ? c.primary : c.surface2 }]}
      >
        <View style={[s.toggleKnob, { left: value ? 22 : 2 }]} />
      </TouchableOpacity>
    </View>
  )

  const handleLogout = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Sign Out", style: "destructive", onPress: logout }
      ]
    )
  }

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to permanently delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            try {
               await deleteAccount()
            } catch (e: any) {
               Alert.alert("Error", e.message || "Failed to delete account")
            }
          } 
        }
      ]
    )
  }

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.scrollContent}>
        
        {/* Profile Card */}
        <View style={s.profileCard}>
          <View style={s.avatarWrap}>
            <Text style={s.avatarText}>{initials}</Text>
          </View>
          <Text style={s.userName}>{user.name}</Text>
          <Text style={s.userEmail}>{user.email}</Text>
        </View>

        <Text style={s.sectionTitle}>APP SETTINGS</Text>
        <View style={s.settingsGroup}>
          <SettingToggle label="Haptic Feedback" value={hapticsEnabled} onToggle={toggleHaptics} />
          <View style={s.divider} />
          <SettingToggle label="Dark Theme" value={c.dark} onToggle={toggleDarkTheme} />
          <View style={s.divider} />
          <View style={s.settingRow}>
            <Text style={s.settingLabel}>Version</Text>
            <Text style={s.versionText}>1.0.0</Text>
          </View>
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={s.signOutBtn} onPress={handleLogout}>
          <Text style={s.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        {/* Delete Account */}
        <TouchableOpacity style={s.deleteBtn} onPress={handleDeleteAccount}>
          <Text style={s.deleteText}>Delete Account</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  )
}

const styles = (c: Colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.bg },
  scrollContent: { paddingHorizontal: 20, paddingVertical: 24, gap: 8 },
  
  profileCard: { alignItems: 'center', backgroundColor: c.surface, paddingVertical: 32, paddingHorizontal: 20, borderRadius: 20, borderWidth: 1, borderColor: c.border, marginBottom: 12 },
  avatarWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: c.primaryDim, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  avatarText: { fontSize: 28, fontWeight: '700', color: c.primary },
  userName: { fontSize: 20, fontWeight: '700', color: c.text },
  userEmail: { fontSize: 14, color: c.muted, marginTop: 4 },

  sectionTitle: { fontSize: 11, fontWeight: '600', color: c.muted, letterSpacing: 1, marginLeft: 8, marginTop: 12, marginBottom: 4 },
  settingsGroup: { backgroundColor: c.surface, borderRadius: 16, borderWidth: 1, borderColor: c.border, overflow: 'hidden' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  settingLabel: { fontSize: 15, fontWeight: '500', color: c.text },
  divider: { height: 1, backgroundColor: c.border, marginHorizontal: 16 },
  versionText: { fontSize: 14, color: c.muted },

  toggleSwitch: { width: 40, height: 22, borderRadius: 99, justifyContent: 'center' },
  toggleKnob: { position: 'absolute', width: 16, height: 16, borderRadius: 8, backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, shadowOffset: { width: 0, height: 2 } },

  signOutBtn: { marginTop: 24, backgroundColor: 'rgba(239, 68, 68, 0.1)', paddingVertical: 14, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)' },
  signOutText: { color: '#EF4444', fontSize: 15, fontWeight: '600' },
  
  deleteBtn: { marginTop: 12, backgroundColor: 'transparent', paddingVertical: 14, borderRadius: 16, alignItems: 'center' },
  deleteText: { color: c.muted, fontSize: 13, fontWeight: '500' }
})

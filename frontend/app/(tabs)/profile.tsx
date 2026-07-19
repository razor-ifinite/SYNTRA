import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { SYNTRA_THEME } from '../../constants/Theme';
import { useAuth } from '../../src/hooks/useAuth';
import { useNotificationLogs } from '../../src/hooks/useNotifications';
import { SkeletonLoader } from '../../src/components/SkeletonLoader';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { data: logs, isLoading } = useNotificationLogs(user?.id);

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {user?.name ? user.name.substring(0, 2).toUpperCase() : 'ME'}
        </Text>
      </View>
      <Text style={styles.name}>{user?.name || 'User'}</Text>
      <Text style={styles.email}>{user?.email || 'user@example.com'}</Text>

      <Pressable style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>LOGOUT</Text>
      </Pressable>

      <Text style={styles.sectionTitle}>Audit Log</Text>
    </View>
  );

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View>
          <SkeletonLoader style={{ height: 80, marginBottom: 12 }} />
          <SkeletonLoader style={{ height: 80, marginBottom: 12 }} />
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No notifications sent yet.</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={logs || []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        renderItem={({ item }) => (
          <View style={styles.logCard}>
            <View style={styles.logHeader}>
              <Text style={styles.timestamp}>
                {new Date(item.sentAt).toLocaleString()}
              </Text>
              <View style={[styles.badge, item.status === 'SENT' ? styles.badgeSent : styles.badgeFailed]}>
                <Text style={[styles.badgeText, item.status === 'FAILED' && styles.badgeTextFailed]}>
                  {item.status}
                </Text>
              </View>
            </View>
            <Text style={styles.message}>{item.message}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: SYNTRA_THEME.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    color: SYNTRA_THEME.colors.white,
  },
  name: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    color: SYNTRA_THEME.colors.textPrimary,
    marginBottom: 4,
  },
  email: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: SYNTRA_THEME.colors.textMuted,
    marginBottom: 24,
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: SYNTRA_THEME.colors.danger,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginBottom: 40,
  },
  logoutText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: SYNTRA_THEME.colors.danger,
  },
  sectionTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: SYNTRA_THEME.colors.textPrimary,
    alignSelf: 'flex-start',
  },
  logCard: {
    backgroundColor: SYNTRA_THEME.colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timestamp: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: SYNTRA_THEME.colors.textMuted,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeSent: {
    backgroundColor: SYNTRA_THEME.colors.success,
  },
  badgeFailed: {
    backgroundColor: SYNTRA_THEME.colors.danger,
  },
  badgeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    color: SYNTRA_THEME.colors.black,
  },
  badgeTextFailed: {
    color: SYNTRA_THEME.colors.white,
  },
  message: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: SYNTRA_THEME.colors.white,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: SYNTRA_THEME.colors.textPrimary,
  },
});
